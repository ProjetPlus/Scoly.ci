import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ArrowRight, BarChart3, BadgeCheck, Wallet, Users, Sparkles, WifiOff,
  CheckCircle2, Eye, EyeOff, TrendingUp,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MiProjet+ — Structurez, scorez, financez votre activité" },
      { name: "description", content: "Application de structuration pour micro-activités, PME et startups. MIPROJET SCORE, suivi financier, certification et mise en relation avec les financeurs." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <HeroLogin />
      <Features />
      <ScoreSection />
      <Pricing />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/85 border-b">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo className="h-8" />
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="#fonctionnalites" className="hover:text-primary">Fonctionnalités</a>
          <a href="#score" className="hover:text-primary">MIPROJET SCORE</a>
          <a href="#tarifs" className="hover:text-primary">Tarifs</a>
        </nav>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <a
            href="https://ivoireprojet.com"
            className="hidden sm:inline-flex text-sm text-muted-foreground hover:text-primary px-3 py-1.5"
          >
            ← Retour à MIPROJET
          </a>
        </div>
      </div>
    </header>
  );
}

function HeroLogin() {
  return (
    <section className="px-6 pt-12 pb-20 md:pt-20 md:pb-28">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-3 py-1 text-xs font-semibold">
            Application de structuration
          </div>
          <h1 className="mt-6 text-4xl md:text-6xl font-bold leading-[1.05] tracking-tight">
            Transformez votre activité en{" "}
            <span className="text-primary">entreprise finançable</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl">
            MiProjet+ structure vos micro-activités, PME et startups pour les rendre solvables
            et éligibles au financement. Score de maturité, suivi financier, certification et mise
            en relation avec les financeurs.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-3">
            {[
              { k: "100", v: "Score sur 100" },
              { k: "5", v: "Axes d'évaluation" },
              { k: "6", v: "Étapes clés" },
            ].map((s) => (
              <div key={s.v} className="rounded-xl bg-accent/60 p-4 text-center">
                <div className="text-3xl font-bold text-primary">{s.k}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.v}</div>
              </div>
            ))}
          </div>

          <ol className="mt-10 space-y-4">
            {[
              ["01", "Inscription", "Créez votre profil promoteur"],
              ["02", "Collecte", "Saisissez vos données d'activité ou projet"],
              ["03", "Diagnostic", "Obtenez votre MIPROJET SCORE sur 100"],
              ["04", "Structuration", "Améliorez votre dossier avec notre accompagnement"],
              ["05", "Financement", "Accédez aux financeurs partenaires"],
            ].map(([n, t, d]) => (
              <li key={n} className="flex gap-4">
                <div className="w-9 h-9 shrink-0 rounded-full bg-accent text-primary font-bold text-xs flex items-center justify-center">
                  {n}
                </div>
                <div>
                  <div className="font-semibold">{t}</div>
                  <div className="text-sm text-muted-foreground">{d}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <LoginCard />
      </div>
    </section>
  );
}

function LoginCard() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { first_name: firstName },
          },
        });
        if (error) throw error;
        toast.success("Compte créé ! Connexion en cours…");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bienvenue !");
      }
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message || "Erreur d'authentification");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border bg-card shadow-elevated p-8 md:p-10 lg:sticky lg:top-24">
      <div className="flex flex-col items-center text-center">
        <Logo className="h-12" />
        <h2 className="mt-5 text-2xl font-bold">
          {mode === "signin" ? "Connexion à " : "Inscription à "}
          <span className="text-primary">MiProjet+</span>
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "signin"
            ? "Accédez à votre espace de structuration"
            : "Créez votre espace gratuit en quelques secondes"}
        </p>
      </div>

      <form onSubmit={submit} className="mt-8 space-y-4">
        {mode === "signup" && (
          <div>
            <Label htmlFor="firstName">Prénom</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="mt-1.5 h-11"
              placeholder="Votre prénom"
            />
          </div>
        )}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1.5 h-11"
            placeholder="votre@email.com"
          />
        </div>
        <div>
          <Label htmlFor="password">Mot de passe</Label>
          <div className="relative mt-1.5">
            <Input
              id="password"
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="h-11 pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-base font-semibold"
        >
          {loading ? "…" : mode === "signin" ? "Se connecter" : "Créer mon compte"}
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </form>

      <button
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="mt-6 w-full text-center text-sm text-primary hover:underline"
      >
        {mode === "signin"
          ? "Pas encore de compte ? Inscrivez-vous"
          : "Déjà inscrit ? Se connecter"}
      </button>
    </div>
  );
}

