import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Gauge, Heater, Sparkles } from "lucide-react";
import AdminDashboard from "./components/AdminDashboard";
import AuthModal from "./components/AuthModal";
import CookieBanner from "./components/CookieBanner";
import CustomerDashboard from "./components/CustomerDashboard";
import Layout from "./components/Layout";
import QuizFunnel from "./components/QuizFunnel";
import ScrollStory from "./components/ScrollStory";
import { assets, cityPages, translations } from "./data/content";
import CityLandingPage from "./pages/CityLandingPage";
import LegalPage from "./pages/LegalPage";

export default function App() {
  const [lang, setLang] = useState("de");
  const [path, setPath] = useState(window.location.pathname);
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const t = translations[lang];
  const go = (target) => {
    if (target.startsWith("#")) {
      document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (target.includes("#")) {
      window.history.pushState({}, "", "/");
      setPath("/");
      setTimeout(() => document.querySelector(target.split("#")[1] ? `#${target.split("#")[1]}` : "#top")?.scrollIntoView({ behavior: "smooth" }), 40);
      return;
    }
    window.history.pushState({}, "", target);
    setPath(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const routed = useMemo(() => {
    if (cityPages[path]) return <CityLandingPage path={path} go={go} />;
    if (["/impressum", "/datenschutz", "/agb"].includes(path)) return <LegalPage path={path} />;
    return null;
  }, [path]);

  return (
    <Layout
      t={t}
      lang={lang}
      setLang={setLang}
      go={go}
      user={user}
      onLogin={() => setAuthOpen(true)}
      onLogout={() => setUser(null)}
    >
      {routed || (
        <main>
          {user ? (
            <section id="dashboard" className="pt-20">
              {user.role === "admin" ? <AdminDashboard authenticated /> : <CustomerDashboard authenticated />}
            </section>
          ) : (
            <>
              <ScrollStory t={t} go={go} />
              <StickyCta go={go} />
              <TrustSection go={go} />
              <QuizFunnel t={t} />
              <ProcessSection />
              <RegionSection go={go} />
            </>
          )}
        </main>
      )}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onAuthenticated={setUser} />
      <CookieBanner />
    </Layout>
  );
}

function StickyCta({ go }) {
  return (
    <button onClick={() => go("#angebot")} className="fixed bottom-5 right-5 z-40 hidden rounded-full bg-warm px-5 py-3 text-sm font-bold text-ink shadow-glow md:block">
      Angebot berechnen
    </button>
  );
}

function TrustSection({ go }) {
  const items = [
    ["Sofortangebot", "Preisübersicht direkt nach dem Funnel."],
    ["3 Tage Ablauf", "Fräsen, Rohrverlegung, Verteilerinstallation."],
    ["Premium sauber", "Frästechnik direkt im vorhandenen Estrich."]
  ];
  return (
    <section className="bg-ink px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-warm">FloWarm Stärke</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Der schnellste Weg vom Altboden zur effizienten Wärme.</h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/62">
              Inspiriert von klaren Premium-Systemen: wenige Entscheidungen, transparente Positionen, sofort sichtbare Kosten und danach Termin oder Rückruf.
            </p>
            <button onClick={() => go("#angebot")} className="mt-8 inline-flex items-center gap-2 rounded-full border border-warm/45 px-6 py-4 font-semibold text-warm">
              Sofortangebot starten <ArrowRight size={18} />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {items.map(([title, text], index) => (
              <div key={title} className="rounded-lg border border-white/10 bg-white/[.04] p-5">
                <div className="mb-5 text-warm">{index === 0 ? <Gauge /> : index === 1 ? <Heater /> : <Sparkles />}</div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/55">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  return (
    <section id="prozess" className="bg-pearl px-4 py-20 text-ink sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <img src={assets.scenes[5]} alt="Wärmevisualisierung Fußbodenheizung" className="h-full min-h-[360px] rounded-lg object-cover shadow-2xl shadow-black/15" />
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-warm">Umsetzung</p>
            <h2 className="mt-3 text-4xl font-semibold sm:text-5xl">Schlüsselfertig in drei klaren Tagen.</h2>
            {["Tag 1: Vorbereitung und Fräsen", "Tag 2: Rohrverlegung", "Tag 3: Verteilerkasten installieren und Anschluss"].map((phase) => (
              <div key={phase} className="mt-5 flex gap-4 rounded-lg bg-white p-5 shadow-xl shadow-black/5">
                <CheckCircle2 className="mt-1 shrink-0 text-warm" />
                <div>
                  <h3 className="font-semibold">{phase}</h3>
                  <p className="mt-2 text-ink/58">Koordiniert, dokumentiert und später in der Projektübersicht nachvollziehbar.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RegionSection({ go }) {
  return (
    <section id="regionen" className="bg-pearl px-4 py-20 text-ink sm:px-6">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-warm">SEO-Regionen</p>
        <h2 className="mt-3 text-4xl font-semibold">Lokale Seiten für Ihre Kerngebiete</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {Object.entries(cityPages).map(([url, page]) => (
            <button key={url} onClick={() => go(url)} className="rounded-lg bg-white p-5 text-left shadow-xl shadow-black/5 transition hover:-translate-y-1">
              <h3 className="font-semibold">{page.city}</h3>
              <p className="mt-3 text-sm leading-6 text-ink/58">{page.title}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
