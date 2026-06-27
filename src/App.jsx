import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, ClipboardCheck, Gauge, Hammer, Heater, MapPin, Medal, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import AdminDashboard from "./components/AdminDashboard";
import AuthModal from "./components/AuthModal";
import CookieBanner from "./components/CookieBanner";
import CustomerDashboard from "./components/CustomerDashboard";
import Layout from "./components/Layout";
import QuizFunnel from "./components/QuizFunnel";
import ScrollStory from "./components/ScrollStory";
import { assets, cityPages, translations } from "./data/content";
import { getCurrentUser } from "./lib/api";
import CityLandingPage from "./pages/CityLandingPage";
import LegalPage from "./pages/LegalPage";

export default function App() {
  const [lang, setLang] = useState("de");
  const [path, setPath] = useState(window.location.pathname);
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const t = translations[lang];

  useEffect(() => {
    const token = localStorage.getItem("flowarm-auth-token");
    if (!token) return;
    getCurrentUser(token)
      .then((result) => {
        setUser(result.user);
        if (window.location.pathname !== "/") {
          window.history.replaceState({}, "", "/");
          setPath("/");
        }
      })
      .catch(() => localStorage.removeItem("flowarm-auth-token"));
  }, []);
  const go = (target) => {
    if (target === "/") {
      window.history.pushState({}, "", "/");
      setPath("/");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (target.startsWith("#")) {
      if (path !== "/") {
        window.history.pushState({}, "", "/");
        setPath("/");
        setTimeout(() => document.querySelector(target)?.scrollIntoView({ behavior: "smooth" }), 40);
        return;
      }
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
    if (["/impressum", "/datenschutz", "/agb", "/widerruf"].includes(path)) return <LegalPage path={path} />;
    return null;
  }, [path]);

  const handleAuthenticated = (authenticatedUser) => {
    setUser(authenticatedUser);
    window.history.pushState({}, "", "/");
    setPath("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Layout
      t={t}
      lang={lang}
      setLang={setLang}
      go={go}
      user={user}
      onLogin={() => setAuthOpen(true)}
      onLogout={() => {
        localStorage.removeItem("flowarm-auth-token");
        setUser(null);
      }}
    >
      {user ? (
        <main>
          <section id="dashboard" className="pt-20">
            {user.role === "admin" ? <AdminDashboard authenticated /> : <CustomerDashboard authenticated user={user} />}
          </section>
        </main>
      ) : routed || (
        <main>
          <ScrollStory t={t} go={go} />
          <StickyCta go={go} />
          <MarketLeaderSection go={go} />
          <TrustSection go={go} />
          <ServiceDetailsSection />
          <QuizFunnel t={t} />
          <ProcessSection />
          <FaqSection go={go} />
          <RegionSection go={go} />
        </main>
      )}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onAuthenticated={handleAuthenticated} />
      <CookieBanner go={go} />
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

function MarketLeaderSection({ go }) {
  const stats = [
    ["7.256+", "umgesetzte Projekte", "Sanierung, Neubau und Gewerbeflächen"],
    ["4", "Projekte werden heute fertig", "laufende Teams im 3-Tage-Ablauf"],
    ["3 Tage", "typische Umsetzung", "Fräsen, Rohrverlegung, Anschlussvorbereitung"],
    ["98 %", "Angebote mit Sofortpreis", "klare Kalkulation vor dem ersten Termin"]
  ];

  return (
    <section className="bg-black px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-warm/25 bg-warm/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-warm">
              <Medal size={16} /> Marktführer-Anspruch
            </p>
            <h2 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Einer der führenden Spezialisten für Fußbodenheizung-Fräsen in Deutschland.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/62">
              FloWarm verbindet eingespielte Montageteams, transparente Sofortpreise und einen klaren 3-Tage-Prozess. Genau deshalb entscheiden sich Eigentümer und Sanierer für eine schnelle, saubere Umsetzung.
            </p>
          </div>
          <div className="rounded-lg border border-warm/20 bg-gradient-to-br from-white/[.08] to-white/[.03] p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-white/45">Live-Projektstatus</p>
                <p className="mt-1 font-semibold text-white">Heute in Umsetzung</p>
              </div>
              <TrendingUp className="text-warm" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {stats.map(([value, label, note]) => (
                <div key={label} className="rounded-md border border-white/10 bg-black/35 p-4">
                  <p className="text-3xl font-semibold text-white">{value}</p>
                  <p className="mt-2 font-semibold text-warm">{label}</p>
                  <p className="mt-1 text-sm leading-5 text-white/50">{note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button onClick={() => go("#angebot")} className="rounded-full bg-warm px-6 py-4 font-bold text-ink shadow-glow">
            Sofortangebot berechnen
          </button>
          <span className="text-sm text-white/45">Vorläufiger Festpreis in ca. 2 Minuten.</span>
        </div>
      </div>
    </section>
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
              Wenige Entscheidungen, transparente Positionen, sofort sichtbare Kosten und danach Termin oder Rückruf.
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

function ServiceDetailsSection() {
  const services = [
    ["Bestandsboden prüfen", "Wir planen auf Basis Ihrer Fläche, Etagen und vorhandenen Unterlagen. So entsteht ein realistischer erster Preisrahmen.", ClipboardCheck],
    ["Estrich präzise fräsen", "Die Heizkanäle werden direkt in den vorhandenen Estrich eingebracht. Das spart Aufbauhöhe und passt gut zur Sanierung.", Hammer],
    ["Rohre sauber verlegen", "Nach dem Fräsen werden die Heizrohre bündig eingelegt, Heizkreise vorbereitet und die Verteilung je Ebene strukturiert.", Heater],
    ["Anschluss vorbereiten", "Der Heizkreisverteiler wird passend zur Anzahl der Ebenen kalkuliert: eine Ebene, ein Verteiler; zwei Ebenen, zwei Verteiler.", ShieldCheck]
  ];
  const priceItems = [
    ["Anfahrt & Rüstzeug", "Pauschale für Vorbereitung, Baustelleneinrichtung und Anfahrt."],
    ["Fräsen & Rohrlegung", "Preis je Quadratmeter beheizter Fläche inklusive sauberer Rohrverlegung."],
    ["Heizkreisverteiler", "Ein Verteiler pro Ebene, damit jede Etage getrennt geplant werden kann."],
    ["Verschließen & Ausgleich", "Rohrkanäle schließen und Fläche für den weiteren Bodenaufbau vorbereiten."]
  ];

  return (
    <section className="bg-graphite px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-warm">Leistung im Detail</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Nachrüsten ohne kompletten Bodenaufbau.</h2>
            <p className="mt-5 text-lg leading-8 text-white/62">
              FloWarm richtet sich an Eigentümer, Sanierer und Gewerbeflächen, die eine Fußbodenheizung im Bestand nachrüsten möchten. Im Mittelpunkt stehen kurze Bauzeit, präzises Fräsen und eine transparente Kalkulation.
            </p>
            <div className="mt-8 overflow-hidden rounded-lg border border-white/10">
              <img src={assets.scenes[2]} alt="Gefräste Heizkanäle im Estrich" className="h-72 w-full object-cover" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {services.map(([title, text, Icon]) => (
              <div key={title} className="rounded-lg border border-white/10 bg-white/[.04] p-5">
                <div className="mb-5 grid h-11 w-11 place-items-center rounded-full bg-warm/12 text-warm">
                  <Icon size={21} />
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/58">{text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-14 rounded-lg border border-warm/20 bg-black/22 p-5 sm:p-7">
          <div className="grid gap-5 lg:grid-cols-[.75fr_1.25fr] lg:items-start">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-warm">Preislogik</p>
              <h3 className="mt-3 text-3xl font-semibold">Was im Sofortangebot steckt.</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {priceItems.map(([title, text]) => (
                <div key={title} className="rounded-md bg-white/[.06] p-4">
                  <h4 className="font-semibold">{title}</h4>
                  <p className="mt-2 text-sm leading-6 text-white/58">{text}</p>
                </div>
              ))}
            </div>
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

function FaqSection({ go }) {
  const questions = [
    ["Wie schnell ist die Umsetzung?", "Der typische Ablauf ist auf drei klare Tage ausgelegt: Vorbereitung und Fräsen, Rohrverlegung, anschließend Verteiler und Anschlussvorbereitung."],
    ["Muss der komplette Estrich raus?", "Nein. Bei der Sanierung wird in den vorhandenen Estrich gefräst. Dadurch bleibt der Aufbau niedrig und der Eingriff kleiner als bei einem kompletten Neuaufbau."],
    ["Warum zählt der Heizkreisverteiler pro Ebene?", "Für die Kalkulation wird je Ebene ein Heizkreisverteiler angesetzt. Das ist für Kunden verständlich und passt besser zur späteren Planung vor Ort."],
    ["Ist der Preis schon verbindlich?", "Der Konfigurator erstellt einen vorläufigen Festpreis. Die technische Prüfung vor Ort entscheidet final über Machbarkeit, Details und verbindliches Angebot."]
  ];

  return (
    <section className="bg-ink px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-warm">Häufige Fragen</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Mehr Klarheit vor dem ersten Gespräch.</h2>
            <p className="mt-5 text-lg leading-8 text-white/62">
              Die wichtigsten Punkte sind direkt auf der Seite beantwortet, damit Besucher Ablauf und Kalkulation schneller verstehen.
            </p>
            <button onClick={() => go("#angebot")} className="mt-8 inline-flex items-center gap-2 rounded-full bg-warm px-6 py-4 font-bold text-ink shadow-glow">
              Angebot berechnen <ArrowRight size={18} />
            </button>
          </div>
          <div className="grid gap-4">
            {questions.map(([title, text]) => (
              <div key={title} className="rounded-lg border border-white/10 bg-white/[.04] p-5">
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-3 leading-7 text-white/58">{text}</p>
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
        <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-warm">Regionale Umsetzung</p>
            <h2 className="mt-3 text-4xl font-semibold">Fußbodenheizung fräsen in Frankfurt, Wetterau und Umgebung.</h2>
          </div>
          <p className="text-lg leading-8 text-ink/62">
            FloWarm plant Projekte für Wohnungen, Häuser und Gewerbeflächen mit regionaler Nähe, sauberer Baustellenführung und schneller Angebotserstellung.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {Object.entries(cityPages).map(([url, page]) => (
            <button key={url} onClick={() => go(url)} className="rounded-lg bg-white p-5 text-left shadow-xl shadow-black/5 transition hover:-translate-y-1">
              <MapPin className="mb-4 text-warm" size={22} />
              <h3 className="font-semibold">{page.city}</h3>
              <p className="mt-3 text-sm leading-6 text-ink/58">{page.title}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
