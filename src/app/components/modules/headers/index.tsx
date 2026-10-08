"use client";

import { ProfileDropdown } from "../profile";
import { ToggleTheme } from "../toggle-theme";
import { Button } from "@components/ui/button";
import { Separator } from "@components/ui/separator";
import { SidebarTrigger } from "@components/ui/sidebar";
import { Settings } from "lucide-react";
import * as React from "react";

export function MainHeader() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b border-border/50 bg-background/80 px-4 backdrop-blur-xl">
        <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground transition-colors" />
        <div className="ml-auto flex items-center gap-1">
          <Separator orientation="vertical" className="mx-2 h-6! bg-border/50" />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b border-border/50 bg-background/80 px-4 backdrop-blur-xl">
      <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground transition-colors" />
      <Separator orientation="vertical" className="mx-2 h-6! bg-border/50" />
      <div className="ml-auto flex items-center gap-1">
        <ToggleTheme />

        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Settings</span>
        </Button>

        <Separator orientation="vertical" className="mx-2 h-6! bg-border/50" />

        <ProfileDropdown />
      </div>
    </header>
  );
}
