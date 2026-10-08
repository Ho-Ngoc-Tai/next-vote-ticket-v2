"use client";

import { StatisticCards } from "@components/modules/statistic";
import type { StatisticMetric } from "@components/modules/statistic";
import { Activity, DollarSign, UserPlus, Users } from "lucide-react";

const dashboardMetrics: StatisticMetric[] = [
  {
    title: "Total Revenue",
    current: "$1,250",
    previous: "$1,112",
    growth: 12.5,
    icon: DollarSign,
  },
  {
    title: "New Customers",
    current: "1,234",
    previous: "1,542",
    growth: -20.0,
    icon: UserPlus,
  },
  {
    title: "Active Accounts",
    current: "45,678",
    previous: "40,602",
    growth: 12.5,
    icon: Users,
  },
  {
    title: "Growth Rate",
    current: "4.5%",
    previous: "4.3%",
    growth: 4.5,
    icon: Activity,
  },
];

export function SectionCards() {
  return <StatisticCards metrics={dashboardMetrics} />;
}
