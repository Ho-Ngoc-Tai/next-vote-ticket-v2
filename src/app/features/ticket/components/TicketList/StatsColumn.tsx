"use client";

import { cn } from "@/lib/utils";

export interface StatsColumnProps {
  votes?: number;
  answers?: number;
  views?: number;
  className?: string;
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-1 py-2 cursor-default" role="group">
      <span className="text-xs font-medium tabular-nums">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export function StatsColumn({ answers = 0, views = 0, className }: StatsColumnProps) {
  return (
    <div
      className={cn("flex flex-row sm:flex-col gap-2 sm:gap-0", className)}
      role="list"
      aria-label="Question statistics"
    >
      <StatItem label="replies" value={answers} />
      <StatItem label="views" value={views} />
    </div>
  );
}
