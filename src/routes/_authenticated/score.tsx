import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchMyProjects, fetchProjectRecords } from "@/lib/data";
import { computeScore, niveauColor } from "@/lib/scoring";
import { formatXOF } from "@/lib/financial-types";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertTriangle, Lightbulb, Save, Trophy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/score")({
  head: () => ({ meta: [{ title: "MiProjet Score · MiProjet+" }] }),
  component: ScorePage,
});

function ScorePage() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string>("");

  const projectsQ = useQuery({ queryKey: ["my-projects", user.id], queryFn: () => fetchMyProjects(user.id) });
  const projects = projectsQ.data ?? [];
  const activeId = selectedId || projects[0]?.id || "";
  const activeProject = projects.find((p) => p.id === activeId);

  const recordsQ = useQuery({
    queryKey: ["records", activeId],
    queryFn: () => fetchProjectRecords(activeId),
    enabled: !!activeId,
  });

  const score = useMemo(() => activeProject ? computeScore(activeProject, recordsQ.data ?? []) : null, [activeProject, recordsQ.data]);

  const saveM = useMutation({
    mutationFn: async () => {
      if (!score || !activeProject) return;
      // deactivate previous active scoring
      await supabase.from("mp_scoring_results").update({ is_active: false }).eq("project_id", activeProject.id).eq("is_active", true);
      const { error } = await supabase.from("mp_scoring_results").insert({
        user_id: user.id,
        project_id: activeProject.id,
        score_juridique: score.score_juridique,
        score_financier: score.score_financier,
        score_technique: score.score_technique,
        score_marche: score.score_marche,
        score_impact: score.score_impact,
        score_global: score.score_global,
        niveau: score.niveau,
        forces: score.forces,
        faiblesses: score.faiblesses,
        recommandations: score.recommandations,
        is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Score enregistré"); qc.invalidateQueries({ queryKey: ["scoring"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  if (projects.length === 0) {
    return (
      <div className="p-10 max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-bold">Pas encore de projet</h1>
        <p className="mt-2 text-muted-foreground">Créez un projet pour calculer votre score.</p>
        <Link to="/projets" className="inline-block mt-6"><Button>Créer un projet</Button></Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">MiProjet Score</h1>
          <p className="mt-1 text-muted-foreground">Votre note de finançabilité, mise à jour en continu.</p>
        </div>
        <div className="flex gap-2">
          <Select value={activeId} onValueChange={setSelectedId}>
            <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
            <SelectContent>{projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent>
          </Select>
          <Button onClick={() => saveM.mutate()} disabled={saveM.isPending || !score} variant="outline">
            <Save className="w-4 h-4 mr-1.5" /> Enregistrer
          </Button>
        </div>
      </div>

      {score && (
        <>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 rounded-3xl gradient-hero text-white p-8 text-center">
              <div className="text-xs uppercase tracking-widest text-white/70">Score global</div>
              <div className="text-8xl font-bold mt-2 text-gradient-gold">{score.score_global}</div>
              <div className="mt-4 inline-flex px-4 py-1.5 rounded-full bg-gold text-gold-foreground text-sm font-bold">
                {score.niveau}
              </div>
              {score.niveau === "Finançable" && (
                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gold">
                  <Trophy className="w-4 h-4" /> Éligible au catalogue MiProjet
                </div>
              )}
            </div>
            <div className="lg:col-span-2 rounded-2xl bg-card border p-6">
              <h2 className="text-lg font-semibold mb-5">Décomposition par axe</h2>
              <div className="space-y-4">
                <ScoreBar label="Juridique" value={score.score_juridique} weight="15%" />
                <ScoreBar label="Financier" value={score.score_financier} weight="35%" />
                <ScoreBar label="Technique" value={score.score_technique} weight="20%" />
                <ScoreBar label="Marché" value={score.score_marche} weight="20%" />
                <ScoreBar label="Impact" value={score.score_impact} weight="10%" />
              </div>
              <div className="mt-6 pt-6 border-t grid grid-cols-3 gap-4 text-center">
                <div><div className="text-xs text-muted-foreground">Entrées</div><div className="font-bold text-success">{formatXOF(score.totaux.entrees)}</div></div>
                <div><div className="text-xs text-muted-foreground">Sorties</div><div className="font-bold text-destructive">{formatXOF(score.totaux.sorties)}</div></div>
                <div><div className="text-xs text-muted-foreground">Bénéfice</div><div className="font-bold">{formatXOF(score.totaux.benefice)}</div></div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <Card title="Forces" icon={CheckCircle2} color="text-success" items={score.forces} empty="Continuez à enregistrer pour révéler vos forces." />
            <Card title="Faiblesses" icon={AlertTriangle} color="text-warning" items={score.faiblesses} empty="Aucune faiblesse identifiée." />
            <Card title="Recommandations" icon={Lightbulb} color="text-gold" items={score.recommandations} empty="Vous êtes sur la bonne voie." />
          </div>
        </>
      )}
    </div>
  );
}

function ScoreBar({ label, value, weight }: { label: string; value: number; weight: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="font-medium">{label} <span className="text-xs text-muted-foreground">· pondération {weight}</span></span>
        <span className="font-bold">{value}/100</span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  );
}

function Card({ title, icon: Icon, color, items, empty }: { title: string; icon: any; color: string; items: string[]; empty: string }) {
  return (
    <div className="rounded-2xl bg-card border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`w-5 h-5 ${color}`} />
        <h3 className="font-semibold">{title}</h3>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {items.map((it, i) => (
            <li key={i} className="flex gap-2"><span className={color}>•</span> {it}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
