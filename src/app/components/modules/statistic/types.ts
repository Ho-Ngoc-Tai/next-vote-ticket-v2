import type { LucideIcon } from "lucide-react";

/** Một thẻ thống kê: title, giá trị hiện tại/trước, % growth, icon */
export interface StatisticMetric {
  title: string;
  current: string;
  previous: string;
  growth: number;
  icon: LucideIcon;
}

export interface StatisticCardsProps {
  metrics: StatisticMetric[];
  /** Grid class (default: grid gap-4 sm:grid-cols-2 lg:grid-cols-4) */
  className?: string;
  /** Class cho mỗi Card */
  cardClassName?: string;
}
