"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Widget } from "@/lib/types";

interface ActivityWidgetProps {
  widget: Widget;
}

// Mock activity data
const activities = [
  {
    id: "1",
    user: "John Doe",
    action: "Started a new conversation",
    time: "2 min ago",
  },
  {
    id: "2",
    user: "Jane Smith",
    action: "Asked about product pricing",
    time: "5 min ago",
  },
  {
    id: "3",
    user: "Mike Johnson",
    action: "Received 15 AI responses",
    time: "12 min ago",
  },
  {
    id: "4",
    user: "Sarah Wilson",
    action: "Enabled CRM integration",
    time: "25 min ago",
  },
  {
    id: "5",
    user: "Tom Brown",
    action: "Created a support ticket",
    time: "1 hour ago",
  },
];

export function ActivityWidget({ widget }: ActivityWidgetProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100%-60px)] px-6">
          <div className="space-y-4 pb-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getInitials(activity.user)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {activity.user}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activity.action}
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
