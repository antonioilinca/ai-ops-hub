import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <Navbar />
      <Hero />
      <LogoBar />
      <Features />
      <HowItWorks />
      <Pricing />
      <CtaBanner />
      <Footer />
    </div>
  );
}

/* ─── NAVBAR ─────────────────────────────────────────────────── */
function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            O
          </div>
          <span className="text-lg font-semibold tracking-tight">OpsAI</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600">
          <a href="#features" className="hover:text-gray-900 transition-colors">Fonctionnalités</a>
          <a href="#how" className="hover:text-gray-900 transition-colors">Comment ça marche</a>
          <a href="#pricing" className="hover:text-gray-900 transition-colors">Tarifs</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">
            Se connecter
          </Link>
          <Link
            href="/login"
            className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Commencer gratuitement →
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ─── HERO ───────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="pt-32 pb-24 px-6 text-center bg-gradient-to-b from-indigo-50/60 to-white">
      <div className="max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 text-sm text-indigo-700 font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          Automatisation B2B propulsée par l&apos;IA
        </div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 leading-tight mb-6">
          Automatisez vos tâches{" "}
          <span className="text-indigo-600">répétitives</span>
          <br />en quelques minutes
        </h1>

        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          OpsAI connecte vos outils métiers et exécute vos workflows automatiquement.
          Gagnez des heures chaque semaine sans écrire une seule ligne de code.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link
            href="/login"
            className="w-full sm:w-auto bg-indigo-600 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-indigo-700 transition-colors text-base shadow-lg shadow-indigo-200"
          >
            Démarrer gratuitement
          </Link>
          <a
            href="#how"
            className="w-full sm:w-auto text-gray-700 font-medium px-8 py-3.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-base"
          >
            Voir comment ça marche →
          </a>
        </div>

        {/* App mockup */}
        <div className="relative mx-auto max-w-4xl rounded-2xl border border-gray-200 shadow-2xl shadow-gray-200/60 overflow-hidden bg-gray-50">
          <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-gray-100 rounded-md h-6 flex items-center px-3 text-xs text-gray-400 max-w-xs mx-auto">
                app.opsai.fr/dashboard
              </div>
            </div>
          </div>
          <div className="flex h-72 bg-white">
            {/* Sidebar mockup */}
            <div className="w-52 border-r border-gray-100 p-4 shrink-0">
              <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-gray-100">
                <div className="w-7 h-7 bg-indigo-600 rounded-md" />
                <div>
                  <div className="h-3 bg-gray-200 rounded w-20 mb-1" />
                  <div className="h-2 bg-gray-100 rounded w-12" />
                </div>
              </div>
              {["Dashboard", "Workflows", "Intégrations", "Logs", "Facturation"].map((item, i) => (
                <div key={item} className={`flex items-center gap-2.5 px-2 py-2 rounded-lg mb-0.5 ${i === 0 ? "bg-indigo-50" : ""}`}>
                  <div className={`w-4 h-4 rounded ${i === 0 ? "bg-indigo-200" : "bg-gray-200"}`} />
                  <div className={`h-2.5 rounded ${i === 0 ? "bg-indigo-300 w-16" : "bg-gray-200 w-20"}`} />
                </div>
              ))}
            </div>
            {/* Main content mockup */}
            <div className="flex-1 p-6">
              <div className="h-5 bg-gray-200 rounded w-40 mb-1" />
              <div className="h-3 bg-gray-100 rounded w-56 mb-6" />
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[["⚡", "3", "Workflows actifs"], ["✅", "142", "Exécutions réussies"], ["⏱", "~28h", "Temps économisé"]].map(([icon, val, label]) => (
                  <div key={label} className="border border-gray-100 rounded-xl p-4 bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <div className="h-2.5 bg-gray-200 rounded w-20" />
                      <span className="text-base">{icon}</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{val}</div>
                    <div className="h-2 bg-gray-100 rounded w-24 mt-1" />
                  </div>
                ))}
              </div>
              <div className="border border-gray-100 rounded-xl p-4">
                <div className="h-3 bg-gray-200 rounded w-32 mb-3" />
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2">
                      <div className="w-14 h-5 bg-green-100 rounded-full" />
                      <div className="h-2.5 bg-gray-200 rounded w-28" />
                    </div>
                    <div className="h-2 bg-gray-100 rounded w-16" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── LOGO BAR ───────────────────────────────────────────────── */
