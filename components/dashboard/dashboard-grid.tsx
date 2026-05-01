"use client";

import { useDashboardConfig } from "@/hooks/use-dashboard-config";
import { StatsCard } from "./stats-card";
import { ChartWidget } from "./chart-widget";
import { ActivityWidget } from "./activity-widget";
import { IntegrationsWidget } from "./integrations-widget";
import { Skeleton } from "@/components/ui/skeleton";
import type { Widget } from "@/lib/types";

const widgetComponents: Record<
  string,
  React.ComponentType<{ widget: Widget }>
> = {
  stats: StatsCard,
  chart: ChartWidget,
  activity: ActivityWidget,
  integrations: IntegrationsWidget,
};

export function DashboardGrid() {
  const { widgets, isLoading } = useDashboardConfig();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <Skeleton className="h-24 rounded-xl" />
      </div>
    );
  }

  // Group widgets by row (based on y position)
  const rows: Map<number, Widget[]> = new Map();
  widgets.forEach((widget) => {
    const y = widget.position.y;
    if (!rows.has(y)) {
      rows.set(y, []);
    }
    rows.get(y)!.push(widget);
  });

  // Sort rows by y position
  const sortedRows = Array.from(rows.entries()).sort(([a], [b]) => a - b);

  return (
    <div className="space-y-4">
      {sortedRows.map(([rowY, rowWidgets]) => {
        // Sort widgets in each row by x position
        const sortedWidgets = rowWidgets.sort(
          (a, b) => a.position.x - b.position.x
        );

        // Determine grid columns based on widget widths
        const isStatsRow = sortedWidgets.every((w) => w.type === "stats");
        const isFullWidth = sortedWidgets.length === 1 && sortedWidgets[0].position.w >= 4;

        let gridClass = "grid gap-4";
        if (isStatsRow) {
          gridClass += " md:grid-cols-2 lg:grid-cols-4";
        } else if (!isFullWidth) {
          gridClass += " md:grid-cols-2";
        }

        // Determine row height
        const maxH = Math.max(...sortedWidgets.map((w) => w.position.h));
        const rowHeight = maxH >= 2 ? "min-h-[280px]" : "";

        return (
          <div key={rowY} className={gridClass}>
            {sortedWidgets.map((widget) => {
              const WidgetComponent = widgetComponents[widget.type];
              if (!WidgetComponent) return null;

              return (
                <div key={widget.id} className={rowHeight}>
                  <WidgetComponent widget={widget} />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
