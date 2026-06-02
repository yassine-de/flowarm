import { BarChart3, Calendar, Download, Settings, ShieldCheck, Users } from "lucide-react";
import { demoRequests, defaultPrices } from "../data/content";
import { currency } from "../lib/pricing";
import Login from "./Login";

export default function AdminDashboard({ authenticated = false }) {
  const pages = ["Dashboard", "Anfragen/Aufträge", "Kunden", "Angebote", "Kalender", "Preiseinstellungen", "Kommunikation", "Export", "Einstellungen"];
  const stats = [
    ["Anfragen diese Woche", "18"],
    ["Anfragen diesen Monat", "74"],
    ["Conversion Angebot → Termin", "42 %"],
    ["Umsatzübersicht", "132.800 €"],
    ["Beliebteste Stadt", "Frankfurt"]
  ];
  return (
    <section id="admin" className="bg-black px-4 py-20 sm:px-6">
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
          <div className="space-y-5">
            {!authenticated && <Login title="Admin-Login" note="Rollen: Admin mit Vollzugriff, Sachbearbeiter ohne Preiseinstellungen." />}
            <div className="rounded-lg border border-white/10 bg-white/[.04] p-4">
              {pages.map((page) => <button key={page} className="block w-full rounded-md px-3 py-2 text-left text-sm text-white/68 hover:bg-white/7 hover:text-white">{page}</button>)}
            </div>
          </div>
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {stats.map(([label, value]) => (
                <div key={label} className="rounded-lg border border-white/10 bg-white/[.04] p-4">
                  <p className="text-xs text-white/45">{label}</p>
                  <p className="mt-2 text-2xl font-semibold">{value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[.04] p-5">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-xl font-semibold">Aktuelle Anfragen</h3>
                <button className="flex items-center gap-2 rounded-md border border-white/12 px-3 py-2 text-sm"><Download size={16} /> CSV/Excel Export</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="text-white/45"><tr><th className="py-3">Nr.</th><th>Kunde</th><th>Stadt</th><th>Status</th><th>Brutto</th><th>Hinweis</th></tr></thead>
                  <tbody>
                    {demoRequests.map((row, index) => (
                      <tr key={row.id} className="border-t border-white/8">
                        <td className="py-4">{row.id}</td><td>{row.name}</td><td>{row.city}</td><td><span className="rounded-full bg-warm/15 px-3 py-1 text-warm">{row.status}</span></td><td>{currency(row.gross)}</td><td>{index === 1 ? "Duplikat-Warnung: E-Mail prüfen" : "Interne Notiz möglich"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <AdminTile icon={<Settings />} title="Preise bearbeiten" text={`Fräsen aktuell ${defaultPrices.milling} €/m²`} />
              <AdminTile icon={<Calendar />} title="Termine" text="Bestätigen, ablehnen, Slots verwalten" />
              <AdminTile icon={<ShieldCheck />} title="Backend-ready" text="JWT, PostgreSQL/Supabase, E-Mail vorbereitet" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
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