function LogoBar() {
  const companies = ["Notion", "Slack", "HubSpot", "Stripe", "Airtable", "GitHub", "Gmail", "Zapier"];
  return (
    <section className="py-12 px-6 border-y border-gray-100 bg-gray-50/50">
      <div className="max-w-5xl mx-auto">
        <p className="text-center text-sm text-gray-400 font-medium mb-8 uppercase tracking-widest">
          Compatible avec vos outils
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-4">
          {companies.map((name) => (
            <span key={name} className="text-gray-400 font-semibold text-base hover:text-gray-600 transition-colors">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FEATURES ───────────────────────────────────────────────── */
function Features() {
  const features = [
    {
      icon: "⚡",
      title: "Workflows sans code",
      desc: "Créez des automatisations complexes via une interface visuelle. Connectez vos apps en quelques clics, sans une ligne de code.",
    },
    {
      icon: "🤖",
      title: "IA intégrée",
      desc: "Ajoutez de l'intelligence à vos workflows : analyse de texte, classification, résumé automatique, réponses générées par Claude.",
    },
    {
      icon: "🔗",
      title: "100+ intégrations",
      desc: "Slack, Notion, HubSpot, Gmail, Stripe, Airtable... Tous vos outils métiers connectés en natif.",
    },
    {
      icon: "📋",
      title: "Logs et monitoring",
      desc: "Chaque exécution est tracée en temps réel. Déboguer un workflow n'a jamais été aussi simple.",
    },
    {
      icon: "👥",
      title: "Multi-équipes",
      desc: "Gérez les accès par rôle (owner, admin, member). Chaque équipe a son espace isolé et sécurisé.",
    },
    {
      icon: "🛡️",
      title: "Sécurité enterprise",
      desc: "Données chiffrées, authentification sécurisée, conformité RGPD. Votre ops en toute sérénité.",
    },
  ];

  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            OpsAI regroupe tout ce qu&apos;une équipe ops moderne exige, dans une seule plateforme.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="p-6 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:bg-indigo-100 transition-colors">
                {f.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── HOW IT WORKS ───────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Connectez vos outils",
      desc: "Ajoutez vos intégrations en 2 clics : Slack, Gmail, Notion, HubSpot... Pas besoin de clé API compliquée.",
    },
    {
      num: "02",
      title: "Créez votre workflow",
      desc: "Définissez le déclencheur, les étapes et les actions. L'éditeur visuel rend ça aussi simple qu'un diagramme.",
    },
    {
      num: "03",
      title: "Activez et oubliez",
      desc: "OpsAI s'occupe du reste. Vos workflows tournent 24h/24, vous recevez des alertes si quelque chose cloche.",
    },
  ];

  return (
    <section id="how" className="py-24 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Opérationnel en 10 minutes
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Pas de setup long. Pas de consultant. Vous êtes autonome dès le premier jour.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={step.num} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-indigo-200 to-transparent z-0" />
              )}
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white border-2 border-indigo-100 text-indigo-600 font-bold text-lg mb-5 shadow-sm">
                  {step.num}
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── PRICING ────────────────────────────────────────────────── */
function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "29€",
      period: "/mois",
      desc: "Idéal pour les petites équipes qui veulent automatiser sans complexité.",
      features: [
        "Jusqu'à 5 workflows actifs",
        "1 000 exécutions / mois",
        "10+ intégrations",
        "Logs 7 jours",
        "Support par email",
      ],
      cta: "Commencer",
      highlight: false,
    },
    {
      name: "Team",
      price: "79€",
      period: "/mois",
      desc: "Pour les équipes en croissance qui ont besoin de puissance et de collaboration.",
      features: [
        "Workflows illimités",
        "10 000 exécutions / mois",
        "100+ intégrations",
        "Logs 30 jours",
        "IA Claude intégrée",
        "Multi-utilisateurs & rôles",
        "Support prioritaire",
      ],
      cta: "Commencer",
      highlight: true,
    },
  ];

  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Des prix simples et transparents
          </h2>
          <p className="text-lg text-gray-500">
            14 jours d&apos;essai gratuit, sans carte bancaire.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 border ${
                plan.highlight
                  ? "border-indigo-500 bg-indigo-600 text-white shadow-xl shadow-indigo-200"
                  : "border-gray-200 bg-white"
              }`}
            >
              {plan.highlight && (
                <div className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                  ✨ Populaire
                </div>
              )}
              <h3 className={`font-bold text-xl mb-1 ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                {plan.name}
              </h3>
              <p className={`text-sm mb-4 ${plan.highlight ? "text-indigo-200" : "text-gray-500"}`}>
                {plan.desc}
              </p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className={`text-4xl font-bold ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                  {plan.price}
                </span>
                <span className={`text-sm ${plan.highlight ? "text-indigo-200" : "text-gray-400"}`}>
                  {plan.period}
                </span>
              </div>
              <Link
                href="/login"
                className={`block w-full text-center font-semibold py-3 rounded-xl transition-colors mb-6 ${
                  plan.highlight
                    ? "bg-white text-indigo-600 hover:bg-indigo-50"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                {plan.cta}
              </Link>
              <ul className="space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className={`flex items-center gap-2 text-sm ${plan.highlight ? "text-indigo-100" : "text-gray-600"}`}>
                    <svg className={`w-4 h-4 shrink-0 ${plan.highlight ? "text-indigo-300" : "text-indigo-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA BANNER ─────────────────────────────────────────────── */
function CtaBanner() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto bg-indigo-600 rounded-3xl p-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.1),transparent_60%)]" />
        <div className="relative">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Prêt à gagner des heures chaque semaine ?
          </h2>
          <p className="text-indigo-200 text-lg mb-8 max-w-xl mx-auto">
            Rejoignez les équipes ops qui font confiance à OpsAI pour automatiser leur quotidien.
          </p>
          <Link
            href="/login"
            className="inline-block bg-white text-indigo-600 font-semibold px-8 py-3.5 rounded-xl hover:bg-indigo-50 transition-colors text-base shadow-lg"
          >
            Démarrer gratuitement — 14 jours sans CB
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── FOOTER ─────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-gray-100 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center text-white font-bold text-xs">
              O
            </div>
            <span className="font-semibold">OpsAI</span>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-400">Automatisez votre opérationnel</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-400">
            <a href="#features" className="hover:text-gray-600 transition-colors">Fonctionnalités</a>
            <a href="#pricing" className="hover:text-gray-600 transition-colors">Tarifs</a>
            <Link href="/login" className="hover:text-gray-600 transition-colors">Connexion</Link>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} OpsAI. Tous droits réservés.</p>
          <p>Fait avec ❤️ en France</p>
        </div>
      </div>
    </footer>
  );
}
