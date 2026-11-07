"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { TracerLogo } from "@/components/workspace/tracer-logo";
import { GlobalSearch } from "@/components/workspace/global-search";
import { COMPANY, TOP_NAV } from "@/lib/demo/home";
import { cn } from "@/lib/utils";

export function TopBar() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  // En mobile las pastillas tienen scroll: deja la activa a la vista.
  useEffect(() => {
    const nav = navRef.current;
    const active = nav?.querySelector<HTMLElement>("[aria-current=page]");
    if (!nav || !active || nav.scrollWidth <= nav.clientWidth) return;
    nav.scrollLeft =
      active.offsetLeft - nav.clientWidth / 2 + active.clientWidth / 2;
  }, [pathname]);

  return (
    <header className="flex flex-wrap items-center gap-x-2 gap-y-2 px-3 pt-3 pb-2 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-4 lg:px-5 lg:pb-3">
      <div className="flex items-center gap-1">
        <SidebarTrigger className="lg:hidden" aria-label="Abrir menú" />
        <Link
          href="/"
          className="rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <TracerLogo />
        </Link>
      </div>

      <nav
        ref={navRef}
        aria-label="Vistas"
        className="order-last -mx-3 w-[calc(100%+1.5rem)] overflow-x-auto px-3 [scrollbar-width:none] lg:order-none lg:mx-0 lg:w-auto lg:px-0"
      >
        <ul className="flex w-max items-center gap-0.5 rounded-full border border-border bg-card p-1 shadow-xs">
          {TOP_NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-8 items-center rounded-full px-3.5 text-xs whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    active
                      ? "bg-nav-active text-nav-active-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="ml-auto flex items-center gap-2 lg:ml-0 lg:justify-self-end">
        <GlobalSearch />
        <ThemeToggle />
        <Avatar className="size-8">
          <AvatarFallback className="text-xs">
            {COMPANY.user.initials}
          </AvatarFallback>
        </Avatar>
        <span className="sr-only">
          {COMPANY.user.name}, {COMPANY.user.role} en {COMPANY.name}
        </span>
      </div>
    </header>
  );
}
