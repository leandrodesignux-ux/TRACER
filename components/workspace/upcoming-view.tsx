"use client";

import { Hourglass } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Panel } from "@/components/workspace/panel";
import { ViewHeader } from "@/components/workspace/view-header";

/** Estado honesto para las vistas que todavía no existen. */
export function UpcomingView({
  title,
  description,
  phase,
}: {
  title: string;
  description: string;
  phase: string;
}) {
  return (
    <>
      <ViewHeader title={title} />
      <Panel className="flex min-h-0 flex-1 overflow-y-auto">
        <Empty className="m-auto">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Hourglass />
            </EmptyMedia>
            <EmptyTitle>Esta vista llega en la próxima fase</EmptyTitle>
            <EmptyDescription>
              {description} Está planeada para la {phase}.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild size="sm">
              <Link href="/">Volver al asistente</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </Panel>
    </>
  );
}
