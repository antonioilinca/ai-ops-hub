"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Logo, LogoMark } from "@/components/logo";
import { ScrollReveal } from "@/components/scroll-reveal";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <Navbar />
      <Hero />
      <LogoBar />
      <Features />
      <HowItWorks />
      <Stats />
      <Pricing />
      <CtaBanner />
      <Footer />
    </div>
  );
}

/* ─── NAVBAR ─────────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close menu on resize
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 nav-blur ${
          scrolled
            ? "bg-white/90 border-b border-gray-100 shadow-sm"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex-shrink-0" onClick={() => setMenuOpen(false)}>
            <Logo size={30} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors font-medium">Fonctionnalités</a>
            <a href="#how"      className="hover:text-indigo-600 transition-colors font-medium">Comment ça marche</a>
            <a href="#pricing"  className="hover:text-indigo-600 transition-colors font-medium">Tarifs</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors px-3 py-2">
              Se connecter
            </Link>
            <Link href="/login" className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-200">
              Commencer gratuitement →
            </Link>
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col justify-center gap-1.5 w-9 h-9 items-center"
            aria-label="Menu"
          >
            <span className={`block w-6 h-0.5 bg-gray-700 transition-all duration-300 origin-center ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-6 h-0.5 bg-gray-700 transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : ""}`} />
            <span className={`block w-6 h-0.5 bg-gray-700 transition-all duration-300 origin-center ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 pt-16 md:hidden animate-slide-down">
          <div className="bg-white/95 nav-blur border-b border-gray-100 shadow-xl px-5 py-6 flex flex-col gap-4">
            <a href="#features" onClick={() => setMenuOpen(false)} className="text-gray-800 font-semibold text-lg py-2 border-b border-gray-100">Fonctionnalités</a>
            <a href="#how"      onClick={() => setMenuOpen(false)} className="text-gray-800 font-semibold text-lg py-2 border-b border-gray-100">Comment ça marche</a>
            <a href="#pricing"  onClick={() => setMenuOpen(false)} className="text-gray-800 font-semibold text-lg py-2 border-b border-gray-100">Tarifs</a>
            <div className="flex flex-col gap-3 pt-2">
              <Link href="/login" onClick={() => setMenuOpen(false)} className="text-center py-3 border border-gray-200 rounded-xl text-gray-700 font-medium">
                Se connecter
              </Link>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="text-center py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200">
                Commencer gratuitement →
              </Link>
            </div>
          </div>
          <div className="flex-1 bg-black/20" onClick={() => setMenuOpen(false)} />
        </div>
      )}
    </>
  );
}

/* ─── HERO ───────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative pt-28 pb-20 px-5 text-center hero-glow overflow-hidden">
      {/* Ambient bg blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 text-sm text-indigo-700 font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse-glow" />
          Automatisation B2B propulsée par l&apos;IA
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-900 leading-[1.1] mb-6">
          Automatisez vos tâches{" "}
          <span className="text-gradient-animate">répétitives</span>
          <br className="hidden sm:block" />
          {" "}en quelques minutes
        </h1>

        <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          OpsAI vous donne des templates prêts à l&apos;emploi et des formulaires intelligents pour automatiser vos process.
          Gagnez des heures chaque semaine sans écrire une seule ligne de code.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link
            href="/login"
            className="w-full sm:w-auto bg-indigo-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all text-base shadow-xl shadow-indigo-200 animate-pulse-glow"
          >
            Démarrer gratuitement
          </Link>
          <a
            href="#how"
            className="w-full sm:w-auto text-gray-700 font-semibold px-8 py-4 rounded-xl border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50 transition-all text-base"
          >
            Voir comment ça marche →
          </a>
        </div>

        {/* App mockup flottant */}
        <div className="relative mx-auto max-w-4xl animate-float">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/30 rounded-2xl z-10 pointer-events-none" />
          <div className="rounded-2xl border border-gray-200 shadow-2xl shadow-indigo-100/60 overflow-hidden bg-gray-50">
            {/* Browser chrome */}
            <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 mx-3">
                <div className="bg-gray-100 rounded-md h-6 flex items-center px-3 text-xs text-gray-400 max-w-xs mx-auto">
                  app.opsai.fr/dashboard
                </div>
              </div>
            </div>

            <div className="flex h-64 sm:h-72 bg-white">
              {/* Sidebar */}
              <div className="hidden sm:block w-48 border-r border-gray-100 p-4 shrink-0">
                <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
                  <LogoMark size={28} />
                  <div>
                    <div className="h-2.5 bg-gray-200 rounded w-16 mb-1" />
                    <div className="h-2 bg-gray-100 rounded w-10" />
                  </div>
                </div>
                {["Dashboard","Workflows","Templates","Formulaires","Facturation"].map((item,i) => (
                  <div key={item} className={`flex items-center gap-2 px-2 py-2 rounded-lg mb-0.5 ${i===0?"bg-indigo-50":""}`}>
                    <div className={`w-4 h-4 rounded ${i===0?"bg-indigo-300":"bg-gray-200"}`} />
                    <div className={`h-2 rounded ${i===0?"bg-indigo-400 w-14":"bg-gray-200 w-16"}`} />
                  </div>
                ))}
              </div>

              {/* Main */}
              <div className="flex-1 p-5">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-36 mb-1.5" />
                    <div className="h-2.5 bg-gray-100 rounded w-48" />
                  </div>
                  <div className="h-8 bg-indigo-600 rounded-lg w-28 opacity-80" />
                </div>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[["⚡","3"],["✅","142"],["⏱","28h"]].map(([icon,val]) => (
                    <div key={icon} className="border border-gray-100 rounded-xl p-3 bg-white">
                      <div className="flex justify-between items-start mb-2">
                        <div className="h-2 bg-gray-200 rounded w-16" />
                        <span className="text-sm">{icon}</span>
                      </div>
                      <div className="text-xl font-bold text-gray-800 animate-count-up">{val}</div>
                    </div>
                  ))}
                </div>
                <div className="border border-gray-100 rounded-xl p-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-4 bg-green-100 rounded-full" />
                        <div className="h-2 bg-gray-200 rounded w-24" />
                      </div>
                      <div className="h-2 bg-gray-100 rounded w-14" />
                    </div>
                  ))}
                </div>
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
  const useCases = ["Ventes","Ops","RH","Marketing","Finance","Support"];
  return (
    <section className="py-10 px-5 border-y border-gray-100 bg-gray-50/60">
      <div className="max-w-5xl mx-auto">
        <p className="text-center text-xs text-gray-400 font-semibold uppercase tracking-widest mb-6">Templates prêts à l&apos;emploi pour chaque métier</p>
        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3">
          {useCases.map((name) => (
            <span key={name} className="text-gray-400 font-bold text-sm md:text-base hover:text-indigo-500 transition-colors cursor-default select-none">
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
    { icon: "⚡", title: "Workflows sans code",    desc: "Créez des automatisations complexes en quelques clics. Configurez le déclencheur, les étapes et les actions, sans une ligne de code." },
    { icon: "🤖", title: "IA intégrée",            desc: "Analyse de texte, classification, résumé automatique, réponses générées par Claude AI directement dans vos workflows." },
    { icon: "📦", title: "17 templates métier",      desc: "Ventes, Ops, RH, Marketing, Finance, Support : choisissez un template prêt à l'emploi et lancez votre workflow en 2 minutes." },
    { icon: "📋", title: "Logs et monitoring",     desc: "Chaque exécution est tracée en temps réel. Déboguer un workflow n'a jamais été aussi simple." },
    { icon: "👥", title: "Multi-équipes",           desc: "Gérez les accès par rôle (owner, admin, member). Chaque équipe a son espace isolé et sécurisé." },
    { icon: "🛡️", title: "Sécurité enterprise",    desc: "Données chiffrées, authentification sécurisée, conformité RGPD. Votre ops en toute sérénité." },
  ];

  return (
    <section id="features" className="py-20 px-5">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal direction="up">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4 tracking-tight">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              OpsAI regroupe tout ce qu&apos;une équipe ops moderne exige, dans une seule plateforme.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <ScrollReveal key={f.title} direction="up" delay={i * 80}>
              <div className="p-6 rounded-2xl border border-gray-100 card-hover bg-white group cursor-default">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:bg-indigo-100 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── HOW IT WORKS ───────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    { num:"01", title:"Choisissez un template",   desc:"Parcourez nos 17 templates par métier : ventes, ops, RH, finance... Sélectionnez celui qui correspond à votre besoin.", icon:"📦" },
    { num:"02", title:"Créez votre workflow",     desc:"Choisissez un type de workflow, configurez les paramètres et activez. Tout est guidé, étape par étape.", icon:"🗺️" },
    { num:"03", title:"Activez et oubliez",       desc:"OpsAI s'occupe du reste. Vos workflows tournent 24h/24, vous recevez des alertes si quelque chose cloche.", icon:"🚀" },
  ];

  return (
    <section id="how" className="py-20 px-5 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal direction="up">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4 tracking-tight">
              Opérationnel en 10 minutes
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Pas de setup long. Pas de consultant. Autonome dès le premier jour.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-10 left-1/6 right-1/6 h-px bg-gradient-to-r from-indigo-100 via-indigo-300 to-indigo-100 z-0" style={{left:"18%",right:"18%"}} />

          {steps.map((step, i) => (
            <ScrollReveal key={step.num} direction="up" delay={i * 120}>
              <div className="relative z-10 text-center md:text-left">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white border-2 border-indigo-100 text-2xl mb-5 shadow-md shadow-indigo-50 card-hover">
                  {step.icon}
                </div>
                <div className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">{step.num}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── STATS ──────────────────────────────────────────────────── */
function Stats() {
  const stats = [
    { value: "6", label: "Types de workflows prêts à l'emploi" },
    { value: "17",   label: "Templates prêts à l'emploi" },
    { value: "44",   label: "Formations dans l'Academy" },
    { value: "~14h", label: "Économisées / semaine en moyenne" },
  ];
  return (
    <section className="py-16 px-5 bg-indigo-600">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <ScrollReveal key={s.label} direction="up" delay={i * 80}>
              <div>
                <div className="text-3xl sm:text-4xl font-black text-white mb-1">{s.value}</div>
                <div className="text-sm text-indigo-200 font-medium">{s.label}</div>
              </div>
            </ScrollReveal>
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
      name: "Starter", price: "29€", period: "/mois",
      desc: "Idéal pour les petites équipes qui veulent automatiser sans complexité.",
      features: ["Jusqu'à 5 workflows actifs","3 membres max","Tous les templates","Formulaires illimités","Support par email"],
      cta: "Commencer", highlight: false,
    },
    {
      name: "Team", price: "79€", period: "/mois",
      badge: "✨ Populaire",
      desc: "Pour les équipes en croissance qui ont besoin de puissance et de collaboration.",
      features: ["Jusqu'à 20 workflows actifs","15 membres max","Tous les templates","Formulaires illimités","IA Claude intégrée","Multi-utilisateurs & rôles","Academy complète","Support prioritaire"],
      cta: "Commencer", highlight: true,
    },
  ];

  return (
    <section id="pricing" className="py-20 px-5">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal direction="up">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4 tracking-tight">
              Des prix simples et transparents
            </h2>
            <p className="text-lg text-gray-500">Un plan gratuit pour démarrer, sans carte bancaire.</p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan, i) => (
            <ScrollReveal key={plan.name} direction="up" delay={i * 120}>
              <div className={`rounded-2xl p-8 border card-hover h-full flex flex-col ${
                plan.highlight
                  ? "border-indigo-500 bg-indigo-600 text-white shadow-2xl shadow-indigo-200 scale-[1.02]"
                  : "border-gray-200 bg-white"
              }`}>
                {plan.badge && (
                  <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 w-fit">
                    {plan.badge}
                  </span>
                )}
                <div className={`font-black text-xl mb-1 ${plan.highlight ? "text-white" : "text-gray-900"}`}>{plan.name}</div>
                <p className={`text-sm mb-5 ${plan.highlight ? "text-indigo-200" : "text-gray-500"}`}>{plan.desc}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className={`text-4xl font-black ${plan.highlight ? "text-white" : "text-gray-900"}`}>{plan.price}</span>
                  <span className={`text-sm ${plan.highlight ? "text-indigo-200" : "text-gray-400"}`}>{plan.period}</span>
                </div>
                <Link href="/login" className={`block w-full text-center font-bold py-3 rounded-xl transition-all active:scale-95 mb-6 ${
                  plan.highlight ? "bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg" : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                }`}>
                  {plan.cta}
                </Link>
                <ul className="space-y-2.5 flex-1">
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
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA BANNER ─────────────────────────────────────────────── */
function CtaBanner() {
  return (
    <section className="py-20 px-5">
      <ScrollReveal direction="up">
        <div className="max-w-4xl mx-auto relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 p-10 sm:p-16 text-center shadow-2xl shadow-indigo-200">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_60%)] pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Prêt à gagner des heures chaque semaine ?</h2>
            <p className="text-indigo-200 text-lg mb-8 max-w-xl mx-auto">Rejoignez les équipes ops qui font confiance à OpsAI pour automatiser leur quotidien.</p>
            <Link href="/login" className="inline-block bg-white text-indigo-600 font-black px-8 py-4 rounded-xl hover:bg-indigo-50 active:scale-95 transition-all text-base shadow-xl">
              Démarrer gratuitement
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}

/* ─── FOOTER ─────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-gray-100 py-10 px-5">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <Logo size={28} />
        <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
          <a href="#features" className="hover:text-indigo-600 transition-colors">Fonctionnalités</a>
          <a href="#pricing"  className="hover:text-indigo-600 transition-colors">Tarifs</a>
          <Link href="/login" className="hover:text-indigo-600 transition-colors">Connexion</Link>
        </div>
        <p className="text-xs text-gray-400">© {new Date().getFullYear()} OpsAI · Fait avec ❤️ en France</p>
      </div>
    </footer>
  );
}
