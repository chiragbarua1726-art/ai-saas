"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import type { Message } from "@/lib/types";

export function useMessages(conversationId: string | null) {
  const queryClient = useQueryClient();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");

  const {
    data: messages,
    isLoading,
    error,
    refetch,
  } = useQuery<Message[]>({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      const response = await fetch(
        `/api/conversations/${conversationId}/messages`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      const data = await response.json();
      return data.messages;
    },
    enabled: !!conversationId,
  });

  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversationId || isStreaming) return;

      // Optimistically add user message
      const userMessage: Message = {
        _id: `temp-${Date.now()}`,
        conversationId,
        role: "user",
        content,
        createdAt: new Date(),
      };

      queryClient.setQueryData<Message[]>(
        ["messages", conversationId],
        (old = []) => [...old, userMessage]
      );

      setIsStreaming(true);
      setStreamingContent("");

      try {
        const response = await fetch(
          `/api/conversations/${conversationId}/messages`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No reader available");

        const decoder = new TextDecoder();
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          fullContent += chunk;
          setStreamingContent(fullContent);
        }

        // Refetch messages to get the saved assistant message
        await refetch();
      } catch (error) {
        console.error("Error sending message:", error);
        // Remove optimistic message on error
        queryClient.setQueryData<Message[]>(
          ["messages", conversationId],
          (old = []) => old.filter((m) => m._id !== userMessage._id)
        );
      } finally {
        setIsStreaming(false);
        setStreamingContent("");
      }
    },
    [conversationId, isStreaming, queryClient, refetch]
  );

  return {
    messages: messages || [],
    isLoading,
    error,
    refetch,
    sendMessage,
    isStreaming,
    streamingContent,
  };
}
