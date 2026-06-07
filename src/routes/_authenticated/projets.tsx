import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchMyProjects } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, MapPin, Briefcase, Calendar } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/projets")({
  head: () => ({ meta: [{ title: "Mes projets · MiProjet+" }] }),
  component: ProjectsPage,
});

const SECTORS = ["Commerce", "Agriculture", "Service", "Production", "Restauration", "Artisanat", "Technologie", "Transport", "Éducation", "Santé", "Autre"];
const LEGAL = ["Informel", "Entreprise individuelle", "SARL", "SA", "Coopérative", "Association", "Startup", "Autre"];

function ProjectsPage() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const projectsQ = useQuery({
    queryKey: ["my-projects", user.id],
    queryFn: () => fetchMyProjects(user.id),
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Mes projets</h1>
          <p className="mt-1 text-muted-foreground">Chaque activité que vous gérez sur MiProjet+.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90"><Plus className="w-4 h-4 mr-1.5" /> Nouveau projet</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Nouveau projet</DialogTitle></DialogHeader>
            <ProjectForm userId={user.id} onDone={() => { setOpen(false); qc.invalidateQueries({ queryKey: ["my-projects"] }); }} />
          </DialogContent>
        </Dialog>
      </div>

      {projectsQ.isLoading ? (
        <div className="text-muted-foreground">Chargement…</div>
      ) : (projectsQ.data?.length ?? 0) === 0 ? (
        <div className="rounded-3xl border-2 border-dashed p-12 text-center bg-card">
          <p className="text-muted-foreground">Aucun projet pour l'instant.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projectsQ.data!.map((p) => (
            <Link key={p.id} to="/finances" search={{ project: p.id } as any} className="rounded-2xl bg-card border p-6 hover:shadow-elevated hover:border-primary transition-all">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                {p.display_id && <span className="text-xs font-mono text-muted-foreground">{p.display_id}</span>}
              </div>
              <h3 className="mt-4 text-lg font-semibold truncate">{p.title}</h3>
              {p.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.description}</p>}
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                {p.sector && <span className="inline-flex items-center gap-1"><Briefcase className="w-3 h-3" />{p.sector}</span>}
                {p.city && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{p.city}</span>}
                {p.creation_date && <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(p.creation_date).getFullYear()}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

const PROJECT_TYPES = [
  { value: "micro", label: "Micro / Petite activité (commerce, vente ambulante…)", short: "Micro-activité" },
  { value: "pme", label: "PME (entreprise constituée)", short: "PME" },
  { value: "startup", label: "Startup (innovation, croissance)", short: "Startup" },
];

function ProjectForm({ userId, onDone }: { userId: string; onDone: () => void }) {
  const [form, setForm] = useState({
    title: "", description: "", project_type: "micro",
    sector: "", legal_status: "", city: "", country: "Côte d'Ivoire",
    creation_date: "", employees_count: 0,
    has_accounting: false, has_bank_account: false, has_business_plan: false,
    // Présentation (PME / Startup uniquement)
    short_pitch: "",
    product_description: "",
    commercialization: "",
    target_customers: "",
    monitoring_evaluation: "",
    publish_when_eligible: false,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const isPro = form.project_type !== "micro";

  async function uploadIfAny(file: File | null, kind: string): Promise<string | null> {
    if (!file) return null;
    const ext = file.name.split(".").pop() || "bin";
    const path = `${userId}/projects/${kind}-${Date.now()}.${ext}`;
    const up = await supabase.storage.from("documents").upload(path, file, { upsert: true });
    if (up.error) throw up.error;
    return path;
  }

  const m = useMutation({
    mutationFn: async () => {
      const logo_path = await uploadIfAny(logoFile, "logo");
      const cover_path = await uploadIfAny(coverFile, "cover");
      const payload: any = { user_id: userId, ...form };
      if (!payload.creation_date) delete payload.creation_date;
      if (logo_path) payload.logo_url = logo_path;
      if (cover_path) payload.cover_url = cover_path;
      if (form.project_type === "micro") {
        // n'envoie pas les champs PME/Startup
        delete payload.short_pitch;
        delete payload.product_description;
        delete payload.commercialization;
        delete payload.target_customers;
        delete payload.monitoring_evaluation;
      }
      const { error } = await supabase.from("mp_projects").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Projet créé !"); onDone(); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); m.mutate(); }} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
      <div>
        <Label>Type d'activité *</Label>
        <Select value={form.project_type} onValueChange={(v) => setForm({ ...form, project_type: v })}>
          <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
          <SelectContent>{PROJECT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          {isPro ? "Présentation marketing requise pour valoriser sur la plateforme mère." : "Mode simplifié — pas de fiche marketing détaillée."}
        </p>
      </div>
      <div>
        <Label>Nom du projet / activité *</Label>
        <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1.5" />
      </div>
      <div>
        <Label>Description courte</Label>
        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1.5" rows={2} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Secteur</Label>
          <Select value={form.sector} onValueChange={(v) => setForm({ ...form, sector: v })}>
            <SelectTrigger className="mt-1.5"><SelectValue placeholder="Choisir…" /></SelectTrigger>
            <SelectContent>{SECTORS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Statut juridique</Label>
          <Select value={form.legal_status} onValueChange={(v) => setForm({ ...form, legal_status: v })}>
            <SelectTrigger className="mt-1.5"><SelectValue placeholder="Choisir…" /></SelectTrigger>
            <SelectContent>{LEGAL.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Ville</Label>
          <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="mt-1.5" />
        </div>
        <div>
          <Label>Pays</Label>
          <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="mt-1.5" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Date de création</Label>
          <Input type="date" value={form.creation_date} onChange={(e) => setForm({ ...form, creation_date: e.target.value })} className="mt-1.5" />
        </div>
        <div>
          <Label>Nombre d'employés</Label>
          <Input type="number" min={0} value={form.employees_count} onChange={(e) => setForm({ ...form, employees_count: Number(e.target.value) })} className="mt-1.5" />
        </div>
      </div>
      <div className="space-y-2 pt-2 border-t">
        {[
          ["has_accounting", "Comptabilité tenue"],
          ["has_bank_account", "Compte bancaire actif"],
          ["has_business_plan", "Business plan disponible"],
        ].map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-sm">
            <Checkbox checked={(form as any)[key]} onCheckedChange={(c) => setForm({ ...form, [key]: !!c } as any)} />
            {label}
          </label>
        ))}
      </div>

      {isPro && (
        <>
          <div className="pt-3 border-t">
            <h3 className="font-semibold mb-2 text-sm">🎨 Identité visuelle</h3>
            <div className="grid grid-cols-2 gap-3">
              <FileField label="Logo" file={logoFile} onChange={setLogoFile} accept="image/*" hint="PNG / SVG carré" />
              <FileField label="Photo de couverture" file={coverFile} onChange={setCoverFile} accept="image/*" hint="16:9 paysage" />
            </div>
          </div>
          <div className="pt-3 border-t space-y-3">
            <h3 className="font-semibold text-sm">📝 Présentation stratégique</h3>
            <CharField label="Pitch court (max 280 car.)" max={280} value={form.short_pitch} onChange={(v) => setForm({ ...form, short_pitch: v })} placeholder="Une phrase percutante qui décrit votre proposition de valeur." />
            <CharField label="Produit / service proposé (max 600 car.)" max={600} value={form.product_description} onChange={(v) => setForm({ ...form, product_description: v })} placeholder="Que vendez-vous ? Quelle qualité, quelle particularité ?" />
            <CharField label="Processus de commercialisation (max 500 car.)" max={500} value={form.commercialization} onChange={(v) => setForm({ ...form, commercialization: v })} placeholder="Comment commercialisez-vous ? Canaux, prix, paiement…" />
            <CharField label="Clientèle cible (max 400 car.)" max={400} value={form.target_customers} onChange={(v) => setForm({ ...form, target_customers: v })} placeholder="Qui sont vos clients ? Profil, zone, volume…" />
            <CharField label="Suivi & évaluation (max 400 car.)" max={400} value={form.monitoring_evaluation} onChange={(v) => setForm({ ...form, monitoring_evaluation: v })} placeholder="Comment mesurez-vous les résultats ? Indicateurs, reporting…" />
          </div>
          <label className="flex items-start gap-2 text-sm pt-2 border-t">
            <Checkbox checked={form.publish_when_eligible} onCheckedChange={(c) => setForm({ ...form, publish_when_eligible: !!c })} />
            <span>Publier automatiquement sur <strong>ivoireprojet.com</strong> dès que le projet atteint le niveau <strong>Finançable</strong>.</span>
          </label>
        </>
      )}

      <Button type="submit" disabled={m.isPending} className="w-full bg-primary hover:bg-primary/90 sticky bottom-0">
        {m.isPending ? "…" : "Créer le projet"}
      </Button>
    </form>
  );
}

function FileField({ label, file, onChange, accept, hint }: { label: string; file: File | null; onChange: (f: File | null) => void; accept: string; hint?: string }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <label className="mt-1.5 flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed bg-muted/30 p-3 cursor-pointer hover:border-primary">
        <span className="text-xs font-medium truncate max-w-full">{file ? file.name : "Cliquer pour choisir"}</span>
        {hint && !file && <span className="text-[10px] text-muted-foreground">{hint}</span>}
        <input type="file" accept={accept} className="hidden" onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
      </label>
    </div>
  );
}

function CharField({ label, max, value, onChange, placeholder }: { label: string; max: number; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <div className="flex justify-between">
        <Label className="text-xs">{label}</Label>
        <span className={`text-[10px] ${value.length > max ? "text-destructive" : "text-muted-foreground"}`}>{value.length}/{max}</span>
      </div>
      <Textarea value={value} onChange={(e) => onChange(e.target.value.slice(0, max))} className="mt-1" rows={3} placeholder={placeholder} />
    </div>
  );
}
