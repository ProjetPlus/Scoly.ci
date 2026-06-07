import { recordFlow } from "./financial-types";

interface ProjectInput {
  has_accounting?: boolean | null;
  has_bank_account?: boolean | null;
  has_business_plan?: boolean | null;
  annual_revenue?: number | null;
  employees_count?: number | null;
  creation_date?: string | null;
  legal_status?: string | null;
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
  score_juridique: number;
  score_financier: number;
  score_technique: number;
  score_marche: number;
  score_impact: number;
  score_global: number;
  niveau: "Finançable" | "Prometteur" | "Fragile" | "À renforcer";
  forces: string[];
  faiblesses: string[];
  recommandations: string[];
  totaux: { entrees: number; sorties: number; benefice: number; nbOperations: number };
}

// Courbe lente: progression asymptotique vers 100.
// target → ~63, 2×target → ~86, 3×target → ~95
function softCap(value: number, target: number, k = 1): number {
  if (value <= 0 || target <= 0) return 0;
  return 100 * (1 - Math.exp(-k * (value / target)));
}

function legalStatusPresent(s?: string | null): boolean {
  const v = (s ?? "").toLowerCase();
  return !!v && v !== "informel" && v !== "autre";
}

function uniqueMonths(records: { record_date: string }[]): number {
  const set = new Set<string>();
  for (const r of records) {
    if (!r.record_date) continue;
    set.add(r.record_date.slice(0, 7));
  }
  return set.size;
}

export function computeScore(project: ProjectInput, records: RecordInput[]): ScoreResult {
  const entrees = records.filter((r) => recordFlow(r.record_type) === "in").reduce((s, r) => s + Number(r.amount), 0);
  const sorties = records.filter((r) => recordFlow(r.record_type) === "out").reduce((s, r) => s + Number(r.amount), 0);
  const benefice = entrees - sorties;
  const nbOperations = records.length;
  const nbWithReceipt = records.filter((r) => !!r.receipt_path).length;
  const receiptRatio = nbOperations > 0 ? nbWithReceipt / nbOperations : 0;
  const monthsCovered = uniqueMonths(records);

  const ageMonths = project.creation_date
    ? Math.max(0, (Date.now() - new Date(project.creation_date).getTime()) / (1000 * 60 * 60 * 24 * 30))
    : 0;
  const ageYears = ageMonths / 12;

  // ────────────────── JURIDIQUE (poids 15%) ──────────────────
  let juridique = 0;
  juridique += 0.5 * softCap(ageMonths, 24); // ancienneté
  if (project.has_bank_account) juridique += 18;
  if (legalStatusPresent(project.legal_status)) juridique += 12;
  juridique += Math.min(20, ageYears * 4);
  juridique = Math.min(100, juridique);

  // ────────────────── FINANCIER (poids 25%) ──────────────────
  let financier = 0;
  if (project.has_accounting) financier += 8;
  financier += 0.6 * softCap(monthsCovered, 12);
  financier += 0.25 * softCap(nbOperations, 100);
  financier += 15 * receiptRatio; // justificatifs
  if (benefice > 0 && monthsCovered >= 3 && nbOperations >= 10) {
    financier += Math.min(12, (benefice / Math.max(1, sorties)) * 20);
  }
  financier = Math.min(100, Math.max(0, financier));

  // ────────────────── TECHNIQUE (poids 20%) ──────────────────
  let technique = 0;
  if (project.has_business_plan) technique += 22;
  if ((project.employees_count ?? 0) > 0) technique += Math.min(18, (project.employees_count ?? 0) * 3);
  if (project.product_description && project.product_description.length > 60) technique += 12;
  if (project.commercialization && project.commercialization.length > 60) technique += 12;
  if (project.monitoring_evaluation && project.monitoring_evaluation.length > 60) technique += 10;
  technique += 0.25 * softCap(nbOperations, 60);
  technique = Math.min(100, technique);

  // ────────────────── MARCHÉ (poids 20%) ──────────────────
  let marche = 0;
  marche += 0.7 * softCap(entrees, 8_000_000, 0.7);
  if (project.target_customers && project.target_customers.length > 40) marche += 12;
  if (project.short_pitch && project.short_pitch.length > 80) marche += 8;
  if (entrees > 0 && monthsCovered >= 3) marche += 10;
  marche = Math.min(100, marche);

  // ────────────────── IMPACT (poids 20%) ──────────────────
  let impact = 0;
  impact += Math.min(35, (project.employees_count ?? 0) * 6);
  impact += Math.min(20, ageYears * 5);
  impact += 0.3 * softCap(monthsCovered, 12);
  if (project.cover_url) impact += 8;
  if (project.logo_url) impact += 5;
  impact = Math.min(100, impact);

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

export function niveauColor(niveau: string): string {
  if (niveau === "Finançable") return "text-success bg-success/10 border-success/30";
  if (niveau === "Prometteur") return "text-gold bg-gold/10 border-gold/30";
  if (niveau === "Fragile") return "text-warning bg-warning/10 border-warning/30";
  return "text-destructive bg-destructive/10 border-destructive/30";
}
