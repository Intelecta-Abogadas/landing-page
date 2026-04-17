"use client";

import {
  Activity,
  AlertCircle,
  Award,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle,
  ChevronRight,
  Globe,
  LayoutGrid,
  Scale,
  Search,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { useEffect } from "react";

function useRevealOnScroll() {
  useEffect(() => {
    const els = document.querySelectorAll(".fade-up, .fade-left, .fade-right");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

function CtaButton({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-verde px-12 py-7 text-base font-bold uppercase tracking-wider text-texto shadow-lg shadow-verde/20 transition-all duration-300 hover:bg-verde-dark hover:shadow-xl hover:shadow-verde/40 ${className}`}
    >
      {children}
    </button>
  );
}

const audienceItems = [
  { icon: BookOpen, label: "Estudios." },
  { icon: Users, label: "Agentes." },
  { icon: Briefcase, label: "Equipos legales." },
  { icon: Building2, label: "Empresas que gestionan sus propios registros." },
] as const;

const howItWorksItems = [
  {
    icon: LayoutGrid,
    text: "Cargás tus marcas y pasás a tenerlas ordenadas en un solo lugar.",
    highlight: "Tu base de datos.",
    iconAnim: "float",
  },
  {
    icon: Activity,
    text: "El sistema monitorea lo que se publica y cruza esa información con tus marcas.",
    highlight: "Tu Monitor.",
    iconAnim: "scale-pulse",
  },
  {
    icon: Search,
    text: "Podés hacer búsquedas de antecedentes para analizar nuevas marcas desde el mismo lugar.",
    highlight: "Tu buscador.",
    iconAnim: "float-reverse",
  },
] as const;

const whatChangesItems = [
  "Organización en un solo lugar.",
  "La tranquilidad de que el Monitor está funcionando.",
  "Tus estudios de factibilidad, en el mismo sistema.",
] as const;

export function LandingPage() {
  useRevealOnScroll();

  return (
    <main>
      {/* Hero — _S */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-blanco section-padding">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <Search
            className="absolute left-[8%] top-[15%] h-8 w-8 float text-verde/20"
            style={{ animationDelay: "0s" }}
          />
          <Scale
            className="absolute right-[10%] top-[25%] h-10 w-10 float-slow text-verde/15"
            style={{ animationDelay: "1s" }}
          />
          <Sparkles
            className="absolute bottom-[30%] left-[12%] h-7 w-7 float-reverse text-verde/20"
            style={{ animationDelay: "0.5s" }}
          />
          <Activity
            className="absolute right-[8%] top-[60%] h-9 w-9 float text-verde/15"
            style={{ animationDelay: "2s" }}
          />
          <Globe
            className="absolute right-[30%] top-[10%] h-6 w-6 float-slow text-verde/15"
            style={{ animationDelay: "1.5s" }}
          />
          <Award
            className="absolute bottom-[20%] right-[25%] h-8 w-8 float-reverse text-verde/10"
            style={{ animationDelay: "0.8s" }}
          />
          <Search
            className="absolute bottom-[15%] left-[30%] h-5 w-5 float text-verde/15"
            style={{ animationDelay: "3s" }}
          />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="h-3 w-3 rounded-full bg-verde/20 orbit" />
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="h-2 w-2 rounded-full bg-verde/15 orbit-reverse" />
          </div>
          <div className="absolute left-[5%] top-[20%] h-32 w-32 rounded-full border border-verde/10 ring-expand" />
          <div
            className="absolute bottom-[10%] right-[5%] h-48 w-48 rounded-full border border-verde/5 ring-expand"
            style={{ animationDelay: "2s" }}
          />
          <div className="absolute left-[20%] top-[40%] h-2 w-2 rounded-full bg-verde/40 blink-dot" />
          <div
            className="absolute right-[15%] top-[70%] h-1.5 w-1.5 rounded-full bg-verde/30 blink-dot"
            style={{ animationDelay: "0.7s" }}
          />
          <div
            className="absolute left-[50%] top-[15%] h-1 w-1 rounded-full bg-verde/50 blink-dot"
            style={{ animationDelay: "1.2s" }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="fade-up mb-10 flex items-center justify-center gap-8">
            <div
              className="float flex h-12 w-12 items-center justify-center rounded-2xl bg-verde-soft"
              style={{ animationDelay: "0s" }}
            >
              <Search className="h-6 w-6 text-verde-dark" />
            </div>
            <div className="scale-pulse flex h-14 w-14 items-center justify-center rounded-2xl bg-verde/10">
              <Scale className="h-7 w-7 text-verde-dark" />
            </div>
            <div
              className="float flex h-12 w-12 items-center justify-center rounded-2xl bg-verde-soft"
              style={{ animationDelay: "1s" }}
            >
              <Sparkles className="h-6 w-6 text-verde-dark" />
            </div>
          </div>
          <h1 className="fade-up mb-4 text-5xl font-extrabold tracking-tighter text-gradient md:text-6xl lg:text-8xl">
            MONITOR DE MARCAS
          </h1>
          <div className="fade-up mx-auto mb-12 h-1 w-24 rounded-full bg-verde/40" />
          <div className="fade-up mx-auto max-w-3xl space-y-5 text-lg leading-relaxed text-texto-light md:text-xl">
            <p className="font-light">
              Trabajar con marcas exige una custodia activa y constante.
            </p>
            <p className="font-light">
              Revisar. Buscar. Volver a revisar.
              <br />
              Estar atento a que no se pase nada.
            </p>
            <p className="font-light">Y eso, en el día a día, lleva tiempo.</p>
            <p className="font-light">
              Monitor de Marcas está pensado para ayudarte con todo ese trabajo
              que hasta hoy venís haciendo de forma manual.
            </p>
            <p className="font-light">
              Para sacarte carga.
              <br />
              Para ordenar tus tiempos.
              <br />
              Para acompañarte.
            </p>
            <p className="font-semibold text-texto">
              Un aliado en tu trabajo diario y en tus tiempos.
            </p>
          </div>
          <div className="fade-up mt-14">
            <CtaButton className="pulse-glow px-12 py-7 text-lg">
              Solicitar demo
            </CtaButton>
          </div>
        </div>
      </section>

      {/* Qué es — LS */}
      <section className="relative overflow-hidden bg-verde-mist section-padding">
        <div className="pointer-events-none absolute inset-0">
          <Globe className="absolute right-[5%] top-[10%] h-16 w-16 float-slow text-verde/8" />
          <Sparkles
            className="absolute bottom-[15%] left-[5%] h-12 w-12 float-reverse text-verde/8"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute right-[10%] top-[50%] h-24 w-24 rounded-full border border-verde/10 ring-expand"
            style={{ animationDelay: "1s" }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl">
          <div className="fade-up mb-10 flex items-center gap-4">
            <div className="scale-pulse flex h-12 w-12 items-center justify-center rounded-2xl bg-verde/15">
              <Globe className="h-6 w-6 text-verde-dark" />
            </div>
            <h2 className="text-3xl font-bold text-texto md:text-4xl lg:text-5xl">
              Qué es Monitor de Marcas
            </h2>
          </div>
          <div className="grid gap-10 md:grid-cols-2">
            <div className="fade-left space-y-6 text-lg leading-relaxed text-texto-light">
              <p>Es una herramienta para ordenar algo que hoy se hace manualmente.</p>
              <p>
                Cargás tus marcas y las tenés todas en un solo lugar, con su
                información organizada y siempre accesible. Tu propia base de
                datos, pensada para trabajar mejor.
              </p>
            </div>
            <div className="fade-right space-y-6 text-lg leading-relaxed text-texto-light">
              <p>
                Al mismo tiempo, el sistema revisa los boletines publicados por
                INPI y te avisa cuando aparece algo que puede impactar en tus
                marcas.
              </p>
              <p className="font-semibold text-texto">
                Monitor de Marcas te da control.
              </p>
              <p className="text-gradient text-xl font-bold">
                Y, sobre todo, tiempo para actuar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* A quién — zS */}
      <section className="relative overflow-hidden bg-blanco section-padding">
        <div className="pointer-events-none absolute inset-0">
          <Activity className="absolute right-[8%] top-[10%] h-20 w-20 spin-slow text-verde/6" />
          <Briefcase
            className="absolute bottom-[20%] left-[3%] h-14 w-14 float text-verde/8"
            style={{ animationDelay: "2s" }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl">
          <h2 className="fade-up mb-4 text-3xl font-bold text-texto md:text-4xl lg:text-5xl">
            A quién está dirigido
          </h2>
          <div className="fade-up mb-10 h-1 w-16 rounded-full bg-verde/40" />
          <p className="fade-up mb-8 text-lg text-texto-light">
            A todos los que trabajan con marcas.
          </p>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {audienceItems.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="fade-up group flex cursor-default items-center gap-4 rounded-2xl border border-verde/15 bg-verde-mist p-5 transition-all duration-500 hover:border-verde/50 hover:shadow-lg hover:shadow-verde/10"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-verde/10 transition-colors duration-300 group-hover:bg-verde/20">
                  <Icon className="h-5 w-5 text-verde-dark" />
                </div>
                <span className="text-lg text-texto">{label}</span>
              </div>
            ))}
          </div>
          <p className="fade-up text-lg text-texto-light">
            A todos los que necesitan trabajar con sus marcas de forma organizada.
          </p>
        </div>
      </section>

      {/* Cómo se usa — FS */}
      <section className="relative overflow-hidden bg-verde-soft section-padding">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[5%] top-[20%] h-40 w-40 rounded-full border border-verde/8 ring-expand" />
          <div
            className="absolute bottom-[10%] left-[5%] h-28 w-28 rounded-full border border-verde/6 ring-expand"
            style={{ animationDelay: "2s" }}
          />
          <Activity className="absolute left-[8%] top-[8%] h-16 w-16 spin-slow text-verde/8" />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl">
          <h2 className="fade-up mb-4 text-3xl font-bold text-texto md:text-4xl lg:text-5xl">
            Cómo se usa
          </h2>
          <div className="fade-up mb-14 h-1 w-16 rounded-full bg-verde/40" />
          <div className="space-y-6">
            {howItWorksItems.map(({ icon: Icon, text, highlight, iconAnim }) => (
              <div key={highlight} className="fade-up">
                <div className="group flex items-start gap-6 rounded-2xl border border-verde/10 bg-blanco/80 p-6 backdrop-blur-sm transition-all duration-500 hover:border-verde/40 hover:shadow-xl hover:shadow-verde/10 md:p-8">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-verde/10 transition-colors duration-300 group-hover:bg-verde/20 ${iconAnim}`}
                  >
                    <Icon className="h-7 w-7 text-verde-dark" />
                  </div>
                  <div className="flex-1">
                    <p className="mb-2 text-lg leading-relaxed text-texto-light">
                      {text}
                    </p>
                    <div className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-verde-dark" />
                      <p className="text-gradient text-xl font-bold">{highlight}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Qué cambia — US */}
      <section className="relative overflow-hidden bg-blanco section-padding">
        <div className="pointer-events-none absolute inset-0">
          <Zap
            className="absolute right-[8%] top-[15%] h-12 w-12 float-slow text-verde/10"
            style={{ animationDelay: "1.5s" }}
          />
          <Search
            className="absolute bottom-[20%] left-[5%] h-10 w-10 float text-verde/8"
            style={{ animationDelay: "1s" }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl">
          <h2 className="fade-up mb-4 text-3xl font-bold text-texto md:text-4xl lg:text-5xl">
            Qué cambia
          </h2>
          <div className="fade-up mb-10 h-1 w-16 rounded-full bg-verde/40" />
          <div className="grid gap-5 md:grid-cols-2">
            {whatChangesItems.map((line) => (
              <div
                key={line}
                className="fade-up flex items-start gap-4 rounded-2xl border border-verde/10 bg-verde-mist p-5 text-lg text-texto-light transition-all duration-300 hover:border-verde/30"
              >
                <CheckCircle className="mt-0.5 h-6 w-6 shrink-0 text-verde" />
                <span>{line}</span>
              </div>
            ))}
            <div className="fade-up flex items-start gap-4 rounded-2xl border border-verde/20 bg-verde/10 p-5">
              <CheckCircle className="mt-0.5 h-6 w-6 shrink-0 text-verde-dark" />
              <span className="text-gradient text-xl font-bold">Tu trabajo, ordenado.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sobre las alertas — BS */}
      <section className="relative overflow-hidden bg-verde-mist section-padding">
        <div className="pointer-events-none absolute inset-0">
          <Bell className="absolute right-[5%] top-[10%] h-20 w-20 float-slow text-verde/6" />
          <AlertCircle
            className="absolute bottom-[15%] left-[3%] h-16 w-16 float-reverse text-verde/8"
            style={{ animationDelay: "1s" }}
          />
          <div className="absolute left-[10%] top-[40%] h-2 w-2 rounded-full bg-verde/30 blink-dot" />
          <div
            className="absolute right-[15%] top-[60%] h-1.5 w-1.5 rounded-full bg-verde/25 blink-dot"
            style={{ animationDelay: "1s" }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl">
          <div className="fade-up mb-10 flex items-center gap-4">
            <div className="scale-pulse flex h-12 w-12 items-center justify-center rounded-2xl bg-verde/15">
              <Bell className="h-6 w-6 text-verde-dark" />
            </div>
            <h2 className="text-3xl font-bold text-texto md:text-4xl lg:text-5xl">
              Sobre las alertas
            </h2>
          </div>
          <div className="fade-up space-y-6">
            <p className="text-xl font-semibold text-texto">
              No es cualquier coincidencia.
            </p>
            <p className="text-lg leading-relaxed text-texto-light">
              Son aquellas que pueden generar riesgo, con un porcentaje de
              confundibilidad cuantificado.
            </p>
            <div className="my-8 grid gap-4 sm:grid-cols-2">
              <div className="group flex items-center gap-4 rounded-2xl border border-verde/15 bg-blanco p-5 transition-all duration-500 hover:border-verde/40 hover:shadow-lg hover:shadow-verde/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-verde/10 transition-colors group-hover:bg-verde/20">
                  <Sparkles className="h-5 w-5 text-verde-dark" />
                </div>
                <span className="text-lg font-medium text-texto">
                  Similitudes fonéticas
                </span>
              </div>
              <div className="group flex items-center gap-4 rounded-2xl border border-verde/15 bg-blanco p-5 transition-all duration-500 hover:border-verde/40 hover:shadow-lg hover:shadow-verde/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-verde/10 transition-colors group-hover:bg-verde/20">
                  <Scale className="h-5 w-5 text-verde-dark" />
                </div>
                <span className="text-lg font-medium text-texto">
                  Similitudes gráficas
                </span>
              </div>
            </div>
            <p className="text-lg text-texto-light">
              No se limita a coincidencias literales.
            </p>
            <p className="text-lg text-texto-light">
              También detecta similitudes fonéticas y gráficas.
            </p>
            <p className="text-gradient text-xl font-bold">
              La tranquilidad de saber que hay un control constante.
            </p>
          </div>
        </div>
      </section>

      {/* Quiénes somos — VS */}
      <section className="relative overflow-hidden bg-blanco section-padding">
        <div className="pointer-events-none absolute inset-0">
          <Award
            className="absolute right-[8%] top-[12%] h-10 w-10 float text-verde/8"
            style={{ animationDelay: "0.5s" }}
          />
          <Users className="absolute bottom-[18%] left-[5%] h-12 w-12 float-slow text-verde/6" />
          <div
            className="absolute bottom-[30%] right-[10%] h-32 w-32 rounded-full border border-verde/8 ring-expand"
            style={{ animationDelay: "1.5s" }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl">
          <div className="fade-up mb-10 flex items-center gap-4">
            <div className="float flex h-12 w-12 items-center justify-center rounded-2xl bg-verde/15">
              <Briefcase className="h-6 w-6 text-verde-dark" />
            </div>
            <h2 className="text-3xl font-bold text-texto md:text-4xl lg:text-5xl">
              Quiénes somos
            </h2>
          </div>
          <div className="grid gap-10 md:grid-cols-2">
            <div className="fade-left space-y-6 text-lg leading-relaxed text-texto-light">
              <p>
                Somos abogados especializados en propiedad intelectual que
                trabajamos a diario con marcas.
              </p>
              <p>Revisar publicaciones, hacer búsquedas, estar atentos…</p>
              <p className="text-gradient text-xl font-bold">todo eso ya lo hacíamos.</p>
              <p>
                Pero dependía de estar encima.
                <br />
                Y aun así, a veces algo aparecía tarde.
              </p>
            </div>
            <div className="fade-right space-y-6 text-lg leading-relaxed text-texto-light">
              <p>Por eso armamos Monitor de Marcas.</p>
              <p>
                Para tener ese seguimiento ordenado, en un solo lugar, y sin
                depender de procesos manuales.
              </p>
              <p>
                Es la herramienta que usamos todos los días para gestionar
                nuestras marcas. Es una solución que mejoró nuestra forma de
                trabajar, y queremos que también mejore la tuya.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ¿Por qué es importante? — HS */}
      <section className="relative overflow-hidden bg-verde-mist section-padding">
        <div className="pointer-events-none absolute inset-0">
          <Scale className="absolute right-[5%] top-[8%] h-20 w-20 float-reverse text-verde/6" />
          <AlertCircle
            className="absolute bottom-[12%] left-[3%] h-14 w-14 float text-verde/8"
            style={{ animationDelay: "2s" }}
          />
          <div
            className="absolute left-[8%] top-[30%] h-2 w-2 rounded-full bg-verde/25 blink-dot"
            style={{ animationDelay: "0.5s" }}
          />
          <div
            className="absolute bottom-[40%] right-[12%] h-1.5 w-1.5 rounded-full bg-verde/30 blink-dot"
            style={{ animationDelay: "1.5s" }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl">
          <div className="fade-up mb-10 flex items-center gap-4">
            <div className="scale-pulse flex h-12 w-12 items-center justify-center rounded-2xl bg-verde/15">
              <Scale className="h-6 w-6 text-verde-dark" />
            </div>
            <h2 className="text-3xl font-bold text-texto md:text-4xl lg:text-5xl">
              ¿Por qué es importante?
            </h2>
          </div>
          <div className="fade-up space-y-6 text-lg leading-relaxed text-texto-light">
            <p>
              Hoy, la custodia de marcas adquiere un rol central dentro del
              sistema marcario argentino.
            </p>
            <div className="rounded-2xl border-l-4 border-verde/40 bg-blanco/80 p-6">
              <p>
                A partir de lo dispuesto por la{" "}
                <span className="font-semibold text-texto">
                  Resolución INPI P-063/2026
                </span>
                , se redefine el alcance de las observaciones de oficio,
                trasladando en mayor medida al titular y a quienes gestionan
                marcas la responsabilidad de detectar posibles conflictos.
              </p>
            </div>
            <p>
              En ese esquema, la custodia funciona como el principal filtro
              frente a lo que el propio sistema deja de revisar.
            </p>
            <p>
              Lo que antes podía ser advertido por el INPI, hoy depende de un
              control activo por parte de los interesados. Por eso, la
              detección temprana deja de ser una buena práctica para convertirse
              en una condición necesaria.
            </p>
            <p>
              Contar con una base de datos ordenada, herramientas de búsqueda de
              antecedentes y un seguimiento constante de las publicaciones te
              permite trabajar con criterio, tener información disponible, actuar
              a tiempo y tener capacidad real de respuesta.
            </p>
          </div>
        </div>
      </section>

      {/* Lista de espera — WS */}
      <section className="relative overflow-hidden bg-blanco section-padding">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-verde/8 blur-3xl" />
          <Zap className="absolute left-[10%] top-[15%] h-8 w-8 float text-verde/15" />
          <Scale
            className="absolute bottom-[20%] right-[10%] h-10 w-10 float-reverse text-verde/10"
            style={{ animationDelay: "1s" }}
          />
          <Sparkles
            className="absolute right-[15%] top-[25%] h-6 w-6 float-slow text-verde/12"
            style={{ animationDelay: "0.5s" }}
          />
          <div className="absolute left-[30%] top-[10%] h-24 w-24 rounded-full border border-verde/8 ring-expand" />
          <div
            className="absolute bottom-[15%] right-[25%] h-36 w-36 rounded-full border border-verde/6 ring-expand"
            style={{ animationDelay: "2s" }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <h2 className="fade-up mb-6 text-3xl font-bold text-texto md:text-4xl lg:text-5xl">
            Anotate en la lista de espera
          </h2>
          <div className="fade-up mx-auto mb-8 h-1 w-16 rounded-full bg-verde/40" />
          <p className="fade-up mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-texto-light md:text-xl">
            Acceso anticipado, prioridad en la atención y beneficios para los
            primeros usuarios.
          </p>
          <div className="fade-up">
            <CtaButton className="pulse-glow group px-12 py-7 text-lg">
              Anotarme
              <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </CtaButton>
          </div>
        </div>
      </section>
    </main>
  );
}
