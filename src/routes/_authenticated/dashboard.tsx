import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchMyProjects, fetchAllUserRecords } from "@/lib/data";
import { formatXOF, recordFlow, recordLabel } from "@/lib/financial-types";
import { computeScore, niveauColor } from "@/lib/scoring";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, Plus, TrendingUp, FolderKanban, Wallet } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Tableau de bord · MiProjet+" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = Route.useRouteContext();

  const projectsQ = useQuery({
    queryKey: ["my-projects", user.id],
    queryFn: () => fetchMyProjects(user.id),
  });
  const recordsQ = useQuery({
    queryKey: ["all-records", user.id],
    queryFn: () => fetchAllUserRecords(user.id),
  });

  const projects = projectsQ.data ?? [];
  const records = recordsQ.data ?? [];

  const entrees = records.filter((r) => recordFlow(r.record_type) === "in").reduce((s, r) => s + Number(r.amount), 0);
  const sorties = records.filter((r) => recordFlow(r.record_type) === "out").reduce((s, r) => s + Number(r.amount), 0);
  const benefice = entrees - sorties;

  // Score moyen
  const activeProject = projects[0];
  const score = activeProject ? computeScore(activeProject, records.filter((r) => r.project_id === activeProject.id)) : null;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Bonjour 👋</h1>
          <p className="mt-1 text-muted-foreground">Voici l'état de votre activité sur MiProjet+.</p>
        </div>
        <Link to="/finances"><Button className="bg-primary hover:bg-primary/90"><Plus className="w-4 h-4 mr-1.5" /> Nouvelle opération</Button></Link>
      </div>

      {projects.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid md:grid-cols-4 gap-4">
            <KPI label="Entrées totales" value={formatXOF(entrees)} icon={ArrowUpRight} color="text-success" />
            <KPI label="Sorties totales" value={formatXOF(sorties)} icon={ArrowDownRight} color="text-destructive" />
            <KPI label="Bénéfice net" value={formatXOF(benefice)} icon={TrendingUp} color={benefice >= 0 ? "text-primary" : "text-destructive"} />
            <KPI label="Projets actifs" value={String(projects.length)} icon={FolderKanban} color="text-secondary" />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-2xl bg-card border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Opérations récentes</h2>
                <Link to="/finances" className="text-sm text-primary hover:underline">Tout voir</Link>
              </div>
              {records.length === 0 ? (
                <div className="text-sm text-muted-foreground py-8 text-center">
                  Aucune opération. <Link to="/finances" className="text-primary underline">Saisir la première</Link>
                </div>
              ) : (
                <div className="divide-y">
                  {records.slice(0, 8).map((r) => {
                    const isIn = recordFlow(r.record_type) === "in";
                    return (
                      <div key={r.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">{r.description || recordLabel(r.record_type)}</div>
                          <div className="text-xs text-muted-foreground">{recordLabel(r.record_type)} · {new Date(r.record_date).toLocaleDateString("fr-FR")}</div>
                        </div>
                        <div className={`font-semibold text-sm ${isIn ? "text-success" : "text-destructive"}`}>
                          {isIn ? "+" : "−"} {formatXOF(Number(r.amount))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-2xl gradient-hero text-white p-6 flex flex-col">
              <div className="text-xs uppercase tracking-widest text-white/70">MiProjet Score</div>
              <div className="text-7xl font-bold mt-3 text-gradient-gold">{score?.score_global ?? "—"}</div>
              <div className={`mt-3 inline-flex w-fit px-3 py-1 rounded-full text-xs font-bold ${score ? "bg-gold text-gold-foreground" : "bg-white/15"}`}>
                {score?.niveau ?? "En attente"}
              </div>
              <div className="mt-6 text-sm text-white/80">{activeProject?.title ?? "Créez un projet pour calculer votre score"}</div>
              <Link to="/score" className="mt-auto pt-6">
                <Button variant="outline" size="sm" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20">
                  Voir le détail
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function KPI({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
  return (
    <div className="rounded-2xl bg-card border p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border-2 border-dashed p-12 text-center bg-card">
      <Wallet className="w-12 h-12 mx-auto text-primary" />
      <h2 className="mt-4 text-2xl font-bold">Créez votre premier projet</h2>
      <p className="mt-2 text-muted-foreground max-w-md mx-auto">Définissez votre activité pour commencer à saisir vos opérations et construire votre score de finançabilité.</p>
      <Link to="/projets" className="inline-block mt-6">
        <Button className="bg-primary hover:bg-primary/90"><Plus className="w-4 h-4 mr-1.5" /> Créer un projet</Button>
      </Link>
    </div>
  );
}
