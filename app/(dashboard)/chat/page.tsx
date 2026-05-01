"use client";

import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { useCurrentProject } from "@/lib/providers/project-provider";
import { Empty } from "@/components/ui/empty";
import { FolderOpen, MessageSquare } from "lucide-react";

export default function ChatPage() {
  const { currentProject, isLoading } = useCurrentProject();

  if (!isLoading && !currentProject) {
    return (
      <div className="flex h-full items-center justify-center">
        <Empty
          icon={FolderOpen}
          title="No project selected"
          description="Please select a project to start chatting"
        />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] -m-4 md:-m-6">
      <div className="w-80 shrink-0">
        <ChatSidebar />
      </div>
      <div className="flex-1 flex items-center justify-center border-l">
        <Empty
          icon={MessageSquare}
          title="Select a conversation"
          description="Choose a conversation from the sidebar or create a new one"
        />
      </div>
    </div>
  );
}
