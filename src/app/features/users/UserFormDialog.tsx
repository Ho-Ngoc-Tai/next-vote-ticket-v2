"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { Button } from "@components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog";
import { Input } from "@components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import type { UserFormValues } from "./types";

interface UserFormDialogProps {
  onAddUser: (user: UserFormValues) => void;
}

const roles = ["Admin", "Editor", "Author", "Maintainer", "Subscriber"];
const plans = ["Basic", "Professional", "Enterprise"];
const billings = ["Auto Debit", "UPI", "Paypal", "Credit Card"];
const statuses = ["Active", "Pending", "Inactive", "Suspended"];

export function UserFormDialog({ onAddUser }: UserFormDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<UserFormValues>({
    name: "",
    email: "",
    role: "",
    plan: "Basic",
    billing: "Credit Card",
    status: "Active",
  });

  const handleChange = (field: keyof UserFormValues, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name || !form.email || !form.role) return;
    onAddUser(form);
    setForm({
      name: "",
      email: "",
      role: "",
      plan: "Basic",
      billing: "Credit Card",
      status: "Active",
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer">
          <Plus className="size-4" />
          Add New User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>Create a new user account. Click save when you&apos;re done.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              placeholder="Enter full name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              placeholder="Enter email address"
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={form.role} onValueChange={(value) => handleChange("role", value)}>
                <SelectTrigger className="w-full cursor-pointer">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Plan</label>
              <Select
                value={form.plan}
                onValueChange={(value) => handleChange("plan", value as UserFormValues["plan"])}
              >
                <SelectTrigger className="w-full cursor-pointer">
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan} value={plan}>
                      {plan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Billing</label>
              <Select value={form.billing} onValueChange={(value) => handleChange("billing", value)}>
                <SelectTrigger className="w-full cursor-pointer">
                  <SelectValue placeholder="Select billing" />
                </SelectTrigger>
                <SelectContent>
                  {billings.map((billing) => (
                    <SelectItem key={billing} value={billing}>
                      {billing}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={form.status}
                onValueChange={(value) => handleChange("status", value as UserFormValues["status"])}
              >
                <SelectTrigger className="w-full cursor-pointer">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="cursor-pointer">
              Save User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
