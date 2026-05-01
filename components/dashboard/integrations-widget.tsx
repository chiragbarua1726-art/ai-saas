"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCurrentProject } from "@/lib/providers/project-provider";
import type { Widget } from "@/lib/types";

interface IntegrationsWidgetProps {
  widget: Widget;
}

export function IntegrationsWidget({ widget }: IntegrationsWidgetProps) {
  const { currentProject } = useCurrentProject();

  const integrations = [
    {
      name: "CRM",
      description: "Customer relationship management",
      enabled: currentProject?.integrations.crm ?? false,
    },
    {
      name: "Shopify",
      description: "E-commerce platform",
      enabled: currentProject?.integrations.shopify ?? false,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="flex items-center gap-3 rounded-lg border p-3 min-w-[200px]"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{integration.name}</p>
                <p className="text-xs text-muted-foreground">
                  {integration.description}
                </p>
              </div>
              <Badge variant={integration.enabled ? "default" : "secondary"}>
                {integration.enabled ? "Active" : "Inactive"}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
