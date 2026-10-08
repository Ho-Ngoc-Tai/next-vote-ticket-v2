"use client";

import { ChevronRight, LayoutDashboard, MessageCircle, Settings2, Ticket } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@components/ui/collapsible";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  Sidebar as UISidebar,
  useSidebar,
} from "@components/ui/sidebar";
import Image from "next/image";

type NavItem = {
  alwaysOpen?: boolean;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: "green" | "violet";
  children?: NavItem[];
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    title: "Dashboard",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "General",
    items: [
      {
        label: "Tickets",
        href: "/tickets",
        icon: Ticket,
        alwaysOpen: true,
        children: [
          { label: "Tickets", href: "/tickets", icon: Ticket },
          { label: "My Tickets", href: "/tickets/my-tickets", icon: Ticket },
        ],
      },
      { label: "Chats", href: "/chats", icon: MessageCircle },
      // { label: "Users", href: "/users", icon: Users },
    ],
  },
  // {
  //   title: "Pages",
  //   items: [
  //     { label: "Auth", href: "/auth", icon: ShieldAlert },
  //     { label: "Pricing", href: "/pricing", icon: CreditCard },
  //     { label: "Errors", href: "/errors", icon: ShieldAlert },
  //   ],
  // },
];

function SidebarNavSection({ section, currentPath }: { section: NavSection; currentPath: string }) {
  const { setOpenMobile, state } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
        {section.title}
      </SidebarGroupLabel>
      <SidebarMenu className="gap-1">
        {section.items.map((item) => {
          const Icon = item.icon;
          const hasChildren = item.children && item.children.length > 0;

          const isActive = item?.alwaysOpen;
          currentPath === item.href ||
            currentPath.split("?")[0] === item.href ||
            (hasChildren &&
              item.children!.some((child) => currentPath === child.href || currentPath.split("?")[0] === child.href));

          if (!hasChildren) {
            return (
              <SidebarMenuItem key={item.href + item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.label}
                  className={cn(
                    "group/link relative transition-all duration-200",
                    isActive && "bg-violet-500/10 text-violet-600 dark:text-violet-400"
                  )}
                >
                  <Link href={item.href} onClick={() => setOpenMobile(false)}>
                    {isActive && (
                      <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-linear-to-b from-violet-500 to-fuchsia-500" />
                    )}
                    <Icon
                      className={cn(
                        "transition-colors",
                        isActive
                          ? "text-violet-600 dark:text-violet-400"
                          : "text-muted-foreground group-hover/link:text-foreground"
                      )}
                    />
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          "ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          item.badgeColor === "green"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-violet-500/10 text-violet-400"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          // Item with children => collapsible when expanded, dropdown when collapsed
          const defaultOpen = isActive;

          if (state === "collapsed") {
            return (
              <SidebarMenuItem key={item.href + item.label}>
                <SidebarMenuButton tooltip={item.label} className="transition-all duration-200" isActive={isActive}>
                  <Icon
                    className={cn(
                      "transition-colors",
                      isActive ? "text-violet-600 dark:text-violet-400" : "text-muted-foreground"
                    )}
                  />
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          return (
            <Collapsible key={item.href + item.label} asChild defaultOpen={defaultOpen} className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.label}
                    className={cn(
                      "group/link transition-all duration-200",
                      isActive && "text-violet-600 dark:text-violet-400"
                    )}
                  >
                    <Icon
                      className={cn(
                        "transition-colors",
                        isActive
                          ? "text-violet-600 dark:text-violet-400"
                          : "text-muted-foreground group-hover/link:text-foreground"
                      )}
                    />
                    <span className="font-medium">{item.label}</span>
                    <ChevronRight className="ml-auto size-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className="CollapsibleContent">
                  <SidebarMenuSub className="ml-3.5 border-l-2 border-violet-500/20">
                    {item.children!.map((child) => {
                      const isSubActive = currentPath === child.href || currentPath.split("?")[0] === child.href;

                      return (
                        <SidebarMenuSubItem key={child.href + child.label}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isSubActive}
                            className={cn(
                              "transition-all duration-200",
                              isSubActive && "bg-violet-500/10 text-violet-600 dark:text-violet-400"
                            )}
                          >
                            <Link href={child.href} onClick={() => setOpenMobile(false)}>
                              {child.icon && <child.icon className="size-4" />}
                              <span>{child.label}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export default function AppSidebar({ ...props }: React.ComponentProps<typeof UISidebar>) {
  const { state } = useSidebar();
  const pathname = usePathname();

  return (
    <UISidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="group/team relative h-12 overflow-hidden">
              <div className="relative flex aspect-square size-8 items-center justify-center rounded-lg shadow-md transition-transform group-hover/team:scale-105">
                <Image src="/favicon.png" alt="Bitora" width={24} height={24} className="object-cover" />
                <div className="absolute inset-0 rounded-lg bg-linear-to-br from-white/20 to-transparent" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Bitora</span>
                <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">Ticket System</span>
              </div>
              <Settings2 className="ml-auto size-4 text-muted-foreground transition-colors group-hover/team:text-foreground" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <nav className="flex flex-1 flex-col">
          {navSections.map((section) => (
            <SidebarNavSection key={section.title} section={section} currentPath={pathname} />
          ))}
        </nav>
      </SidebarContent>
      <SidebarFooter>
        <div className={cn("px-2 py-1.5 text-xs text-center text-muted-foreground", state === "collapsed" && "hidden")}>
          Powered by Bitora
        </div>
      </SidebarFooter>
      <SidebarRail />
    </UISidebar>
  );
}
