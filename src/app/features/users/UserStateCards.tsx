import { StatisticCards } from "@components/modules/statistic";
import type { StatisticMetric } from "@components/modules/statistic";
import { Clock5, CreditCard, UserCheck, Users } from "lucide-react";

const userMetrics: StatisticMetric[] = [
  {
    title: "Total Users",
    current: "2,847",
    previous: "2,156",
    growth: 32.1,
    icon: Users,
  },
  {
    title: "Paid Users",
    current: "1,423",
    previous: "1,089",
    growth: 30.7,
    icon: CreditCard,
  },
  {
    title: "Active Users",
    current: "2,156",
    previous: "1,834",
    growth: 17.6,
    icon: UserCheck,
  },
  {
    title: "Pending Users",
    current: "234",
    previous: "312",
    growth: -25.0,
    icon: Clock5,
  },
];

export function UserStateCards() {
  return <StatisticCards metrics={userMetrics} />;
}
