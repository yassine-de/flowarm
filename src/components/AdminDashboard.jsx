import { BarChart3, Calendar, Download, Mail, Settings, ShieldCheck, SlidersHorizontal, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { defaultPrices } from "../data/content";
import { getAdminAnalytics, getPriceSettings, listAdminOffers, updateAdminPrices } from "../lib/api";
import { currency } from "../lib/pricing";

const pages = [
  "Dashboard",
  "Anfragen/Aufträge",
  "Kunden",
  "Angebote",
  "Analyse",
  "Kalender",
  "Preiseinstellungen",
  "Kommunikation",
  "Export",
  "Einstellungen"
];

export default function AdminDashboard({ authenticated = false }) {
  const [offers, setOffers] = useState([]);
  const [state, setState] = useState("loading");
  const [activePage, setActivePage] = useState("Dashboard");
  const [prices, setPrices] = useState(defaultPrices);
  const [priceState, setPriceState] = useState("idle");
  const [analytics, setAnalytics] = useState(null);
  const stats = useMemo(() => {
    const revenue = offers.reduce((sum, item) => sum + Number(item.totals?.gross || 0), 0);
    const cities = offers.map((item) => item.project?.zipCity || "").filter(Boolean);
    const popularCity = cities[0] || "Noch offen";
    return [
      ["Anfragen gesamt", String(offers.length)],
      ["Neue Anfragen", String(offers.filter((item) => item.status === "Neu").length)],
      ["Unvollständig", String(offers.filter((item) => item.status === "Unvollständig").length)],
      ["Umsatzübersicht", currency(revenue)],
      ["Beliebteste Stadt", popularCity]
    ];
  }, [offers]);

  useEffect(() => {
    const token = localStorage.getItem("flowarm-auth-token");
    if (!token) {
      setState("error");
      return;
    }
    Promise.all([listAdminOffers(token), getPriceSettings(), getAdminAnalytics(token)])
      .then((data) => {
        setOffers(data[0]);
        setPrices(data[1]);
        setAnalytics(data[2]);
        setState("ready");
      })
      .catch(() => setState("error"));
  }, []);

  const savePrices = async (nextPrices) => {
    const token = localStorage.getItem("flowarm-auth-token");
    if (!token) return;
    setPriceState("saving");
    try {
      const updated = await updateAdminPrices(token, nextPrices);
      setPrices(updated);
      setPriceState("saved");
    } catch {
      setPriceState("error");
    }
  };

  return (
    <section id="admin" className="min-h-screen bg-black px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-warm">Admin-System</p>
            <h2 className="mt-3 text-4xl font-semibold">Dashboard für Anfragen, Preise und Termine</h2>
          </div>
          <div className="flex gap-2 rounded-full border border-white/12 p-1 text-xs">
            <span className="rounded-full bg-warm px-3 py-2 font-bold text-ink">Admin</span>
            <span className="px-3 py-2 text-white/55">Sachbearbeiter</span>
          </div>
        </div>
        <div className="grid gap-8 lg:grid-cols-[270px_1fr]">
          <aside className="space-y-5">
            <div className="rounded-lg border border-white/10 bg-white/[.04] p-4">
              {pages.map((page) => (
                <button
                  key={page}
                  onClick={() => setActivePage(page)}
                  className={`block w-full rounded-md px-3 py-2 text-left text-sm transition ${
                    activePage === page ? "bg-warm text-ink font-bold" : "text-white/68 hover:bg-white/7 hover:text-white"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </aside>
          <div className="space-y-5">
            <AdminContent activePage={activePage} offers={offers} state={state} stats={stats} prices={prices} priceState={priceState} analytics={analytics} onSavePrices={savePrices} />
          </div>
        </div>
      </div>
    </section>
  );
}

function AdminContent({ activePage, offers, state, stats, prices, priceState, analytics, onSavePrices }) {
  if (activePage === "Dashboard") {
    return (
      <>
        <StatsGrid stats={stats} />
        <RequestsTable offers={offers} state={state} title="Aktuelle Anfragen" />
        <div className="grid gap-4 md:grid-cols-3">
          <AdminTile icon={<Settings />} title="Preise bearbeiten" text={`Fräsen aktuell ${prices.milling} €/m²`} />
          <AdminTile icon={<Calendar />} title="Termine" text="Bestätigen, ablehnen, Slots verwalten" />
          <AdminTile icon={<ShieldCheck />} title="Backend-ready" text="JWT, PostgreSQL/Supabase, E-Mail vorbereitet" />
        </div>
      </>
    );
  }

  if (activePage === "Anfragen/Aufträge") return <RequestsTable offers={offers} state={state} title="Anfragen und Aufträge" />;
  if (activePage === "Kunden") return <CustomersView offers={offers} />;
  if (activePage === "Angebote") return <OffersView offers={offers} state={state} />;
  if (activePage === "Analyse") return <AnalyticsView analytics={analytics} />;
  if (activePage === "Kalender") return <PlaceholderView icon={<Calendar />} title="Kalender" text="Terminplanung, Rückrufwünsche und Montagefenster werden hier gebündelt." />;
  if (activePage === "Preiseinstellungen") return <PricesView prices={prices} state={priceState} onSave={onSavePrices} />;
  if (activePage === "Kommunikation") return <PlaceholderView icon={<Mail />} title="Kommunikation" text="E-Mail-Vorlagen, Rückrufnotizen und Kundenkommunikation werden hier vorbereitet." />;
  if (activePage === "Export") return <ExportView offers={offers} />;
  return <SettingsView />;
}

function StatsGrid({ stats }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {stats.map(([label, value]) => (
        <div key={label} className="rounded-lg border border-white/10 bg-white/[.04] p-4">
          <p className="text-xs text-white/45">{label}</p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
        </div>
      ))}
    </div>
  );
}

function RequestsTable({ offers, state, title }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[.04] p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl font-semibold">{title}</h3>
        <button className="flex items-center gap-2 rounded-md border border-white/12 px-3 py-2 text-sm"><Download size={16} /> CSV/Excel Export</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="text-white/45"><tr><th className="py-3">Nr.</th><th>Datum</th><th>Kunde</th><th>Stadt</th><th>Status</th><th>Brutto</th><th>Kontakt</th></tr></thead>
          <tbody>
            {offers.map((row) => (
              <tr key={row.id} className="border-t border-white/8">
                <td className="py-4">{row.offerNo}</td><td>{formatDateTime(row.createdAt)}</td><td>{row.project?.name || "-"}</td><td>{row.project?.zipCity || "-"}</td><td><span className={`rounded-full px-3 py-1 ${statusClass(row.status)}`}>{row.status}</span></td><td>{currency(row.totals?.gross)}</td><td>{row.project?.email || row.project?.phone || "-"}</td>
              </tr>
            ))}
            {state !== "ready" || offers.length === 0 ? (
              <tr className="border-t border-white/8">
                <td colSpan="7" className="py-8 text-center text-white/50">
                  {state === "loading" ? "Anfragen werden geladen..." : "Noch keine Anfragen vorhanden oder Admin-API nicht erreichbar."}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CustomersView({ offers }) {
  const customers = offers.map((offer) => offer.project).filter(Boolean);
  return (
    <div className="rounded-lg border border-white/10 bg-white/[.04] p-5">
      <h3 className="text-xl font-semibold">Kunden</h3>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {customers.map((customer, index) => (
          <div key={`${customer.email}-${index}`} className="rounded-md border border-white/10 bg-black/25 p-4">
            <p className="font-semibold">{customer.name || "Ohne Name"}</p>
            <p className="mt-2 text-sm text-white/55">{customer.email || "-"} · {customer.phone || "-"}</p>
            <p className="mt-1 text-sm text-white/45">{customer.zipCity || "Ort offen"}</p>
          </div>
        ))}
        {customers.length === 0 && <EmptyState text="Noch keine Kundenkontakte vorhanden." />}
      </div>
    </div>
  );
}

function OffersView({ offers, state }) {
  return (
    <div className="space-y-5">
      <RequestsTable offers={offers} state={state} title="Angebote" />
      <PlaceholderView icon={<ShieldCheck />} title="PDF-Angebote" text="Hier werden später versendete PDF-Angebote, Status und Wiedervorlagen angezeigt." />
    </div>
  );
}

function AnalyticsView({ analytics }) {
  const summary = analytics?.summary || {};
  const recent = analytics?.recent || [];
  const cards = [
    ["Besuche gesamt", summary.totalVisits || 0],
    ["Eindeutige IPs", summary.uniqueIps || 0],
    ["Letzte 24 Stunden", summary.visits24h || 0],
    ["Letzte 7 Tage", summary.visits7d || 0]
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-white/10 bg-white/[.04] p-5">
        <div className="mb-5 flex items-center gap-3">
          <BarChart3 className="text-warm" />
          <h3 className="text-xl font-semibold">Analyse</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(([label, value]) => (
            <div key={label} className="rounded-md border border-white/10 bg-black/25 p-4">
              <p className="text-xs text-white/45">{label}</p>
              <p className="mt-2 text-3xl font-semibold">{value}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm leading-6 text-white/45">
          Gezählt werden Besucher, die Analyse-Cookies akzeptiert haben.
        </p>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[.04] p-5">
        <h3 className="text-xl font-semibold">Letzte Besucher</h3>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="text-white/45">
              <tr><th className="py-3">Datum</th><th>IP-Adresse</th><th>Seite</th><th>Referrer</th><th>User-Agent</th></tr>
            </thead>
            <tbody>
              {recent.map((row) => (
                <tr key={row.id} className="border-t border-white/8">
                  <td className="py-4">{formatDateTime(row.createdAt)}</td>
                  <td>{row.ip || "-"}</td>
                  <td>{row.path || "-"}</td>
                  <td className="max-w-[220px] truncate">{row.referrer || "-"}</td>
                  <td className="max-w-[260px] truncate text-white/55">{row.userAgent || "-"}</td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr className="border-t border-white/8">
                  <td colSpan="5" className="py-8 text-center text-white/50">Noch keine Analyse-Daten vorhanden.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PricesView({ prices, state, onSave }) {
  const [draft, setDraft] = useState(prices);
  const rows = [
    ["setup", "Anfahrt/Rüstzeug", "Pauschale", "€"],
    ["milling", "Fräsen & Rohrlegung", "pro m²", "€/m²"],
    ["manifold", "Heizkreisverteiler", "pro Ebene", "€"],
    ["closing", "Verschließen", "pro m²", "€/m²"],
    ["leveling", "Ausgleichsmasse", "pro m²", "€/m²"]
  ];

  useEffect(() => {
    setDraft(prices);
  }, [prices]);

  const setDraftPrice = (key, value) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const submit = (event) => {
    event.preventDefault();
    onSave({
      setup: Number(draft.setup),
      milling: Number(draft.milling),
      manifold: Number(draft.manifold),
      closing: Number(draft.closing),
      leveling: Number(draft.leveling)
    });
  };

  return (
    <form onSubmit={submit} className="rounded-lg border border-white/10 bg-white/[.04] p-5">
      <div className="mb-5 flex items-center gap-3">
        <SlidersHorizontal className="text-warm" />
        <h3 className="text-xl font-semibold">Preiseinstellungen</h3>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map(([key, label, hint, unit]) => (
          <label key={key} className="rounded-md border border-white/10 bg-black/25 p-4">
            <p className="text-sm text-white/45">{label}</p>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="0.01"
                value={draft[key] ?? ""}
                onChange={(event) => setDraftPrice(key, event.target.value)}
                className="w-full rounded-md border border-white/10 bg-black px-3 py-3 text-lg font-semibold text-white outline-none transition focus:border-warm focus:ring-4 focus:ring-warm/20"
              />
              <span className="min-w-14 text-sm font-semibold text-warm">{unit}</span>
            </div>
            <p className="mt-2 text-xs text-white/40">{hint}</p>
          </label>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button disabled={state === "saving"} className="rounded-md bg-warm px-5 py-3 font-bold text-ink disabled:opacity-60">
          {state === "saving" ? "Speichert..." : "Preise speichern"}
        </button>
        {state === "saved" && <span className="text-sm text-green-300">Preise gespeichert.</span>}
        {state === "error" && <span className="text-sm text-red-300">Preise konnten nicht gespeichert werden.</span>}
      </div>
    </form>
  );
}

function ExportView({ offers }) {
  return (
    <PlaceholderView
      icon={<Download />}
      title="Export"
      text={`${offers.length} Anfrage(n) verfügbar. CSV/Excel-Export ist als nächster Schritt vorbereitet.`}
    />
  );
}

function SettingsView() {
  return (
    <PlaceholderView
      icon={<UsersRound />}
      title="Einstellungen"
      text="Benutzerrollen, Benachrichtigungen, API-Verbindungen und Datenschutz-Einstellungen werden hier verwaltet."
    />
  );
}

function PlaceholderView({ icon, title, text }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[.04] p-6">
      <div className="mb-4 text-warm">{icon}</div>
      <h3 className="text-2xl font-semibold">{title}</h3>
      <p className="mt-3 max-w-2xl leading-7 text-white/58">{text}</p>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-md border border-dashed border-white/15 p-6 text-center text-white/50">
      {text}
    </div>
  );
}

function statusClass(status) {
  if (status === "Unvollständig") return "bg-white/10 text-white/60";
  if (status === "Neu") return "bg-warm/15 text-warm";
  if (status === "Abgeschlossen") return "bg-green-500/15 text-green-300";
  return "bg-blue-500/15 text-blue-200";
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function AdminTile({ icon, title, text }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[.04] p-5">
      <div className="mb-4 text-warm">{icon}</div>
      <h4 className="font-semibold">{title}</h4>
      <p className="mt-2 text-sm text-white/55">{text}</p>
    </div>
  );
}
