export type DashboardDeal = {
  id: number;
  name: string;
  owner: string;
  stage: string;
  amount: string;
};

export const deals: DashboardDeal[] = [
  {
    id: 1,
    name: "Enterprise subscription renewal",
    owner: "Olivia Martinez",
    stage: "Negotiation",
    amount: "$24,000",
  },
  {
    id: 2,
    name: "Upgrade to Pro plan",
    owner: "James Wilson",
    stage: "Proposal",
    amount: "$9,600",
  },
  {
    id: 3,
    name: "Onboarding support package",
    owner: "Sophie Chen",
    stage: "Discovery",
    amount: "$4,200",
  },
  {
    id: 4,
    name: "New marketing workspace",
    owner: "Daniel Park",
    stage: "Closed Won",
    amount: "$12,800",
  },
];
