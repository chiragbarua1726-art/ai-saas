"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

interface IntegrationToggleProps {
  name: string;
  description: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  isUpdating?: boolean;
  disabled?: boolean;
}

export function IntegrationToggle({
  name,
  description,
  enabled,
  onToggle,
  isUpdating,
  disabled,
}: IntegrationToggleProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">{name}</CardTitle>
            <Badge variant={enabled ? "default" : "secondary"}>
              {enabled ? "Active" : "Inactive"}
            </Badge>
          </div>
          {isUpdating ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <Switch
              checked={enabled}
              onCheckedChange={onToggle}
              disabled={disabled || isUpdating}
            />
          )}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          {enabled ? (
            <p>
              This integration is active. Your AI assistant will have access to{" "}
              {name.toLowerCase()} data when responding to queries.
            </p>
          ) : (
            <p>
              Enable this integration to allow your AI assistant to access{" "}
              {name.toLowerCase()} data when responding to queries.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
