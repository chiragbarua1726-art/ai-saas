"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MessageSquare,
  Users,
  Send,
  Bot,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import type { Widget } from "@/lib/types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  MessageSquare,
  Users,
  Send,
  Bot,
};

interface StatsCardProps {
  widget: Widget;
}

// Mock stats data - in real app, this would come from API
const mockStats: Record<string, { value: string; change: number }> = {
  conversations: { value: "1,234", change: 12.5 },
  users: { value: "567", change: 8.2 },
  messages: { value: "45,678", change: -2.3 },
  responses: { value: "34,521", change: 15.7 },
};

export function StatsCard({ widget }: StatsCardProps) {
  const iconName = (widget.config?.icon as string) || "MessageSquare";
  const metric = (widget.config?.metric as string) || "conversations";
  const Icon = iconMap[iconName] || MessageSquare;
  const stats = mockStats[metric] || { value: "0", change: 0 };
  const isPositive = stats.change >= 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {widget.title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.value}</div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {isPositive ? (
            <TrendingUp className="h-3 w-3 text-green-500" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500" />
          )}
          <span className={isPositive ? "text-green-500" : "text-red-500"}>
            {isPositive ? "+" : ""}
            {stats.change}%
          </span>
          <span>from last month</span>
        </div>
      </CardContent>
    </Card>
  );
}
