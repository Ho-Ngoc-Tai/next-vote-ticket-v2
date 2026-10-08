"use client";

import * as React from "react";
import type { ColumnDef, Table } from "@tanstack/react-table";
import { ChevronDown, CircleCheckBig, Columns2, EllipsisVertical, Loader, Plus, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { toast } from "sonner";

import { DataTable } from "@components/modules/datatable";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import {
  ChartContainer,
  ChartNoCursor,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@components/ui/chart";
import { Checkbox } from "@components/ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Separator } from "@components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@components/ui/tabs";
import { useIsMobile } from "@hooks/use-mobile";

export type DashboardTask = {
  id: number;
  header: string;
  type: string;
  status: string;
  target: string;
  limit: string;
  reviewer: string;
};

const outlineData: DashboardTask[] = [
  {
    id: 1,
    header: "Executive Summary",
    type: "Executive Summary",
    status: "Done",
    target: "5",
    limit: "10",
    reviewer: "Eddie Lake",
  },
  {
    id: 2,
    header: "Technical Approach",
    type: "Technical Approach",
    status: "In Progress",
    target: "8",
    limit: "15",
    reviewer: "Assign reviewer",
  },
  {
    id: 3,
    header: "Design & Architecture",
    type: "Design",
    status: "Not Started",
    target: "3",
    limit: "8",
    reviewer: "Assign reviewer",
  },
];

const pastPerformanceData: DashboardTask[] = [
  {
    id: 4,
    header: "Case Study – Voting system scale",
    type: "Past Performance",
    status: "In Progress",
    target: "2",
    limit: "5",
    reviewer: "Assign reviewer",
  },
];

const keyPersonnelData: DashboardTask[] = [
  {
    id: 5,
    header: "Lead Architect",
    type: "Key Personnel",
    status: "Done",
    target: "1",
    limit: "1",
    reviewer: "Emily Whalen",
  },
];

const focusDocumentsData: DashboardTask[] = [
  {
    id: 6,
    header: "Security & Compliance",
    type: "Focus Documents",
    status: "In Progress",
    target: "4",
    limit: "6",
    reviewer: "Assign reviewer",
  },
];

const TAB_VALUE = {
  outline: "outline",
  pastPerformance: "past-performance",
  keyPersonnel: "key-personnel",
  focusDocuments: "focus-documents",
} as const;

const TAB_DATA: Record<string, DashboardTask[]> = {
  [TAB_VALUE.outline]: outlineData,
  [TAB_VALUE.pastPerformance]: pastPerformanceData,
  [TAB_VALUE.keyPersonnel]: keyPersonnelData,
  [TAB_VALUE.focusDocuments]: focusDocumentsData,
};

function DashboardTableToolbar({
  table,
  activeTab,
  onTabChange,
}: {
  table: Table<DashboardTask>;
  activeTab: string;
  onTabChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select value={activeTab} onValueChange={onTabChange}>
          <SelectTrigger className="w-fit sm:hidden cursor-pointer" size="sm" id="view-selector">
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TAB_VALUE.outline}>Outline</SelectItem>
            <SelectItem value={TAB_VALUE.pastPerformance}>Past Performance</SelectItem>
            <SelectItem value={TAB_VALUE.keyPersonnel}>Key Personnel</SelectItem>
            <SelectItem value={TAB_VALUE.focusDocuments}>Focus Documents</SelectItem>
          </SelectContent>
        </Select>
        <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 sm:flex">
          <TabsTrigger
            value={TAB_VALUE.outline}
            onClick={() => onTabChange(TAB_VALUE.outline)}
            className="cursor-pointer"
          >
            Outline
          </TabsTrigger>
          <TabsTrigger
            value={TAB_VALUE.pastPerformance}
            onClick={() => onTabChange(TAB_VALUE.pastPerformance)}
            className="cursor-pointer"
          >
            Past Performance <Badge variant="secondary">1</Badge>
          </TabsTrigger>
          <TabsTrigger
            value={TAB_VALUE.keyPersonnel}
            onClick={() => onTabChange(TAB_VALUE.keyPersonnel)}
            className="cursor-pointer"
          >
            Key Personnel <Badge variant="secondary">1</Badge>
          </TabsTrigger>
          <TabsTrigger
            value={TAB_VALUE.focusDocuments}
            onClick={() => onTabChange(TAB_VALUE.focusDocuments)}
            className="cursor-pointer"
          >
            Focus Documents
          </TabsTrigger>
        </TabsList>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="cursor-pointer">
              <Columns2 />
              <span className="hidden lg:inline">Customize Columns</span>
              <span className="lg:hidden">Columns</span>
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {table
              .getAllColumns()
              .filter((col) => typeof col.accessorFn !== "undefined" && col.getCanHide())
              .map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  className="capitalize"
                  checked={col.getIsVisible()}
                  onCheckedChange={(value) => col.toggleVisibility(!!value)}
                >
                  {col.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" size="sm" className="cursor-pointer">
          <Plus />
          <span className="hidden lg:inline">Add Section</span>
        </Button>
      </div>
    </div>
  );
}

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: { label: "Desktop", color: "var(--primary)" },
  mobile: { label: "Mobile", color: "var(--primary)" },
} satisfies ChartConfig;

function TableCellViewer({ item }: { item: DashboardTask }) {
  const isMobile = useIsMobile();
  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left cursor-pointer">
          {item.header}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.header}</DrawerTitle>
          <DrawerDescription>Showing total visitors for the last 6 months</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {!isMobile && (
            <>
              <ChartContainer config={chartConfig}>
                <AreaChart accessibilityLayer data={chartData} margin={{ left: 0, right: 10 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(v) => String(v).slice(0, 3)}
                    hide
                  />
                  <ChartTooltip cursor={<ChartNoCursor />} content={<ChartTooltipContent indicator="dot" />} />
                  <Area
                    dataKey="mobile"
                    type="natural"
                    fill="var(--color-mobile)"
                    fillOpacity={0.6}
                    stroke="var(--color-mobile)"
                    stackId="a"
                  />
                  <Area
                    dataKey="desktop"
                    type="natural"
                    fill="var(--color-desktop)"
                    fillOpacity={0.4}
                    stroke="var(--color-desktop)"
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
              <Separator />
              <div className="grid gap-2">
                <div className="flex gap-2 leading-none font-medium">
                  Trending up by 5.2% this month <TrendingUp className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  Showing total visitors for the last 6 months. This is just some random text to test the layout.
                </div>
              </div>
              <Separator />
            </>
          )}
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="header">Header</Label>
              <Input id="header" defaultValue={item.header} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="type">Type</Label>
                <Select defaultValue={item.type}>
                  <SelectTrigger id="type" className="w-full cursor-pointer">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Executive Summary">Executive Summary</SelectItem>
                    <SelectItem value="Technical Approach">Technical Approach</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Focus Documents">Focus Documents</SelectItem>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="status">Status</Label>
                <Select defaultValue={item.status}>
                  <SelectTrigger id="status" className="w-full cursor-pointer">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Done">Done</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="target">Target</Label>
                <Input id="target" defaultValue={item.target} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="limit">Limit</Label>
                <Input id="limit" defaultValue={item.limit} />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="reviewer">Reviewer</Label>
              <Select defaultValue={item.reviewer}>
                <SelectTrigger id="reviewer" className="w-full cursor-pointer">
                  <SelectValue placeholder="Select a reviewer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
                  <SelectItem value="Jamik Tashpulatov">Jamik Tashpulatov</SelectItem>
                  <SelectItem value="Emily Whalen">Emily Whalen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </div>
        <DrawerFooter>
          <Button className="cursor-pointer">Submit</Button>
          <DrawerClose asChild>
            <Button variant="outline" className="cursor-pointer">
              Done
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

const columns: ColumnDef<DashboardTask>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "header",
    header: "Header",
    cell: ({ row }) => <TableCellViewer item={row.original} />,
    enableHiding: false,
  },
  {
    accessorKey: "type",
    header: "Section Type",
    cell: ({ row }) => (
      <div className="w-32">
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {row.original.type}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {row.original.status === "Done" ? (
          <CircleCheckBig className="text-green-500 dark:text-green-400" />
        ) : (
          <Loader />
        )}
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "target",
    header: () => <div className="w-full">Target</div>,
    cell: ({ row }) => (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          toast.promise(new Promise((r) => setTimeout(r, 1000)), {
            loading: `Saving ${row.original.header}`,
            success: "Done",
            error: "Error",
          });
        }}
      >
        <Label htmlFor={`${row.original.id}-target`} className="sr-only">
          Target
        </Label>
        <Input
          className="h-8 w-16 border-transparent bg-transparent shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background dark:hover:bg-input/30 dark:bg-transparent dark:focus-visible:bg-input/30"
          defaultValue={row.original.target}
          id={`${row.original.id}-target`}
        />
      </form>
    ),
  },
  {
    accessorKey: "limit",
    header: () => <div className="w-full">Limit</div>,
    cell: ({ row }) => (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          toast.promise(new Promise((r) => setTimeout(r, 1000)), {
            loading: `Saving ${row.original.header}`,
            success: "Done",
            error: "Error",
          });
        }}
      >
        <Label htmlFor={`${row.original.id}-limit`} className="sr-only">
          Limit
        </Label>
        <Input
          className="h-8 w-16 border-transparent bg-transparent shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background dark:hover:bg-input/30 dark:bg-transparent dark:focus-visible:bg-input/30"
          defaultValue={row.original.limit}
          id={`${row.original.id}-limit`}
        />
      </form>
    ),
  },
  {
    accessorKey: "reviewer",
    header: "Reviewer",
    cell: ({ row }) => {
      const isAssigned = row.original.reviewer !== "Assign reviewer";
      if (isAssigned) return row.original.reviewer;
      return (
        <>
          <Label htmlFor={`${row.original.id}-reviewer`} className="sr-only">
            Reviewer
          </Label>
          <Select>
            <SelectTrigger className="w-38 cursor-pointer" size="sm" id={`${row.original.id}-reviewer`}>
              <SelectValue placeholder="Assign reviewer" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
              <SelectItem value="Jamik Tashpulatov">Jamik Tashpulatov</SelectItem>
            </SelectContent>
          </Select>
        </>
      );
    },
  },
  {
    id: "actions",
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="text-muted-foreground flex size-8 data-[state=open]:bg-muted cursor-pointer"
            size="icon"
          >
            <EllipsisVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Make a copy</DropdownMenuItem>
          <DropdownMenuItem>Favorite</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

type TabValue = (typeof TAB_VALUE)[keyof typeof TAB_VALUE];

export function DashboardTable() {
  const [activeTab, setActiveTab] = React.useState<TabValue>(TAB_VALUE.outline);
  const currentData = TAB_DATA[activeTab] ?? outlineData;

  const handleTabChange = React.useCallback((v: string) => setActiveTab(v as TabValue), []);

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="w-full flex-col justify-start gap-6 px-4 pb-6 pt-2 lg:px-6"
    >
      <DataTable<DashboardTask>
        data={currentData}
        columns={columns}
        getRowId={(row) => String(row.id)}
        total={currentData.length}
        showPagination={true}
        showColumnVisibility={false}
        className="space-y-4"
        filterSlot={(table) => (
          <DashboardTableToolbar
            table={table as Table<DashboardTask>}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        )}
      />
    </Tabs>
  );
}
