"use client";

import { useCallback, useState } from "react";

import type { DataTableFetchDataParams, FilterValues } from "@components/modules/datatable";
import PageHeader from "@components/modules/page-header";
import { UserStateCards } from "@features/users/UserStateCards";
import { UserTable } from "@features/users/UserTable";
import { initialUsersData } from "@features/users/data";
import type { User, UserFormValues } from "@features/users/types";

const DEFAULT_PAGE_SIZE = 10;

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>(initialUsersData);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [total, setTotal] = useState(initialUsersData.length);
  const [loading, setLoading] = useState(false);

  /** Load users from API (filter + pagination). Replace with your real API. */
  const loadUsers = useCallback(async (filters: FilterValues, page: number, size: number) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (typeof value === "string" && value) params.set(key, value);
    });
    params.set("page", String(page + 1));
    params.set("pageSize", String(size));
    try {
      const res = await fetch(`/api/users?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.users ?? data.data ?? []);
      const nextTotal = typeof data.total === "number" ? data.total : list.length;
      setUsers(list);
      setTotal(nextTotal);
    } catch {
      setUsers(initialUsersData);
      setTotal(initialUsersData.length);
    }
  }, []);

  /** When filter, page or pageSize changes: update state and fetch. */
  const fetchData = useCallback(
    async (params: DataTableFetchDataParams) => {
      if (params.filterValues !== undefined) setFilterValues(params.filterValues);
      setPageIndex(params.pageIndex ?? 0);
      setPageSize(params.pageSize ?? 0);
      setLoading(true);
      try {
        await loadUsers(params.filterValues ?? filterValues, params.pageIndex ?? 0, params.pageSize ?? 0);
      } finally {
        setLoading(false);
      }
    },
    [loadUsers, filterValues]
  );

  const generateAvatar = (name: string) => {
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleAddUser = (userData: UserFormValues) => {
    const newUser: User = {
      id: Math.max(...users.map((u) => u.id)) + 1,
      name: userData.name,
      email: userData.email,
      avatar: generateAvatar(userData.name),
      role: userData.role,
      plan: userData.plan,
      billing: userData.billing,
      status: userData.status,
      joinedDate: new Date().toISOString().split("T")[0],
      lastLogin: new Date().toISOString().split("T")[0],
    };
    setUsers((prev) => [newUser, ...prev]);
  };

  const handleDeleteUser = (id: number) => {
    setUsers((prev) => prev.filter((user) => user.id !== id));
  };

  const handleEditUser = (_user: User) => {};

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Manage users and permissions." />

      <UserStateCards />

      <UserTable
        users={users}
        fetchData={fetchData}
        filterValues={filterValues}
        pagination={{ pageIndex, pageSize }}
        total={total}
        loading={loading}
        onDeleteUser={handleDeleteUser}
        onEditUser={handleEditUser}
        onAddUser={handleAddUser}
      />
    </div>
  );
};

export default UsersPage;
