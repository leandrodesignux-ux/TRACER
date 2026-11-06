import { ArrowRight, TrendingDown } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Página de la Fase 0: comprueba el tema, las fuentes y los componentes base.
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-4 py-10 sm:px-8 sm:py-16">
      <header className="flex items-center justify-between gap-4">
        <span className="font-heading text-lg font-medium tracking-tight">
          Tracer
        </span>
        <ThemeToggle />
      </header>

      <section className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">Fase 0 · Setup</p>
        <h1 className="font-heading text-4xl font-light tracking-tighter text-balance sm:text-5xl">
          Hola, Valentina. Las demos agendadas cayeron 18 % esta semana.
        </h1>
        <p className="max-w-prose text-muted-foreground">
          Esta página solo comprueba el tema, las fuentes y los componentes
          base. El workspace llega en la Fase 1.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Hallazgo del día</CardTitle>
          <CardDescription>
            Formulario completado → demo agendada, solo en mobile.
          </CardDescription>
          <CardAction>
            <TrendingDown className="text-destructive" aria-hidden />
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className="border-source-ga4/40 text-source-ga4"
          >
            GA4
          </Badge>
          <Badge
            variant="outline"
            className="border-source-clarity/40 text-source-clarity"
          >
            Clarity
          </Badge>
          <Badge
            variant="outline"
            className="border-source-crm/40 text-source-crm"
          >
            CRM
          </Badge>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button>
            Explicar la caída
            <ArrowRight />
          </Button>
          <Button variant="secondary">Diseñar experimento</Button>
          <Button variant="outline">Ver fuentes</Button>
          <Button variant="ghost">Descartar</Button>
        </CardFooter>
      </Card>

      <section className="grid grid-cols-5 gap-2" aria-label="Paleta de gráficos">
        <div className="h-10 rounded-md bg-chart-1" />
        <div className="h-10 rounded-md bg-chart-2" />
        <div className="h-10 rounded-md bg-chart-3" />
        <div className="h-10 rounded-md bg-chart-4" />
        <div className="h-10 rounded-md bg-chart-5" />
      </section>
    </main>
  );
}
