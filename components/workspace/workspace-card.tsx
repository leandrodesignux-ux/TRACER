"use client";

import { Cable, Check, ChevronsUpDown, FastForward, RotateCcw } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { COMPANY } from "@/lib/demo/home";
import { useStored } from "@/lib/storage";

export function WorkspaceCard() {
  const { resetDemo } = useWorkspace();
  const { isMobile, setOpenMobile } = useSidebar();
  const [demoState, setDemoState] = useStored<"current" | "future">(
    "demo-state",
    "current",
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          tooltip={`${COMPANY.user.name} · ${COMPANY.name}`}
          className="h-auto gap-2.5 rounded-xl py-2 hover:bg-panel data-open:bg-panel group-data-[collapsible=icon]:size-8!"
        >
          <Avatar className="size-8">
            <AvatarFallback className="text-xs">
              {COMPANY.user.initials}
            </AvatarFallback>
          </Avatar>
          <span className="grid min-w-0 flex-1 text-left leading-tight">
            <span className="truncate text-xs font-medium">
              {COMPANY.user.name}
            </span>
            <span className="truncate text-[11px] text-muted-foreground">
              {COMPANY.user.role}
            </span>
            <span className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              {COMPANY.name}
              <span className="rounded-full bg-secondary px-1.5 py-px text-[10px] text-secondary-foreground">
                {COMPANY.dataNote}
              </span>
            </span>
          </span>
          <ChevronsUpDown className="ml-auto text-muted-foreground" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={isMobile ? "top" : "right"}
        align="end"
        className="w-56"
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Workspace
        </DropdownMenuLabel>
        <DropdownMenuItem disabled className="opacity-100!">
          <Check />
          {COMPANY.name}
          <span className="ml-auto text-xs text-muted-foreground">
            {COMPANY.dataNote}
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Estado demo
        </DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => setDemoState("current")}>
          <Check className={demoState === "current" ? "opacity-100" : "opacity-0"} />
          Hoy
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setDemoState("future")}>
          <FastForward />
          Tres semanas después
          {demoState === "future" && <Check className="ml-auto" />}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/fuentes" onClick={() => isMobile && setOpenMobile(false)}>
            <Cable />
            Conectar fuente
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            resetDemo();
            toast.success("Demo reiniciada");
          }}
        >
          <RotateCcw />
          Reiniciar demo
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
