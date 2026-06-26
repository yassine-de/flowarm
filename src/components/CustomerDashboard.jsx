import { Download, Phone, CalendarDays } from "lucide-react";

export default function CustomerDashboard({ authenticated = false, user }) {
  const phases = ["Tag 1: Vorbereitung und Fräsen", "Tag 2: Rohrverlegung", "Tag 3: Verteilerkasten installieren und Anschluss"];
  return (
    <section id="konto" className="bg-ink px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-warm">Kundenbereich</p>
            <h2 className="mt-3 text-4xl font-semibold">Willkommen{user?.name ? `, ${user.name}` : ""}.</h2>
            <div className="mt-8 rounded-lg border border-white/10 bg-white/[.04] p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="font-semibold">Noch keine gespeicherten Angebote</p>
                  <p className="mt-1 text-sm text-white/55">Sobald Sie ein Angebot absenden und es Ihrem Konto zugeordnet ist, erscheint es hier mit PDF, Termin und Status.</p>
                </div>
                <button className="inline-flex items-center justify-center gap-2 rounded-md border border-white/15 px-4 py-3 text-sm font-semibold"><Download size={16} /> PDF-Bereich</button>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {phases.map((phase, index) => (
                  <div key={phase} className={`rounded-md p-3 text-sm ${index === 0 ? "bg-warm text-ink" : "bg-white/7 text-white/60"}`}>{phase}</div>
                ))}
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <button className="flex items-center justify-center gap-2 rounded-md bg-white px-5 py-4 font-semibold text-ink"><CalendarDays size={18} /> Termin buchen</button>
              <button className="flex items-center justify-center gap-2 rounded-md border border-white/15 px-5 py-4 font-semibold"><Phone size={18} /> Rückruf anfordern</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
