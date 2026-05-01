import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/services/auth.service";
import {
  getMessages,
  addMessage,
  getConversationById,
} from "@/lib/services/chat.service";
import { enrichAIContext } from "@/lib/services/integration.service";
import { SendMessageRequestSchema } from "@/lib/types";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const messages = await getMessages(id, user._id);

    return NextResponse.json({ messages });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "No access to conversation") {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    console.error("Get messages error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: conversationId } = await params;
    const body = await request.json();

    const validatedData = SendMessageRequestSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validatedData.error.flatten() },
        { status: 400 }
      );
    }

    // Get conversation to get project ID
    const conversation = await getConversationById(conversationId, user._id);
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Save user message
    await addMessage(conversationId, user._id, "user", validatedData.data.content);

    // Get integration context
    const integrationContext = await enrichAIContext(conversation.projectId);

    // Build messages for AI
    const existingMessages = await getMessages(conversationId, user._id);
    const aiMessages = existingMessages.map((msg) => ({
      role: msg.role as "user" | "assistant" | "system",
      content: msg.content,
    }));

    // System prompt
    const systemPrompt = `You are an intelligent AI assistant for a SaaS platform. You help users with their business operations and answer questions about their data.

${integrationContext ? `\n${integrationContext}` : ""}

Be helpful, concise, and professional. When referencing integration data, provide specific details and insights.`;

    // Stream AI response using OpenRouter
    const result = streamText({
      model: openai("gpt-4o-mini", {
        baseURL: "https://openrouter.ai/api/v1",
      }),
      system: systemPrompt,
      messages: aiMessages,
    });

    // Create a transform stream to collect the full response
    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        const reader = (await result.textStream).getReader();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            fullResponse += value;
            controller.enqueue(new TextEncoder().encode(value));
          }

          // Save assistant message after streaming completes
          await addMessage(conversationId, user._id, "assistant", fullResponse);

          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "No access to conversation") {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    console.error("Send message error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
