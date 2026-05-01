"use client";

import { useRouter } from "next/navigation";
import { Plus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useConversations } from "@/hooks/use-conversations";
import { useCurrentProject } from "@/lib/providers/project-provider";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/lib/types";

interface ChatSidebarProps {
  selectedId?: string;
  onSelect?: (conversation: Conversation) => void;
}

export function ChatSidebar({ selectedId, onSelect }: ChatSidebarProps) {
  const router = useRouter();
  const { currentProject } = useCurrentProject();
  const { conversations, isLoading, createConversationAsync, isCreating } =
    useConversations();

  const handleNewConversation = async () => {
    if (!currentProject) return;

    try {
      const conversation = await createConversationAsync({
        projectId: currentProject._id,
        title: "New Conversation",
      });
      router.push(`/chat/${conversation._id}`);
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  const handleSelect = (conversation: Conversation) => {
    if (onSelect) {
      onSelect(conversation);
    }
    router.push(`/chat/${conversation._id}`);
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="flex h-full flex-col border-r">
      <div className="p-4">
        <Button
          onClick={handleNewConversation}
          disabled={!currentProject || isCreating}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          {isCreating ? "Creating..." : "New Conversation"}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        {isLoading ? (
          <div className="space-y-2 p-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No conversations yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Start a new conversation to begin
            </p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {conversations.map((conversation) => (
              <button
                key={conversation._id}
                onClick={() => handleSelect(conversation)}
                className={cn(
                  "w-full rounded-lg p-3 text-left transition-colors hover:bg-accent",
                  selectedId === conversation._id && "bg-accent"
                )}
              >
                <div className="flex items-start gap-3">
                  <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {conversation.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(conversation.updatedAt)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