function Features() {
  const f = [
    { icon: BarChart3, t: "MIPROJET SCORE", d: "Évaluation sur 100 points de votre activité ou projet" },
    { icon: TrendingUp, t: "Suivi financier", d: "Recettes, dépenses, bénéfices en temps réel" },
    { icon: BadgeCheck, t: "Certification", d: "Rapports certifiés reconnus par les financeurs" },
    { icon: Users, t: "Mise en relation", d: "Connexion avec banques, microfinances et investisseurs" },
    { icon: Wallet, t: "Structuration", d: "Transformation de votre activité en entreprise solvable" },
    { icon: WifiOff, t: "Mode offline", d: "Utilisez l'app sans connexion internet" },
  ];
  return (
    <section id="fonctionnalites" className="py-24 px-6 bg-muted/40">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center text-3xl md:text-5xl font-bold">
          Tout ce dont vous avez besoin pour <span className="text-primary">réussir</span>
        </h2>
        <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {f.map((i) => (
            <div key={i.t} className="rounded-2xl border bg-card p-7 hover:shadow-elevated transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-accent text-primary flex items-center justify-center mb-5">
                <i.icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold">{i.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{i.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ScoreSection() {
  const axes = [
    { v: 15, t: "Juridique & Gouvernance" },
    { v: 25, t: "Financier" },
    { v: 20, t: "Technique & Opérationnel" },
    { v: 20, t: "Marché & Modèle" },
    { v: 20, t: "Impact & Durabilité" },
  ];
  const levels = [
    { r: "80-100", l: "Finançable", color: "bg-primary text-primary-foreground" },
    { r: "60-79", l: "Prometteur", color: "bg-gold text-gold-foreground" },
    { r: "40-59", l: "Fragile", color: "bg-orange-500 text-white" },
    { r: "< 40", l: "Non finançable", color: "bg-destructive text-destructive-foreground" },
  ];
  return (
    <section id="score" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-center text-3xl md:text-5xl font-bold">
          MIPROJET SCORE <span className="text-muted-foreground font-normal text-2xl md:text-3xl">– Évaluation sur 100</span>
        </h2>
        <div className="mt-14 grid md:grid-cols-5 gap-4">
          {axes.map((a) => (
            <div key={a.t} className="rounded-2xl border bg-card p-6 text-center">
              <div className="text-5xl font-bold text-primary">{a.v}</div>
              <div className="mt-3 text-sm font-medium">{a.t}</div>
            </div>
          ))}
        </div>
        <div className="mt-10 grid md:grid-cols-4 gap-3">
          {levels.map((n) => (
            <div key={n.l} className={`${n.color} rounded-xl px-4 py-3 text-center font-semibold text-sm`}>
              {n.r} : {n.l}
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
      features: ["Saisie illimitée des opérations", "Tableau de bord essentiel", "MIPROJET SCORE", "1 projet"],
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
      features: ["Catalogue de projets finançables", "API & intégration", "Tableau de bord investisseur", "Accompagnement dédié"],
      cta: "Nous contacter",
      featured: false,
    },
  ];
  return (
    <section id="tarifs" className="py-24 px-6 bg-muted/40">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-sm font-semibold text-primary uppercase tracking-widest">Tarifs</div>
          <h2 className="mt-4 text-3xl md:text-5xl font-bold">Un modèle pensé pour l'inclusion.</h2>
          <p className="mt-4 text-muted-foreground">
            L'usage quotidien reste gratuit. Vous ne payez que pour les services à forte valeur ajoutée.
          </p>
        </div>
        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl p-8 ${
                p.featured
                  ? "bg-primary text-primary-foreground shadow-elevated scale-[1.02]"
                  : "bg-card border"
              }`}
            >
              <div className="text-sm uppercase tracking-widest opacity-70">{p.name}</div>
              <div className="mt-3 text-4xl font-bold">{p.price}</div>
              <p className={`mt-2 text-sm ${p.featured ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {p.desc}
              </p>
              <ul className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm">
                    <CheckCircle2
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        p.featured ? "text-primary-foreground" : "text-primary"
                      }`}
                    />
                    {f}
                  </li>
                ))}
              </ul>
              <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="block mt-8">
                <Button
                  className={`w-full ${
                    p.featured ? "bg-background text-primary hover:bg-background/90" : ""
                  }`}
                  variant={p.featured ? "default" : "outline"}
                >
                  {p.cta}
                </Button>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <Logo className="h-7" />
          <p className="mt-3 text-sm text-muted-foreground max-w-md">
            Une application de l'écosystème <a href="https://ivoireprojet.com" className="text-primary hover:underline">ivoireprojet.com</a>.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <Link to="/dashboard" className="text-muted-foreground hover:text-primary">Mon espace</Link>
          <a href="#tarifs" className="text-muted-foreground hover:text-primary">Tarifs</a>
          <a href="https://ivoireprojet.com" className="text-muted-foreground hover:text-primary">MIPROJET</a>
          <span className="text-xs text-muted-foreground">© {new Date().getFullYear()} MiProjet+</span>
        </div>
      </div>
    </footer>
  );
}
