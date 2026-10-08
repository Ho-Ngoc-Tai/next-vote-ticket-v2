"use client";

import { Badge } from "@components/ui/badge";
import { Card, CardContent } from "@components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react";
import type { StatisticCardsProps } from "./types";

export function StatisticCards({
  metrics,
  className = "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
  cardClassName,
}: StatisticCardsProps) {
  return (
    <div className={className}>
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title ?? index} className={cn("border", cardClassName)}>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Icon className="size-6 text-muted-foreground" />
                <Badge
                  variant="outline"
                  className={cn(
                    metric.growth >= 0
                      ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/20 dark:text-green-400"
                      : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400"
                  )}
                >
                  {metric.growth >= 0 ? (
                    <>
                      <TrendingUp className="me-1 size-3" />+{metric.growth}%
                    </>
                  ) : (
                    <>
                      <TrendingDown className="me-1 size-3" />
                      {metric.growth}%
                    </>
                  )}
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                <div className="text-2xl font-bold">{metric.current}</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>from {metric.previous}</span>
                  <ArrowUpRight className="size-3" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
