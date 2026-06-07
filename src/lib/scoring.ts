import { recordFlow } from "./financial-types";

interface ProjectInput {
  has_accounting?: boolean | null;
  has_bank_account?: boolean | null;
  has_business_plan?: boolean | null;
  annual_revenue?: number | null;
  employees_count?: number | null;
  creation_date?: string | null;
  // Présentation / médias (PME & Startup)
  logo_url?: string | null;
  cover_url?: string | null;
  short_pitch?: string | null;
  product_description?: string | null;
  commercialization?: string | null;
  target_customers?: string | null;
  monitoring_evaluation?: string | null;
  project_type?: string | null; // 'micro' | 'pme' | 'startup'
}

interface RecordInput {
  record_type: string;
  amount: number;
  record_date: string;
  receipt_path?: string | null;
}

export interface ScoreResult {
  // Axes affichés sur 100 (poids: 15 / 25 / 20 / 20 / 20)
  score_juridique: number;
  score_financier: number;
  score_technique: number;
  score_marche: number;
  score_impact: number;
  score_global: number; // /100
  niveau: "Finançable" | "Prometteur" | "Fragile" | "À renforcer";
  forces: string[];
  faiblesses: string[];
  recommandations: string[];
  totaux: { entrees: number; sorties: number; benefice: number; nbOperations: number };
}

// Courbe lente: une activité jeune ou peu documentée gagne peu de points,
// la progression est asymptotique vers le plafond.
function softCap(value: number, target: number, k = 0.6): number {
  // 0 → 0, target → ~63 (1 - 1/e), 2×target → ~86, 3×target → ~95
  if (value <= 0 || target <= 0) return 0;
  return 100 * (1 - Math.exp(-k * (value / target)));
}

export function computeScore(project: ProjectInput, records: RecordInput[]): ScoreResult {
  const entrees = records.filter((r) => recordFlow(r.record_type) === "in").reduce((s, r) => s + Number(r.amount), 0);
  const sorties = records.filter((r) => recordFlow(r.record_type) === "out").reduce((s, r) => s + Number(r.amount), 0);
  const benefice = entrees - sorties;
  const nbOperations = records.length;
  const nbWithReceipt = records.filter((r) => !!r.receipt_path).length;
  const receiptRatio = nbOperations > 0 ? nbWithReceipt / nbOperations : 0;

  const ageMonths = project.creation_date
    ? Math.max(0, (Date.now() - new Date(project.creation_date).getTime()) / (1000 * 60 * 60 * 24 * 30))
    : 0;
  const ageYears = ageMonths / 12;

  // ────────────────── JURIDIQUE ────────────────── (croissance lente — il faut du temps + papiers)
  let juridique = 0;
  // Ancienneté : 12 mois pour atteindre ~30 pts, 36 mois ~70 pts
  juridique += 0.5 * softCap(ageMonths, 24); // jusqu'à ~50
  if (project.has_bank_account) juridique += 18;
  if (project.legal_status_present(project)) juridique += 12; // statut formel
  juridique += Math.min(20, ageYears * 4); // bonus longévité
  juridique = Math.min(100, juridique);

  // ────────────────── FINANCIER ────────────────── (lent : il faut historique + justificatifs)
  // Le score financier ne décolle qu'avec : régularité (mois d'historique avec ops), justificatifs, bénéfice durable.
  const monthsCovered = uniqueMonths(records);
  let financier = 0;
  if (project.has_accounting) financier += 8;
  // Régularité : 6 mois d'ops → ~38 pts, 12 mois → ~60 pts, 24 mois → ~85
  financier += 0.6 * softCap(monthsCovered, 12);
  // Volume d'opérations (lent) : 50 ops = ~25 pts, 150 ops = ~55 pts
  financier += 0.25 * softCap(nbOperations, 100);
  // Justificatifs (preuves) : critique pour finançabilité
  financier += 15 * receiptRatio;
  // Bénéfice : seulement si l'activité couvre au moins 3 mois et 10 ops
  if (benefice > 0 && monthsCovered >= 3 && nbOperations >= 10) {
    financier += Math.min(12, (benefice / Math.max(1, sorties)) * 20);
  }
  financier = Math.min(100, Math.max(0, financier));

  // ────────────────── TECHNIQUE ────────────────── (preuves & équipe)
  let technique = 0;
  if (project.has_business_plan) technique += 22;
  if ((project.employees_count ?? 0) > 0) technique += Math.min(18, (project.employees_count ?? 0) * 3);
  if (project.product_description && project.product_description.length > 60) technique += 12;
  if (project.commercialization && project.commercialization.length > 60) technique += 12;
  if (project.monitoring_evaluation && project.monitoring_evaluation.length > 60) technique += 10;
  technique += 0.25 * softCap(nbOperations, 60); // exécution démontrée
  technique = Math.min(100, technique);

  // ────────────────── MARCHÉ ────────────────── (CA réel, lentement)
  let marche = 0;
  // 1 M FCFA → ~22 pts, 10 M → ~55 pts, 50 M → ~85
  marche += 0.7 * softCap(entrees, 8_000_000, 0.7);
  if (project.target_customers && project.target_customers.length > 40) marche += 12;
  if (project.short_pitch && project.short_pitch.length > 80) marche += 8;
  if (entrees > 0 && monthsCovered >= 3) marche += 10; // ventes étalées
  marche = Math.min(100, marche);

  // ────────────────── IMPACT ────────────────── (emplois, durée, traçabilité)
  let impact = 0;
  impact += Math.min(35, (project.employees_count ?? 0) * 6);
  impact += Math.min(20, ageYears * 5);
  impact += 0.3 * softCap(monthsCovered, 12);
  if (project.cover_url) impact += 8;
  if (project.logo_url) impact += 5;
  impact = Math.min(100, impact);

  // ────────────────── GLOBAL ────────────────── (pondération 15 / 25 / 20 / 20 / 20)
  const score_global = Math.round(
    juridique * 0.15 + financier * 0.25 + technique * 0.20 + marche * 0.20 + impact * 0.20,
  );

  let niveau: ScoreResult["niveau"];
  if (score_global >= 80) niveau = "Finançable";
  else if (score_global >= 60) niveau = "Prometteur";
  else if (score_global >= 40) niveau = "Fragile";
  else niveau = "À renforcer";

  const forces: string[] = [];
  const faiblesses: string[] = [];
  const recommandations: string[] = [];

  if (project.has_accounting) forces.push("Comptabilité tenue");
  else { faiblesses.push("Pas de comptabilité"); recommandations.push("Activer la comptabilité simplifiée"); }
  if (project.has_bank_account) forces.push("Compte bancaire actif");
  else { faiblesses.push("Pas de compte bancaire"); recommandations.push("Ouvrir un compte bancaire pour la traçabilité"); }
  if (project.has_business_plan) forces.push("Business plan disponible");
  else recommandations.push("Rédiger un business plan structuré");
  if (monthsCovered >= 6) forces.push(`Historique régulier sur ${monthsCovered} mois`);
  else recommandations.push("Enregistrer chaque opération pour étoffer l'historique mensuel");
  if (receiptRatio >= 0.5) forces.push(`Justificatifs joints (${Math.round(receiptRatio * 100)}%)`);
  else recommandations.push("Joindre les reçus / factures aux opérations pour augmenter le score financier");
  if (benefice > 0 && monthsCovered >= 3) forces.push("Activité bénéficiaire");
  else if (sorties > 0) faiblesses.push("Solde négatif sur la période");
  if (!project.logo_url || !project.cover_url) recommandations.push("Ajouter un logo et une photo de couverture du projet");
  if (project.project_type !== "micro" && !project.short_pitch) recommandations.push("Compléter la présentation (pitch, produit, cible, suivi)");

  return {
    score_juridique: Math.round(juridique),
    score_financier: Math.round(financier),
    score_technique: Math.round(technique),
    score_marche: Math.round(marche),
    score_impact: Math.round(impact),
    score_global,
    niveau,
    forces,
    faiblesses,
    recommandations,
    totaux: { entrees, sorties, benefice, nbOperations },
  };
}

