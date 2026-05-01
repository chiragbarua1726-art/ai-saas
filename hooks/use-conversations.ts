"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Conversation } from "@/lib/types";

export function useConversations() {
  const queryClient = useQueryClient();

  const {
    data: conversations,
    isLoading,
    error,
    refetch,
  } = useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await fetch("/api/conversations");
      if (!response.ok) {
        if (response.status === 400) {
          // No project selected
          return [];
        }
        throw new Error("Failed to fetch conversations");
      }
      const data = await response.json();
      return data.conversations;
    },
  });

  const createMutation = useMutation({
    mutationFn: async ({
      projectId,
      title,
    }: {
      projectId: string;
      title?: string;
    }) => {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, title }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create conversation");
      }

      const data = await response.json();
      return data.conversation as Conversation;
    },
    onSuccess: (newConversation) => {
      queryClient.setQueryData<Conversation[]>(
        ["conversations"],
        (old = []) => [newConversation, ...old]
      );
    },
  });

  return {
    conversations: conversations || [],
    isLoading,
    error,
    refetch,
    createConversation: createMutation.mutate,
    createConversationAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}
