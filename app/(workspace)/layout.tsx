import type { CSSProperties } from "react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/workspace/app-sidebar";
import { FindingsPanel } from "@/components/workspace/findings-panel";
import { FindingsSheet } from "@/components/workspace/findings-sheet";
import { Panel } from "@/components/workspace/panel";
import { TopBar } from "@/components/workspace/top-bar";
import { WorkspaceProvider } from "@/components/workspace/workspace-provider";

export default function WorkspaceLayout({ children }: LayoutProps<"/">) {
  return (
    <WorkspaceProvider>
      <SidebarProvider
        className="h-dvh min-h-0 flex-col overflow-hidden"
        style={{ "--sidebar-width": "15rem" } as CSSProperties}
      >
        <TopBar />

        <div className="relative mx-2 mb-[max(0.5rem,env(safe-area-inset-bottom))] flex min-h-0 flex-1 overflow-hidden rounded-3xl border border-panel-border bg-linear-to-br from-shell-from to-shell-to shadow-xs max-lg:[&>[data-slot=sidebar]]:hidden lg:mx-3 lg:mb-3">
          <AppSidebar />

          <main className="flex min-w-0 flex-1 flex-col p-2 sm:p-3 lg:pl-1">
            {children}
          </main>

          <aside className="hidden w-80 shrink-0 p-3 pl-0 xl:flex">
            <Panel delay={0.1} className="flex min-h-0 flex-1 flex-col">
              <FindingsPanel />
            </Panel>
          </aside>
        </div>

        <FindingsSheet />
      </SidebarProvider>
    </WorkspaceProvider>
  );
}
