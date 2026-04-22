"use client";

import {
  AlertCircle,
  ArrowRight,
  AudioLines,
  Bell,
  CalendarClock,
  Check,
  Database,
  Gavel,
  ImageIcon,
  Radio,
  Search,
  ShieldCheck,
  Settings2,
  Sparkles,
  Target,
} from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

const FORMS_URL = "https://forms.gle/rbHraM9f5jZR2uQB8";
const CONTACT_EMAIL = "hola@monitordemarcas.com";

function useScrollReveal() {
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>(".reveal");
    if (nodes.length === 0) return;

    const markIfInView = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.top < vh && rect.bottom > 0) {
        el.classList.add("visible");
      }
    };

    if (typeof IntersectionObserver === "undefined") {
      nodes.forEach((n) => n.classList.add("visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { rootMargin: "0px 0px -5% 0px", threshold: 0 },
    );

    nodes.forEach((n) => {
      markIfInView(n);
      io.observe(n);
    });

    return () => io.disconnect();
  }, []);
}

function Section({
  id,
  className = "",
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`relative py-24 ${className}`}>
      <div className="container mx-auto px-6">{children}</div>
    </section>
  );
}

const btnPrimarySizeClass = {
  /** Matches shadcn `Button` `size="sm"` (used in original header) */
  sm: "h-9 min-h-9 rounded-md px-3 text-sm",
  /** Default primary */
  md: "h-11 min-h-11 rounded-md px-8 text-sm",
  /** Hero + large CTAs (min height only so wrapped labels don’t clip) */
  lg: "min-h-12 rounded-md px-8 py-3 text-base",
} as const;

