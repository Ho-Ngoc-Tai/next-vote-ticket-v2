export type UserStatus = "Active" | "Pending" | "Inactive" | "Suspended";
export type UserPlan = "Basic" | "Professional" | "Enterprise";

export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: string;
  plan: UserPlan;
  billing: string;
  status: UserStatus;
  joinedDate: string;
  lastLogin: string;
}

export interface UserFormValues {
  name: string;
  email: string;
  role: string;
  plan: UserPlan;
  billing: string;
  status: UserStatus;
}
