import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, TrendingUp, ShieldCheck, Sparkles, Wallet, LineChart,
  BadgeCheck, Mic, Users, Building2, Sprout, Store, CheckCircle2, Target,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MiProjet+ — Structurez, scorez, financez votre activité" },
      { name: "description", content: "La plateforme intelligente de gestion et de finançabilité pour PME, commerçants, coopératives et porteurs de projets en Afrique. Saisie simple, score automatique, accès au financement." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <Trust />
      <Problem />
      <Features />
      <ScoreSection />
      <Journey />
      <Audience />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo className="h-8" />
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="#fonctionnalites" className="hover:text-primary">Fonctionnalités</a>
          <a href="#score" className="hover:text-primary">MiProjet Score</a>
          <a href="#parcours" className="hover:text-primary">Parcours</a>
          <a href="#tarifs" className="hover:text-primary">Tarifs</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/auth"><Button variant="ghost" size="sm">Se connecter</Button></Link>
          <Link to="/auth"><Button size="sm" className="bg-primary hover:bg-primary/90">Commencer</Button></Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden gradient-hero text-white">
      <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
        backgroundSize: "32px 32px",
      }} />
      <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-28 md:pt-28 md:pb-36">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium backdrop-blur">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            La nouvelle infrastructure africaine de confiance financière
          </div>
          <h1 className="mt-6 text-5xl md:text-7xl font-bold leading-[0.95] tracking-tight">
            Rendez votre activité <span className="text-gradient-gold">visible, mesurable, finançable.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/85 leading-relaxed max-w-2xl">
            MiProjet+ est l'assistant intelligent qui structure vos recettes, dépenses et apports,
            calcule votre score de finançabilité et vous prépare au financement. Conçu pour les réalités
            africaines : commerces, PME, coopératives, porteurs de projets.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/auth">
              <Button size="lg" className="gradient-gold text-gold-foreground hover:opacity-95 shadow-glow h-12 px-6 text-base font-semibold">
                Créer mon espace gratuit <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <a href="#score">
              <Button size="lg" variant="outline" className="h-12 px-6 text-base bg-white/5 border-white/30 text-white hover:bg-white/15">
                Voir le MiProjet Score
              </Button>
            </a>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-6 max-w-xl">
            {[
              { k: "0 FCFA", v: "Pour commencer" },
              { k: "5 min", v: "Pour s'enregistrer" },
              { k: "100%", v: "Adapté à l'Afrique" },
            ].map((s) => (
              <div key={s.v}>
                <div className="text-2xl md:text-3xl font-bold text-gold">{s.k}</div>
                <div className="text-xs text-white/70 mt-1">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Trust() {
  const items = [
    { icon: Store, label: "Commerces & PME" },
    { icon: Sprout, label: "Coopératives & Agri" },
    { icon: Building2, label: "Startups & Projets" },
    { icon: Users, label: "Activités informelles" },
  ];
  return (
    <section className="border-y bg-muted/40">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-wrap items-center justify-around gap-6">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">Conçu pour</span>
        {items.map((i) => (
          <div key={i.label} className="flex items-center gap-2 text-sm font-medium">
            <i.icon className="w-4 h-4 text-primary" /> {i.label}
          </div>
        ))}
      </div>
    </section>
  );
}

function Problem() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <div className="text-sm font-semibold text-primary uppercase tracking-widest">Le constat</div>
        <h2 className="mt-4 text-4xl md:text-5xl font-bold">Des millions d'activités, sans données financières fiables.</h2>
        <p className="mt-6 text-lg text-muted-foreground max-w-3xl mx-auto">
          Comptabilité absente ou trop complexe, dépenses sans justificatifs, historique impossible à présenter
          aux banques. MiProjet+ change la donne : vous décrivez votre activité, le système structure tout.
        </p>
        <div className="mt-12 grid md:grid-cols-3 gap-6 text-left">
          {[
            "Absence d'historique financier exploitable",
            "Dépenses légitimes sans factures (marché, terrain, rural)",
            "Difficulté à convaincre banques et investisseurs",
          ].map((t) => (
            <div key={t} className="rounded-xl border bg-card p-6">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center mb-4">!</div>
              <p className="text-sm leading-relaxed">{t}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const f = [
    { icon: Wallet, title: "Saisie ultra simple", desc: "Ventes, achats, dépenses, apports d'associés, prêts, dons. Formulaire ou vocal — chaque opération est horodatée automatiquement." },
    { icon: ShieldCheck, title: "Justificatifs flexibles", desc: "Avec ou sans facture. Le système attribue un niveau de confiance adapté aux réalités du terrain africain." },
    { icon: LineChart, title: "Tableau de bord intelligent", desc: "Chiffre d'affaires, bénéfices, évolution, alertes. Toutes vos données structurées et lisibles." },
    { icon: BadgeCheck, title: "Certification MiProjet+", desc: "Atteignez un niveau de régularité et obtenez une certification numérique reconnue par les financeurs." },
    { icon: Mic, title: "Saisie vocale", desc: "« J'ai vendu pour 12 000 FCFA aujourd'hui » — le système comprend et enregistre. Langues locales prévues." },
    { icon: Target, title: "Préparation au financement", desc: "Dossier généré automatiquement, mise en relation avec banques, fonds et partenaires." },
  ];
  return (
    <section id="fonctionnalites" className="py-24 px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl">
          <div className="text-sm font-semibold text-primary uppercase tracking-widest">Fonctionnalités</div>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold">Un assistant intelligent, pas un logiciel compliqué.</h2>
        </div>
        <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {f.map((i) => (
            <div key={i.title} className="rounded-2xl border bg-card p-7 hover:shadow-elevated transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5">
                <i.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold">{i.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{i.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ScoreSection() {
  const niveaux = [
    { range: "80 – 100", label: "Finançable", color: "bg-success text-success-foreground", desc: "Prêt à être présenté à des financeurs." },
    { range: "60 – 79", label: "Prometteur", color: "bg-gold text-gold-foreground", desc: "Activité solide, derniers ajustements." },
    { range: "40 – 59", label: "Fragile", color: "bg-orange-500 text-white", desc: "Structurer davantage pour gagner en crédibilité." },
    { range: "< 40", label: "À renforcer", color: "bg-destructive text-destructive-foreground", desc: "Étape de fondation : enregistrer régulièrement." },
  ];
  return (
    <section id="score" className="py-24 px-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="text-sm font-semibold text-primary uppercase tracking-widest">MiProjet Score</div>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold">Votre note de finançabilité, calculée en continu.</h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Cinq axes — juridique, financier, technique, marché, impact — pondérés et mis à jour automatiquement
            à partir de votre activité quotidienne. Plus vous enregistrez, plus votre score progresse.
          </p>
          <div className="mt-8 space-y-3">
            {niveaux.map((n) => (
              <div key={n.label} className="flex items-center gap-4 rounded-xl border p-4 bg-card">
                <div className={`${n.color} px-3 py-1.5 rounded-md text-xs font-bold w-24 text-center`}>{n.range}</div>
                <div>
                  <div className="font-semibold">{n.label}</div>
                  <div className="text-xs text-muted-foreground">{n.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="aspect-square rounded-3xl gradient-hero p-12 flex flex-col items-center justify-center text-white shadow-elevated">
            <div className="text-sm uppercase tracking-widest opacity-80">Score global</div>
            <div className="mt-4 text-9xl font-bold text-gradient-gold">82</div>
            <div className="mt-2 px-4 py-1.5 rounded-full bg-gold text-gold-foreground text-sm font-bold">Finançable</div>
            <div className="mt-10 grid grid-cols-5 gap-3 w-full">
              {["Jurid.", "Finan.", "Tech.", "Marché", "Impact"].map((l, idx) => (
                <div key={l} className="text-center">
                  <div className="h-20 bg-white/10 rounded-md relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 right-0 gradient-gold" style={{ height: `${[70, 85, 75, 90, 80][idx]}%` }} />
                  </div>
                  <div className="text-xs mt-2 opacity-80">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Journey() {
  const steps = [
    { n: "01", t: "Diagnostic", d: "Identifiez et évaluez votre activité." },
    { n: "02", t: "Organisation", d: "Mettez en place vos outils de suivi." },
    { n: "03", t: "Structuration", d: "Recettes, dépenses, bénéfices au quotidien." },
    { n: "04", t: "Stabilisation", d: "Vos performances s'améliorent." },
    { n: "05", t: "Crédibilité", d: "Historique financier exploitable construit." },
    { n: "06", t: "Financement", d: "Dossier prêt, mise en relation, accès au capital." },
  ];
  return (
    <section id="parcours" className="py-24 px-6 bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto">
        <div className="text-sm font-semibold text-gold uppercase tracking-widest">Parcours</div>
        <h2 className="mt-4 text-4xl md:text-5xl font-bold max-w-3xl">Six étapes pour passer de l'informel à la finançabilité.</h2>
        <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur p-7">
              <div className="text-5xl font-bold text-gradient-gold">{s.n}</div>
              <div className="mt-4 text-xl font-semibold">{s.t}</div>
              <div className="mt-2 text-sm text-white/75">{s.d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Audience() {
  const audiences = [
    { t: "PME & Commerçants", d: "Suivez votre activité quotidienne, identifiez vos produits les plus rentables." },
    { t: "Coopératives & Agri", d: "Consolidez les opérations de vos membres, accédez au financement collectif." },
    { t: "Porteurs de projet", d: "De l'idée au business plan, structurez chaque étape jusqu'au financement." },
    { t: "Startups", d: "Bâtissez votre crédibilité financière pour convaincre investisseurs et fonds." },
  ];
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold max-w-2xl">Pour chaque acteur de l'économie africaine.</h2>
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {audiences.map((a) => (
            <div key={a.t} className="rounded-2xl border bg-card p-6 hover:border-primary transition-colors">
              <div className="font-display text-lg font-semibold">{a.t}</div>
              <p className="mt-3 text-sm text-muted-foreground">{a.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    {
      name: "Découverte",
      price: "Gratuit",
      desc: "Pour démarrer et structurer son activité.",
      features: ["Saisie illimitée des opérations", "Tableau de bord essentiel", "MiProjet Score", "1 projet"],
      cta: "Commencer",
      featured: false,
    },
    {
      name: "Croissance",
      price: "À venir",
      desc: "Pour les PME et coopératives qui scalent.",
      features: ["Projets illimités", "Rapports certifiés PDF", "Accompagnement humain", "Préparation dossier financement", "Saisie vocale"],
      cta: "Être notifié",
      featured: true,
    },
    {
      name: "Partenaire",
      price: "Sur devis",
      desc: "Pour institutions, banques, fonds.",
      features: ["Accès au catalogue de projets finançables", "API & intégration", "Tableau de bord investisseur", "Accompagnement dédié"],
      cta: "Nous contacter",
      featured: false,
    },
  ];
  return (
    <section id="tarifs" className="py-24 px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-sm font-semibold text-primary uppercase tracking-widest">Tarifs</div>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold">Un modèle pensé pour l'inclusion.</h2>
          <p className="mt-4 text-muted-foreground">L'utilisation quotidienne reste gratuite. Vous ne payez que pour les services à forte valeur ajoutée.</p>
        </div>
        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div key={p.name} className={`rounded-2xl p-8 ${p.featured ? "bg-primary text-primary-foreground shadow-elevated scale-[1.02]" : "bg-card border"}`}>
              <div className="text-sm uppercase tracking-widest opacity-70">{p.name}</div>
              <div className="mt-3 text-4xl font-bold">{p.price}</div>
              <p className={`mt-2 text-sm ${p.featured ? "text-white/80" : "text-muted-foreground"}`}>{p.desc}</p>
              <ul className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm">
                    <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${p.featured ? "text-gold" : "text-primary"}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/auth" className="block mt-8">
                <Button className={`w-full ${p.featured ? "gradient-gold text-gold-foreground hover:opacity-95" : ""}`} variant={p.featured ? "default" : "outline"}>
                  {p.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto rounded-3xl gradient-hero p-12 md:p-20 text-white text-center shadow-elevated">
        <TrendingUp className="w-12 h-12 mx-auto text-gold" />
        <h2 className="mt-6 text-4xl md:text-6xl font-bold">Construisez votre identité financière dès aujourd'hui.</h2>
        <p className="mt-6 text-lg text-white/85 max-w-2xl mx-auto">Rejoignez les entrepreneurs qui transforment leur activité en projet finançable.</p>
        <Link to="/auth" className="inline-block mt-10">
          <Button size="lg" className="gradient-gold text-gold-foreground hover:opacity-95 h-14 px-8 text-base font-semibold shadow-glow">
            Créer mon espace gratuit <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Logo className="h-7" />
          <span className="text-sm text-muted-foreground">© {new Date().getFullYear()} MiProjet+ · Un produit de l'écosystème <a href="https://ivoireprojet.com" className="underline hover:text-primary">ivoireprojet.com</a></span>
        </div>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <a href="#fonctionnalites" className="hover:text-primary">Fonctionnalités</a>
          <a href="#score" className="hover:text-primary">Score</a>
          <a href="#tarifs" className="hover:text-primary">Tarifs</a>
        </div>
      </div>
    </footer>
  );
}
