"use client";

import {
  Bell,
  ChartNoAxesColumn,
  ChevronsLeft,
  FileText,
  FlaskConical,
  House,
  Plug,
  Plus,
  Search,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { WorkspaceCard } from "@/components/workspace/workspace-card";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { getAlerts } from "@/lib/ai/tools";
import { SIDE_NAV, type NavIcon } from "@/lib/demo/home";
import { useStored } from "@/lib/storage";
import { useDemoDate } from "@/lib/use-demo-date";

const ICONS: Record<NavIcon, LucideIcon> = {
  home: House,
  analysis: ChartNoAxesColumn,
  experiments: FlaskConical,
  reports: FileText,
  sources: Plug,
  alerts: Bell,
};

const ALERTS_ITEM = {
  label: "Alertas",
  href: "/alertas",
  icon: "alerts" as const,
};

const itemClass =
  "h-8 rounded-lg text-[13px] text-sidebar-foreground hover:bg-panel data-active:bg-card data-active:text-foreground data-active:shadow-xs";

export function AppSidebar() {
  const pathname = usePathname();
  const { newAnalysis } = useWorkspace();
  const { state, isMobile, setOpen, setOpenMobile, toggleSidebar } =
    useSidebar();
  const [readAlertIds] = useStored<string[]>("read-alerts", []);
  const asOf = useDemoDate();
  const unreadAlerts = useMemo(
    () => getAlerts({ asOf }).data.filter((alert) => alert.unread && !readAlertIds.includes(alert.id)).length,
    [asOf, readAlertIds],
  );

  const collapsed = state === "collapsed" && !isMobile;
  const openSearch = () => document.dispatchEvent(new Event("tracer:open-search"));

  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar
      collapsible="icon"
      variant="inset"
      className="absolute h-full [&_[data-slot=sidebar-inner]]:bg-transparent"
    >
      <SidebarHeader className="gap-2 pt-3">
        {collapsed ? (
          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleSidebar}
              aria-label="Expandir menú"
              className="hover:bg-panel"
            >
              <ChevronsLeft className="rotate-180" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Buscar en el menú"
              className="hover:bg-panel"
              onClick={() => {
                setOpen(true);
                requestAnimationFrame(openSearch);
              }}
            >
              <Search />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <SidebarInput
                value=""
                readOnly
                onFocus={openSearch}
                onClick={openSearch}
                placeholder="Buscar"
                aria-label="Buscar en el menú"
                className="h-8 rounded-lg border-panel-outline bg-card/70 pl-8 text-xs"
              />
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleSidebar}
              aria-label={isMobile ? "Cerrar menú" : "Contraer menú"}
              className="hover:bg-panel"
            >
              <ChevronsLeft />
            </Button>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="py-0">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === ALERTS_ITEM.href}
                tooltip={ALERTS_ITEM.label}
                className={itemClass}
              >
                <Link href={ALERTS_ITEM.href} onClick={closeOnMobile}>
                  <Bell />
                  <span>{ALERTS_ITEM.label}</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuBadge className="top-1.5! rounded-full bg-primary text-[10px] text-primary-foreground peer-hover/menu-button:text-primary-foreground peer-data-active/menu-button:text-primary-foreground">
                {unreadAlerts}
                <span className="sr-only"> alertas</span>
              </SidebarMenuBadge>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator className="mx-3" />

        <SidebarGroup className="py-0">
          <SidebarMenu>
            {SIDE_NAV.map((item) => {
              const Icon = ICONS[item.icon];
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    className={itemClass}
                  >
                    <Link href={item.href} onClick={closeOnMobile}>
                      <Icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator className="mx-3" />

        <SidebarGroup className="py-0">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Nuevo análisis"
                className={itemClass}
                onClick={() => {
                  closeOnMobile();
                  newAnalysis();
                }}
              >
                <Plus />
                <span>Nuevo análisis</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <WorkspaceCard />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