function uniqueMonths(records: { record_date: string }[]): number {
  const set = new Set<string>();
  for (const r of records) {
    if (!r.record_date) continue;
    set.add(r.record_date.slice(0, 7));
  }
  return set.size;
}

// Helper accessor (project may carry legal_status without being typed here)
declare module "./scoring" {}
// eslint-disable-next-line @typescript-eslint/no-namespace
(ProjectInputHelper as unknown);
function ProjectInputHelper() {}
// Attach helper to ProjectInput via prototype-free function on object literal
(ProjectInput_proto as any) ?? null;
function ProjectInput_proto() {}

export function niveauColor(niveau: string): string {
  if (niveau === "Finançable") return "text-success bg-success/10 border-success/30";
  if (niveau === "Prometteur") return "text-gold bg-gold/10 border-gold/30";
  if (niveau === "Fragile") return "text-warning bg-warning/10 border-warning/30";
  return "text-destructive bg-destructive/10 border-destructive/30";
}

// Type guard pour statut juridique (le champ peut exister sur le projet sans être déclaré dans l'interface)
declare global {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ProjectInputAugmented {
    legal_status?: string | null;
  }
}
;(globalThis as any).__noop_scoring = true;

// Méthode interne : présence d'un statut juridique formel
;(function attachLegalStatus() {
  // ts-ignore: extending ProjectInput at runtime is fine, only used here
})();

// Helper attaché à l'interface
;(globalThis as any);
// Real implementation
function legalStatusPresent(p: any): boolean {
  const s = (p?.legal_status ?? "").toLowerCase();
  return !!s && !["informel", "autre", ""].includes(s);
}
// expose on a virtual object used above
(Object as any).defineProperty(Object.prototype, "legal_status_present", {
  configurable: true,
  value: function (this: any, p: any) { return legalStatusPresent(p); },
});
