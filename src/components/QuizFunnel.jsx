import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Building2, CalendarCheck, Factory, Home, House, MapPinned, PhoneCall, Ruler, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { defaultPrices } from "../data/content";
import { calculateOffer } from "../lib/pricing";
import PdfOffer from "./PdfOffer";
import PriceCalculator from "./PriceCalculator";

const initial = {
  propertyType: "Einfamilienhaus",
  projectType: "Sanierung",
  area: 120,
  floors: "1",
  plan: "Ja, Grundriss hochladen",
  zipCity: "",
  timeframe: "1–3 Monate",
  name: "",
  email: "",
  phone: "",
  password: ""
};

const choiceDetails = {
  Wohnung: ["Etagenwohnung oder Apartment", Home],
  Einfamilienhaus: ["Privates Haus mit einem Eigentümer", House],
  Mehrfamilienhaus: ["Mehrere Wohneinheiten", Building2],
  Gewerbe: ["Praxis, Büro, Laden oder Objekt", Factory],
  Sanierung: ["Nachträglich in bestehenden Estrich fräsen", Ruler],
  Neubau: ["Planung im neuen Aufbau", Building2],
  "1": ["Eine Ebene", Home],
  "2": ["Zwei Ebenen", Building2],
  "3+": ["Drei oder mehr Ebenen", Building2],
  "Ja, Grundriss hochladen": ["PDF, Foto oder Plan später ergänzen", Upload],
  "Nein, Maße manuell eingeben": ["Wir führen Sie durch die Maße", Ruler],
  Sofort: ["Schnellstmögliche Umsetzung", CalendarCheck],
  "1–3 Monate": ["Konkrete Planung in Kürze", CalendarCheck],
  "3–6 Monate": ["Mittelfristiges Projekt", CalendarCheck],
  "Noch offen": ["Erst Preisrahmen berechnen", MapPinned]
};

function Choice({ active, children, onClick }) {
  const [description, Icon] = choiceDetails[children] || ["", Home];
  return (
    <button onClick={onClick} className={`min-h-[112px] rounded-md border p-4 text-left transition ${active ? "border-warm bg-warm/10 text-ink shadow-[0_18px_40px_rgba(242,138,24,.18)]" : "border-ink/10 bg-white text-ink hover:border-warm/60 hover:bg-[#fff8ed]"}`}>
      <span className={`mb-4 grid h-10 w-10 place-items-center rounded-full ${active ? "bg-warm text-ink" : "bg-ink/5 text-warm"}`}>
        <Icon size={20} />
      </span>
      <span className="block font-semibold">{children}</span>
      {description && <span className="mt-1 block text-sm leading-5 text-ink/55">{description}</span>}
    </button>
  );
}

export default function QuizFunnel({ t }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initial);
  const offer = useMemo(() => calculateOffer(form, defaultPrices), [form]);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const steps = [
    { title: "Immobilientyp", field: "propertyType", choices: ["Wohnung", "Einfamilienhaus", "Mehrfamilienhaus", "Gewerbe"] },
    { title: "Projektart", field: "projectType", choices: ["Sanierung", "Neubau"] },
    { title: "Fläche", custom: "area" },
    { title: "Stockwerke", field: "floors", choices: ["1", "2", "3+"] },
    { title: "Grundriss vorhanden?", field: "plan", choices: ["Ja, Grundriss hochladen", "Nein, Maße manuell eingeben"] },
    { title: "Stadt / PLZ", custom: "zipCity" },
    { title: "Zeitraum", field: "timeframe", choices: ["Sofort", "1–3 Monate", "3–6 Monate", "Noch offen"] },
    { title: "Kontaktdaten", custom: "contact" },
    { title: "Preisübersicht", custom: "price" }
  ];
  const current = steps[step];

  return (
    <section id="angebot" className="bg-pearl px-4 py-20 text-ink sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-warm">2-Minuten-Konfigurator</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{t.funnelTitle}</h2>
          </div>
          <div className="w-full max-w-sm">
            <div className="mb-2 flex justify-between text-xs font-semibold text-ink/45"><span>Fortschritt</span><span>{step + 1}/9</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-ink/10"><div className="h-full bg-warm transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
          </div>
        </div>
        <div className="grid gap-8 lg:grid-cols-[1fr_430px]">
          <div className="rounded-lg bg-white p-5 shadow-2xl shadow-black/10 sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-warm">Frage {step + 1}</p>
                <h3 className="mt-2 text-3xl font-semibold">{current.title}</h3>
                {current.choices && (
                  <div className="mt-7 grid gap-4 sm:grid-cols-2">
                    {current.choices.map((choice) => (
                      <Choice key={choice} active={form[current.field] === choice} onClick={() => set(current.field, choice)}>
                        {choice}
                      </Choice>
                    ))}
                  </div>
                )}
                {current.custom === "area" && (
                  <div className="mt-8">
                    <div className="flex items-end gap-3">
                      <input type="number" value={form.area} onChange={(e) => set("area", e.target.value)} className="w-36 rounded-md border border-ink/12 px-4 py-3 text-3xl font-semibold" />
                      <span className="pb-3 text-ink/60">m² beheizte Fläche</span>
                    </div>
                    <input type="range" min="30" max="350" value={form.area} onChange={(e) => set("area", e.target.value)} className="mt-8 w-full accent-warm" />
                  </div>
                )}
                {current.custom === "zipCity" && (
                  <input value={form.zipCity} onChange={(e) => set("zipCity", e.target.value)} placeholder="z. B. 60311 Frankfurt" className="mt-8 w-full rounded-md border border-ink/12 px-4 py-4" />
                )}
                {current.custom === "contact" && (
                  <div className="mt-7 grid gap-4 sm:grid-cols-2">
                    <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Name" className="rounded-md border border-ink/12 px-4 py-4" />
                    <input value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="E-Mail" className="rounded-md border border-ink/12 px-4 py-4" />
                    <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Telefon" className="rounded-md border border-ink/12 px-4 py-4" />
                    <input value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Passwort" type="password" className="rounded-md border border-ink/12 px-4 py-4" />
                  </div>
                )}
                {current.custom === "price" && (
                  <div className="mt-7 space-y-5">
                    <PriceCalculator offer={offer} hint={t.legalHint} />
                    <PdfOffer form={form} offer={offer} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <button className="flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-4 font-semibold text-white"><CalendarCheck size={18} /> Termin vereinbaren</button>
                      <button className="flex items-center justify-center gap-2 rounded-md border border-ink/15 px-5 py-4 font-semibold"><PhoneCall size={18} /> Rückruf anfordern</button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
            <div className="mt-8 flex justify-between">
              <button disabled={step === 0} onClick={() => setStep(step - 1)} className="flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-ink/60 disabled:opacity-25">
                <ArrowLeft size={17} /> Zurück
              </button>
              <button disabled={step === steps.length - 1} onClick={() => setStep(step + 1)} className="flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white disabled:opacity-25">
                Weiter <ArrowRight size={17} />
              </button>
            </div>
          </div>
          <div className="rounded-lg bg-ink p-5 text-white shadow-2xl shadow-black/20">
            <PriceCalculator offer={offer} hint={t.legalHint} />
          </div>
        </div>
      </div>
    </section>
  );
}
