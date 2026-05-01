"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { IntegrationToggle } from "@/components/settings/integration-toggle";
import { useCurrentProject } from "@/lib/providers/project-provider";
import { useUpdateIntegrations } from "@/hooks/use-projects";
import { useAuth } from "@/hooks/use-auth";
import { Empty } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderOpen, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user } = useAuth();
  const { currentProject, isLoading } = useCurrentProject();
  const { updateIntegrations, isUpdating } = useUpdateIntegrations(
    currentProject?._id || ""
  );

  const isAdmin = user?.role === "admin";

  const handleIntegrationToggle = (
    integration: "crm" | "shopify",
    enabled: boolean
  ) => {
    if (!isAdmin) {
      toast.error("Only admins can modify integrations");
      return;
    }

    updateIntegrations(
      { [integration]: enabled },
      {
        onSuccess: () => {
          toast.success(
            `${integration.toUpperCase()} integration ${enabled ? "enabled" : "disabled"}`
          );
        },
        onError: (error) => {
          toast.error(error.message || "Failed to update integration");
        },
      }
    );
  };

  if (!isLoading && !currentProject) {
    return (
      <div className="flex h-full items-center justify-center">
        <Empty
          icon={FolderOpen}
          title="No project selected"
          description="Please select a project to view settings"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your project settings and integrations.
        </p>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Your Profile
          </CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-sm">{user?.name || "Loading..."}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-sm">{user?.email || "Loading..."}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Role</p>
              <Badge variant={isAdmin ? "default" : "secondary"} className="mt-1">
                {user?.role || "Loading..."}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Current Project
          </CardTitle>
          <CardDescription>Project details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Project Name
                </p>
                <p className="text-sm">{currentProject?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Project Slug
                </p>
                <p className="text-sm font-mono text-xs">
                  {currentProject?.slug}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Integrations */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Integrations
          </h2>
          <p className="text-sm text-muted-foreground">
            Enable integrations to enhance your AI assistant with external data.
            {!isAdmin && (
              <span className="text-amber-600 ml-1">
                (Admin access required to modify)
              </span>
            )}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <IntegrationToggle
            name="CRM"
            description="Connect to your CRM to access customer data, deal pipelines, and contact information."
            enabled={currentProject?.integrations.crm ?? false}
            onToggle={(enabled) => handleIntegrationToggle("crm", enabled)}
            isUpdating={isUpdating}
            disabled={!isAdmin || isLoading}
          />
          <IntegrationToggle
            name="Shopify"
            description="Connect to Shopify to access product inventory, orders, and revenue data."
            enabled={currentProject?.integrations.shopify ?? false}
            onToggle={(enabled) => handleIntegrationToggle("shopify", enabled)}
            isUpdating={isUpdating}
            disabled={!isAdmin || isLoading}
          />
        </div>
      </div>
    </div>
  );
}
