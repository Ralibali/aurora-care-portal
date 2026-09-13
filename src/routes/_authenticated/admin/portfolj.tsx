import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/common/StatCard";
import {
  lovableEditorUrl,
  PORTFOLIO_KIND_LABEL,
  PORTFOLIO_PROJECTS,
  PORTFOLIO_STAGE_LABEL,
  type PortfolioKind,
} from "@/lib/portfolio-registry";

export const Route = createFileRoute("/_authenticated/admin/portfolj")({
  component: PortfolioOverview,
});

type Filter = "all" | PortfolioKind;
const FILTERS: Filter[] = [
  "all",
  "aurora",
  "vertical",
  "venture",
  "operation",
  "client",
  "internal",
];

function PortfolioOverview() {
  const [filter, setFilter] = useState<Filter>("all");
  const projects = useMemo(
    () =>
      filter === "all"
        ? PORTFOLIO_PROJECTS
        : PORTFOLIO_PROJECTS.filter((project) => project.kind === filter),
    [filter],
  );
  const live = PORTFOLIO_PROJECTS.filter((project) => project.stage === "live").length;
  const pilots = PORTFOLIO_PROJECTS.filter(
    (project) => project.stage === "pilot" || project.stage === "build",
  ).length;
  const internal = PORTFOLIO_PROJECTS.filter((project) => project.kind === "internal").length;

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Projekt totalt"
          value={PORTFOLIO_PROJECTS.length}
          hint="Inventerade i Lovable"
        />
        <StatCard label="Live" value={live} tone="success" hint="Publika eller i drift" />
        <StatCard label="Pilot / byggs" value={pilots} tone="warning" hint="Kräver nästa beslut" />
        <StatCard label="Interna stödprojekt" value={internal} hint="Exponeras inte publikt" />
      </section>

      <section>
        <div className="mb-4 flex flex-wrap gap-2" aria-label="Filtrera portfölj">
          {FILTERS.map((value) => (
            <Button
              key={value}
              size="sm"
              variant={filter === value ? "default" : "outline"}
              onClick={() => setFilter(value)}
            >
              {value === "all" ? "Alla" : PORTFOLIO_KIND_LABEL[value]}
            </Button>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="flex h-full flex-col border-border/70">
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base">{project.name}</CardTitle>
                  <Badge variant={project.stage === "live" ? "default" : "secondary"}>
                    {PORTFOLIO_STAGE_LABEL[project.stage]}
                  </Badge>
                </div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {PORTFOLIO_KIND_LABEL[project.kind]}
                </p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4 text-sm">
                <div>
                  <p className="font-medium">{project.destination}</p>
                  <p className="mt-1 text-muted-foreground">{project.note}</p>
                </div>
                <div className="mt-auto flex flex-wrap gap-3 pt-2">
                  {project.publicUrl ? (
                    <a
                      href={project.publicUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                    >
                      Öppna live <ArrowUpRight className="size-3.5" />
                    </a>
                  ) : null}
                  <a
                    href={lovableEditorUrl(project.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                  >
                    Lovable <ArrowUpRight className="size-3.5" />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