function BtnPrimary({
  href,
  size = "md",
  children,
  className = "",
  ...a
}: Omit<React.ComponentProps<"a">, "href"> & {
  href: string;
  size?: keyof typeof btnPrimarySizeClass;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 bg-gradient-accent font-semibold text-background shadow-glow transition hover:opacity-90 ${btnPrimarySizeClass[size]} ${className}`}
      {...a}
    >
      {children}
    </a>
  );
}

const btnOutlineSizeClass = {
  sm: "h-9 min-h-9 rounded-md px-3 text-sm",
  md: "h-11 min-h-11 rounded-md px-8 text-sm",
  lg: "min-h-12 rounded-md px-8 py-3 text-base",
} as const;

function BtnOutline({
  size = "md",
  children,
  className = "",
  ...a
}: React.ComponentProps<"a"> & {
  size?: keyof typeof btnOutlineSizeClass;
}) {
  return (
    <a
      className={`inline-flex items-center justify-center text-center no-underline border border-border bg-card font-semibold text-foreground transition hover:bg-secondary ${btnOutlineSizeClass[size]} ${className}`}
      {...a}
    >
      {children}
    </a>
  );
}

const problemItems: { icon: typeof Search; text: string }[] = [
  { icon: CalendarClock, text: "Revisar publicaciones todos los días" },
  { icon: Search, text: "Perder tiempo buscando antecedentes" },
  { icon: AlertCircle, text: "Detectar conflictos tarde" },
  { icon: Settings2, text: "Depender de procesos manuales" },
];

const solutionItems: { icon: typeof Database; title: string; text: string }[] =
  [
    {
      icon: Database,
      title: "Base de datos propia",
      text: "Tus marcas, ordenadas y accesibles",
    },
    {
      icon: Radio,
      title: "Monitoreo automático",
      text: "El sistema revisa por vos",
    },
    {
      icon: Bell,
      title: "Alertas inteligentes",
      text: "Solo lo que realmente importa",
    },
  ];

const benefitItems: { icon: typeof Search; text: string }[] = [
  { icon: Sparkles, text: "Ahorrás horas de revisión manual" },
  { icon: Target, text: "Detectás riesgos antes que otros" },
  { icon: Database, text: "Tenés toda la información en un solo lugar" },
  { icon: Gavel, text: "Podés actuar con tiempo y criterio" },
];

const stepItems: { n: string; title: string; text: string }[] = [
  { n: "01", title: "Cargás tus marcas", text: "Tu base de datos organizada" },
  {
    n: "02",
    title: "El sistema monitorea publicaciones",
    text: "Cruce automático con boletines INPI",
  },
  {
    n: "03",
    title: "Recibís alertas relevantes",
    text: "Solo coincidencias con riesgo real",
  },
];

const alertChips: { icon: typeof AudioLines; title: string }[] = [
  { icon: AudioLines, title: "Similitudes fonéticas" },
  { icon: ImageIcon, title: "Similitudes gráficas" },
  { icon: Search, title: "Coincidencias no literales" },
];

function Header() {
  return (
    <header className="header-glass fixed inset-x-0 top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <a href="#top" className="flex items-center gap-2 font-display font-semibold">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-accent shadow-glow">
            <ShieldCheck className="h-4 w-4 text-background" />
          </div>
          <span>Monitor de Marcas</span>
        </a>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a
            href="#problema"
            className="transition-colors hover:text-foreground"
          >
            Problema
          </a>
          <a
            href="#solucion"
            className="transition-colors hover:text-foreground"
          >
            Solución
          </a>
          <a
            href="#como-funciona"
            className="transition-colors hover:text-foreground"
          >
            Cómo funciona
          </a>
          <a href="#cta" className="transition-colors hover:text-foreground">
            Demo
          </a>
        </nav>
        <BtnPrimary size="sm" href={FORMS_URL}>
          Solicitar demo
        </BtnPrimary>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-gradient-hero pt-32 pb-24"
    >
      <div className="grid-pattern pointer-events-none absolute inset-0 opacity-40" />
      <div
        className="pointer-events-none absolute inset-0 opacity-30 mix-blend-screen"
        style={{
          backgroundImage: "url(/hero-bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="bg-gradient-glow pointer-events-none absolute inset-0 opacity-45" />
      <div className="pointer-events-none absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-accent-cyan/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-1/3 h-80 w-80 rounded-full bg-accent-violet/20 blur-3xl" />
      <div className="container relative z-10 mx-auto">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-accent-cyan" />
              Legal-tech para propiedad intelectual
            </div>
            <h1 className="mb-6 text-5xl font-bold leading-[1.05] md:text-6xl lg:text-7xl">
              Dejá de revisar{" "}
              <br />
              <span className="text-gradient">boletines manualmente</span>
            </h1>
            <p className="mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
              <strong className="font-semibold text-foreground">
                Monitor de Marcas
              </strong>{" "}
              detecta por vos posibles conflictos en publicaciones del INPI, para
              que no pierdas tiempo ni oportunidades.
            </p>
            <ul className="mb-10 space-y-3">
              {[
                "Alertas automáticas sobre riesgos reales",
                "Todas tus marcas organizadas en un solo lugar",
                "Más control, menos trabajo manual",
              ].map((t) => (
                <li
                  key={t}
                  className="flex items-center gap-3 text-foreground/90"
                >
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent-cyan/15">
                    <Check className="h-3 w-3 text-accent-cyan" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-4">
              <BtnPrimary
                size="lg"
                href={FORMS_URL}
                className="group"
              >
                Solicitar demo
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </BtnPrimary>
              <BtnOutline size="lg" href={FORMS_URL}>
                Acceso anticipado
              </BtnOutline>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Sin compromiso · Cupos limitados de lanzamiento
            </p>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-gradient-accent opacity-20 blur-3xl" />
            <Image
              src="/dashboard-mockup.jpg"
              alt="Dashboard Monitor de Marcas"
              width={1280}
              height={960}
              className="relative rounded-2xl border border-border shadow-card"
              unoptimized
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Problem() {
  return (
    <Section id="problema" className="border-t border-border/50">
      <div className="reveal mb-14 max-w-2xl">
        <p className="mb-3 text-sm font-medium uppercase tracking-wider text-accent-cyan">
          El problema
        </p>
        <h2 className="text-4xl font-bold md:text-5xl">
          Si trabajás con marcas, <br />
          <span className="text-muted-foreground">esto ya te pasó</span>
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {problemItems.map(({ icon: Icon, text }, i) => (
          <div
            key={text}
            className="reveal group h-full rounded-xl border border-border bg-card p-6 transition-colors hover:border-accent-cyan/40"
            style={{ transitionDelay: `${i * 50}ms` }}
          >
            <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-accent-cyan/10 transition-colors group-hover:bg-accent-cyan/20">
              <Icon className="h-5 w-5 text-accent-cyan" />
            </div>
            <p className="leading-snug text-foreground/90">{text}</p>
          </div>
        ))}
      </div>
      <p className="reveal mt-14 text-center font-display text-2xl font-semibold md:text-3xl">
        Y hoy, <span className="text-gradient">eso ya no alcanza.</span>
      </p>
    </Section>
  );
}

function Solution() {
  return (
    <Section
      id="solucion"
      className="border-y border-border/50 bg-card/30"
    >
      <div className="reveal mx-auto mb-16 max-w-2xl text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-wider text-accent-cyan">
          La solución
        </p>
        <h2 className="mb-4 text-4xl font-bold md:text-5xl">
          Todo eso, en <span className="text-gradient">un solo sistema</span>
        </h2>
        <p className="text-lg text-muted-foreground">
          Monitor de Marcas centraliza, automatiza y mejora la forma en la que
          gestionás tus marcas.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {solutionItems.map(({ icon: Icon, title, text }, i) => (
          <div
            key={title}
            className="reveal h-full rounded-2xl border border-border bg-gradient-to-b from-card to-card/40 p-8 shadow-card transition-transform hover:-translate-y-1"
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <div className="mb-6 grid h-12 w-12 place-items-center rounded-xl bg-gradient-accent shadow-glow">
              <Icon className="h-6 w-6 text-background" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">{title}</h3>
            <p className="text-muted-foreground">{text}</p>
          </div>
        ))}
      </div>
      <p className="reveal mt-14 text-center text-xl text-muted-foreground">
        Menos carga operativa.{" "}
        <span className="font-semibold text-foreground">Más control.</span>
      </p>
    </Section>
  );
}

function Benefits() {
  return (
    <Section>
      <div className="grid items-center gap-16 lg:grid-cols-[1fr_1.2fr]">
        <div className="reveal">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-accent-cyan">
            Beneficios
          </p>
          <h2 className="mb-6 text-4xl font-bold md:text-5xl">
            Qué cambia
            <br />
            en tu trabajo
          </h2>
          <p className="mb-8 font-display text-xl font-semibold text-gradient">
            Pasás de reaccionar tarde a anticiparte.
          </p>
          <BtnPrimary size="lg" href={FORMS_URL}>
            Quiero verlo en acción
          </BtnPrimary>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {benefitItems.map(({ icon: Icon, text }, i) => (
            <div
              key={text}
              className="reveal rounded-xl border border-border bg-card p-6 transition-colors hover:border-accent-violet/40"
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              <Icon className="mb-4 h-6 w-6 text-accent-violet" />
              <p className="font-medium leading-snug">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

function HowItWorks() {
  return (
    <Section
      id="como-funciona"
      className="border-y border-border/50 bg-card/30"
    >
      <div className="reveal mx-auto mb-16 max-w-2xl text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-wider text-accent-cyan">
          Cómo funciona
        </p>
        <h2 className="text-4xl font-bold md:text-5xl">
          Tres pasos. <span className="text-gradient">Cero fricción.</span>
        </h2>
      </div>
      <div className="relative grid gap-6 md:grid-cols-3">
        {stepItems.map(({ n, title, text }, i) => (
          <div
            key={n}
            className="reveal relative h-full rounded-2xl border border-border bg-card p-8"
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <div className="font-display mb-6 text-5xl font-bold text-gradient">
              {n}
            </div>
            <h3 className="mb-2 text-xl font-semibold">{title}</h3>
            <p className="text-muted-foreground">{text}</p>
          </div>
        ))}
      </div>
      <p className="reveal mt-12 text-center text-muted-foreground">
        También podés hacer{" "}
        <span className="font-medium text-foreground">
          búsquedas de antecedentes
        </span>{" "}
        desde el mismo sistema.
      </p>
    </Section>
  );
}

function SmartAlerts() {
  return (
    <Section>
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-hero p-10 md:p-16">
        <div className="grid-pattern pointer-events-none absolute inset-0 opacity-30" />
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent-violet/20 blur-3xl" />
        <div className="relative grid items-center gap-12 lg:grid-cols-2">
          <div className="reveal">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-accent-violet" />
              Diferencial clave
            </div>
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              No es <span className="text-gradient">cualquier alerta</span>
            </h2>
            <p className="mb-2 text-lg text-muted-foreground">
              El sistema detecta coincidencias con riesgo real, utilizando
              criterios de{" "}
              <strong className="text-foreground">confundibilidad</strong>.
            </p>
            <p className="font-display mt-6 text-xl">
              Menos ruido.{" "}
              <span className="text-gradient font-semibold">Más precisión.</span>
            </p>
          </div>
          <div className="reveal space-y-3" style={{ transitionDelay: "150ms" }}>
            {alertChips.map(({ icon: Icon, title }) => (
              <div
                key={title}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-5"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-accent">
                  <Icon className="h-5 w-5 text-background" />
                </div>
                <p className="font-medium">{title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

function LegalContext() {
  return (
    <Section className="border-t border-border/50">
      <div className="reveal mx-auto max-w-3xl text-center">
        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
          <Gavel className="h-7 w-7 text-accent" />
        </div>
        <p className="mb-3 text-sm font-medium uppercase tracking-wider text-accent-cyan">
          Contexto legal
        </p>
        <h2 className="mb-6 text-4xl font-bold md:text-5xl">
          La custodia marcaria
          <br />
          <span className="text-gradient">ya no es opcional</span>
        </h2>
        <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
          A partir de la{" "}
          <strong className="text-foreground">Resolución INPI P-063/2026</strong>
          , la detección de conflictos depende cada vez más de quienes gestionan
          marcas.
        </p>
        <div className="font-display inline-block rounded-xl border border-red-500/45 bg-red-950/50 px-6 py-4 text-xl text-red-50 shadow-[0_0_28px_-10px_rgba(239,68,68,0.45)]">
          Si no lo detectás a tiempo, el riesgo es tuyo.
        </div>
      </div>
    </Section>
  );
}

function About() {
  return (
    <Section className="border-y border-border/50 bg-card/30">
      <div className="reveal mx-auto max-w-3xl text-center">
        <Sparkles className="mx-auto mb-6 h-8 w-8 text-accent-cyan" />
        <p className="mb-3 text-sm font-medium uppercase tracking-wider text-accent-cyan">
          Quiénes somos
        </p>
        <h2 className="mb-6 text-4xl font-bold md:text-5xl">
          Hecho por quienes trabajan
          <br />
          con marcas <span className="text-gradient">todos los días</span>
        </h2>
        <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
          Somos abogados especializados en{" "}
          <strong className="text-foreground">propiedad intelectual</strong>.
          Creamos esta herramienta para resolver un problema real que vivimos a
          diario.
        </p>
        <p className="font-display text-2xl">
          No es teoría.{" "}
          <span className="text-gradient font-semibold">Es práctica.</span>
        </p>
      </div>
    </Section>
  );
}

function Cta() {
  return (
    <Section id="cta">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-cta p-10 md:p-16">
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent-cyan/15 blur-3xl" />
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="reveal">
            <h2 className="mb-6 text-4xl font-bold md:text-6xl">
              Empezá a trabajar con
              <br />
              <span className="text-gradient">control real</span> sobre tus marcas
            </h2>
            <p className="mb-10 text-lg text-muted-foreground">
              Accedé antes que nadie y obtené{" "}
              <strong className="text-foreground">
                beneficios exclusivos por lanzamiento
              </strong>
              .
            </p>
          </div>
          <div
            className="reveal mx-auto flex w-full max-w-3xl flex-col justify-center gap-3 sm:flex-row"
            style={{ transitionDelay: "150ms" }}
          >
            <BtnPrimary
              size="lg"
              href={FORMS_URL}
              className="group min-w-0 flex-1 sm:flex-1"
            >
              Solicitar demo
              <ArrowRight className="ml-1 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
            </BtnPrimary>
            <BtnOutline
              size="lg"
              href={FORMS_URL}
              className="min-w-0 flex-1 sm:flex-1"
            >
              Sumarme a la lista de espera
            </BtnOutline>
          </div>
          <p className="reveal pt-4 text-xs text-muted-foreground">
            Cupos limitados para primeras implementaciones · Sin compromiso
          </p>
        </div>
      </div>
    </Section>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border/50 py-12">
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 text-sm text-muted-foreground md:flex-row">
        <div className="flex items-center gap-2 font-display font-semibold text-foreground">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-gradient-accent">
            <ShieldCheck className="h-4 w-4 text-background" />
          </div>
          Monitor de Marcas
        </div>
        <div className="flex gap-6">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="transition-colors hover:text-foreground"
          >
            Contacto
          </a>
        </div>
        <p>© {year} Monitor de Marcas</p>
      </div>
    </footer>
  );
}

export function LandingPage() {
  useScrollReveal();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <Benefits />
        <HowItWorks />
        <SmartAlerts />
        <LegalContext />
        <About />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
