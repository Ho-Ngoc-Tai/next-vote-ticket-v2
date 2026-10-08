"use client";

import { EllipsisVertical } from "lucide-react";

import { Button } from "@components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import type { DataTableRowActionItem } from "./types";

export interface DataTableRowActionsProps<TData> {
  row: TData;
  actions: DataTableRowActionItem<TData>[];
  /** sr-only label for the "more" trigger button */
  moreLabel?: string;
  className?: string;
}

function isMoreAction<TData>(
  item: DataTableRowActionItem<TData>
): item is {
  type: "more";
  items: { label: string; onClick?: (row: TData) => void; icon?: React.ReactNode; destructive?: boolean }[];
} {
  return "type" in item && item.type === "more";
}

export function DataTableRowActions<TData>({
  row,
  actions,
  moreLabel = "More actions",
  className = "flex items-center gap-2",
}: DataTableRowActionsProps<TData>) {
  return (
    <div className={className}>
      {actions.map((action, index) => {
        if (isMoreAction(action)) {
          const { items } = action;
          const destructiveItems = items.filter((i) => i.destructive);
          const normalItems = items.filter((i) => !i.destructive);
          return (
            <DropdownMenu key={`more-${index}`}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                  <EllipsisVertical className="size-4" />
                  <span className="sr-only">{moreLabel}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {normalItems.map((item) => (
                  <DropdownMenuItem key={item.label} className="cursor-pointer" onClick={() => item.onClick?.(row)}>
                    {item.icon && <span className="mr-2">{item.icon}</span>}
                    {item.label}
                  </DropdownMenuItem>
                ))}
                {destructiveItems.length > 0 && normalItems.length > 0 && <DropdownMenuSeparator />}
                {destructiveItems.map((item) => (
                  <DropdownMenuItem
                    key={item.label}
                    className="cursor-pointer text-destructive"
                    onClick={() => item.onClick?.(row)}
                  >
                    {item.icon && <span className="mr-2">{item.icon}</span>}
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }
        const { label, onClick, icon } = action;
        return (
          <Button
            key={label}
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-pointer"
            onClick={() => onClick?.(row)}
          >
            {icon ?? null}
            <span className="sr-only">{label}</span>
          </Button>
        );
      })}
    </div>
  );
}
