import * as React from "react";
import type { ColumnDef, Table } from "@tanstack/react-table";
import { Download, Eye, Lock, Mail, Pencil, Search, Trash2 } from "lucide-react";

import { DataTable, DataTableFilterBar, DataTableRowActions } from "@components/modules/datatable";
import type {
  DataTableFetchDataParams,
  DataTableFilterConfig,
  DataTablePaginationState,
  DataTableRowActionItem,
} from "@components/modules/datatable";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Checkbox } from "@components/ui/checkbox";
import { Input } from "@components/ui/input";
import type { User, UserFormValues } from "./types";
import { UserFormDialog } from "./UserFormDialog";

const USER_TABLE_FILTERS: DataTableFilterConfig[] = [
  {
    columnId: "role",
    label: "Role",
    placeholder: "Select Role",
    options: [
      { value: "all", label: "All Roles" },
      { value: "Admin", label: "Admin" },
      { value: "Author", label: "Author" },
      { value: "Editor", label: "Editor" },
      { value: "Maintainer", label: "Maintainer" },
      { value: "Subscriber", label: "Subscriber" },
    ],
  },
  {
    columnId: "plan",
    label: "Plan",
    placeholder: "Select Plan",
    options: [
      { value: "all", label: "All Plans" },
      { value: "Basic", label: "Basic" },
      { value: "Professional", label: "Professional" },
      { value: "Enterprise", label: "Enterprise" },
    ],
  },
  {
    columnId: "status",
    label: "Status",
    placeholder: "Select Status",
    options: [
      { value: "all", label: "All Status" },
      { value: "Active", label: "Active" },
      { value: "Pending", label: "Pending" },
      { value: "Inactive", label: "Inactive" },
      { value: "Suspended", label: "Suspended" },
    ],
  },
];

function USER_TABLE_ACTIONS(
  onEditUser: (user: User) => void,
  onDeleteUser: (id: number) => void
): DataTableRowActionItem<User>[] {
  return [
    {
      label: "View Details",
      onClick: () => {},
      icon: <Eye className="size-4" />,
    },
    {
      label: "Edit",
      onClick: onEditUser,
      icon: <Pencil className="size-4" />,
    },
    {
      type: "more",
      items: [
        { label: "Send Email", onClick: () => {}, icon: <Mail className="size-4" /> },
        { label: "Reset Password", onClick: () => {}, icon: <Lock className="size-4" /> },
        {
          label: "Delete User",
          onClick: (user: User) => onDeleteUser(user.id),
          icon: <Trash2 className="size-4" />,
          destructive: true,
        },
      ],
    },
  ];
}

interface UserTableProps {
  users: User[];
  /** Called when filter, page or pageSize changes. Parent fetches and updates data + pagination. */
  fetchData: (params: DataTableFetchDataParams) => void | Promise<void>;
  /** Current filter values (so table can pass them when calling fetchData on pagination change). */
  filterValues: Record<string, string>;
  /** Pagination state (pageIndex, pageSize). */
  pagination: DataTablePaginationState;
  /** Tổng số phần tử (từ API). Dùng để tính số trang. */
  total: number;
  /** Đang tải dữ liệu (hiển thị overlay trên table). */
  loading?: boolean;
  onDeleteUser: (id: number) => void;
  onEditUser: (user: User) => void;
  onAddUser: (userData: UserFormValues) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20";
    case "Pending":
      return "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20";
    case "Suspended":
      return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20";
    case "Inactive":
      return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20";
    default:
      return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20";
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case "Admin":
      return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20";
    case "Editor":
      return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20";
    case "Author":
      return "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20";
    case "Maintainer":
      return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20";
    case "Subscriber":
      return "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20";
    default:
      return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20";
  }
};

export function UserTable({
  users,
  fetchData,
  pagination,
  loading,
  onDeleteUser,
  onEditUser,
  onAddUser,
}: UserTableProps) {
  const [globalFilter, setGlobalFilter] = React.useState("");

  const columns: ColumnDef<User>[] = React.useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center justify-center px-2">
            <Checkbox
              checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center px-2">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 50,
      },
      {
        accessorKey: "name",
        header: "User",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-xs font-medium">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium">{user.name}</span>
                <span className="text-sm text-muted-foreground">{user.email}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
          const role = row.getValue("role") as string;
          return (
            <Badge variant="secondary" className={getRoleColor(role)}>
              {role}
            </Badge>
          );
        },
      },
      {
        accessorKey: "plan",
        header: "Plan",
        cell: ({ row }) => {
          const plan = row.getValue("plan") as string;
          return <span className="font-medium">{plan}</span>;
        },
      },
      {
        accessorKey: "billing",
        header: "Billing",
        cell: ({ row }) => {
          const billing = row.getValue("billing") as string;
          return <span className="text-sm">{billing}</span>;
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return (
            <Badge variant="secondary" className={getStatusColor(status)}>
              {status}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <DataTableRowActions<User>
            row={row.original}
            actions={USER_TABLE_ACTIONS(onEditUser, onDeleteUser)}
            moreLabel="More actions"
          />
        ),
      },
    ],
    [onDeleteUser, onEditUser]
  );

  return (
    <DataTable<User>
      data={users}
      columns={columns}
      getRowId={(user: User) => String(user.id)}
      fetchData={fetchData}
      toolbarEnd={
        <>
          <div className="relative flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(String(e.target.value))}
              className="pl-9"
            />
          </div>
          <Button variant="outline" className="cursor-pointer">
            <Download className="mr-2 size-4" />
            Export
          </Button>
          <UserFormDialog onAddUser={onAddUser} />
        </>
      }
      filterSlot={(table: unknown) => (
        <DataTableFilterBar<User>
          filters={USER_TABLE_FILTERS}
          fetchData={fetchData}
          pageSize={pagination.pageSize}
          table={table as Table<User>}
          showColumnVisibility={true}
        />
      )}
      total={100}
      loading={loading}
      showColumnVisibility={true}
    />
  );
}
