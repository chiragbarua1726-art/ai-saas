"use client";

import { use } from "react";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { useMessages } from "@/hooks/use-messages";
import { useCurrentProject } from "@/lib/providers/project-provider";
import { Empty } from "@/components/ui/empty";
import { FolderOpen } from "lucide-react";

export default function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { currentProject, isLoading: projectLoading } = useCurrentProject();
  const {
    messages,
    isLoading,
    sendMessage,
    isStreaming,
    streamingContent,
  } = useMessages(id);

  if (!projectLoading && !currentProject) {
    return (
      <div className="flex h-full items-center justify-center">
        <Empty
          icon={FolderOpen}
          title="No project selected"
          description="Please select a project to view this conversation"
        />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] -m-4 md:-m-6">
      <div className="w-80 shrink-0">
        <ChatSidebar selectedId={id} />
      </div>
      <div className="flex flex-1 flex-col border-l">
        <ChatMessages
          messages={messages}
          isLoading={isLoading}
          isStreaming={isStreaming}
          streamingContent={streamingContent}
        />
        <ChatInput
          onSend={sendMessage}
          disabled={isStreaming}
          placeholder={
            isStreaming
              ? "Waiting for response..."
              : "Type your message..."
          }
        />
      </div>
    </div>
  );
}
