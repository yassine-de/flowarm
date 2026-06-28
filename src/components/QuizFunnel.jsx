import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Building2, CalendarCheck, Factory, Home, House, MapPinned, PhoneCall, Ruler, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { defaultPrices } from "../data/content";
import { getPriceSettings, savePartialOfferLead, submitOfferLead } from "../lib/api";
import { calculateOffer } from "../lib/pricing";
import PdfOffer from "./PdfOffer";
import PriceCalculator from "./PriceCalculator";

const initial = {
  propertyType: "Einfamilienhaus",
  projectType: "Sanierung",
  area: 120,
  floors: "1",
  plan: "Ja, Grundriss hochladen",
  leveling: "Nein, nur Rohrkanäle verschließen",
  zipCity: "",
  timeframe: "1-3 Monate",
  name: "",
  email: "",
  phone: ""
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
  "Nein, nur Rohrkanäle verschließen": ["Für robuste Folgeaufbauten, wenn der Bodenleger den finalen Ausgleich übernimmt", Ruler],
  "Ja, Ausgleichsmasse anbieten": ["Empfohlen bei Belägen wie Vinyl, Laminat oder Designboden, wenn eine besonders ebene Fläche benötigt wird", Ruler],
  Sofort: ["Schnellstmögliche Umsetzung", CalendarCheck],
  "1-3 Monate": ["Konkrete Planung in Kürze", CalendarCheck],
  "3-6 Monate": ["Mittelfristiges Projekt", CalendarCheck],
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
  const [prices, setPrices] = useState(defaultPrices);
  const [submitState, setSubmitState] = useState("idle");
  const [submittedOffer, setSubmittedOffer] = useState(null);
  const [consent, setConsent] = useState(false);
  const partialTimer = useRef(null);
  const lastPartialPayload = useRef("");
  const offer = useMemo(() => calculateOffer(form, prices), [form, prices]);
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const inputClass = "flowarm-input rounded-md border border-ink/12 bg-white px-4 py-4 text-ink shadow-sm outline-none transition placeholder:text-ink/38 hover:border-warm/45 focus:border-warm focus:ring-4 focus:ring-warm/15";
  const steps = [
    { title: "Immobilientyp", field: "propertyType", choices: ["Wohnung", "Einfamilienhaus", "Mehrfamilienhaus", "Gewerbe"] },
    { title: "Projektart", field: "projectType", choices: ["Sanierung", "Neubau"] },
    { title: "Fläche", custom: "area" },
    { title: "Stockwerke", field: "floors", choices: ["1", "2", "3+"] },
    { title: "Grundriss vorhanden?", field: "plan", choices: ["Ja, Grundriss hochladen", "Nein, Maße manuell eingeben"] },
    { title: "Ausgleichsmasse gewünscht?", field: "leveling", choices: ["Nein, nur Rohrkanäle verschließen", "Ja, Ausgleichsmasse anbieten"] },
    { title: "Stadt / PLZ", custom: "zipCity" },
    { title: "Zeitraum", field: "timeframe", choices: ["Sofort", "1-3 Monate", "3-6 Monate", "Noch offen"] },
    { title: "Kontaktdaten", custom: "contact" },
    { title: "Preisübersicht", custom: "price" }
  ];
  const current = steps[step];
  const canContinue = step !== 8 || (form.name.trim() && form.email.trim() && form.phone.trim() && consent);

  useEffect(() => {
    getPriceSettings().then(setPrices).catch(() => setPrices(defaultPrices));
  }, []);

  useEffect(() => {
    if (submitState === "success" || !consent || step < 8) return;
    const hasContact = form.email.includes("@") || form.phone.replace(/\D/g, "").length >= 5;
    if (!hasContact) return;
    const payload = JSON.stringify({ form, offer, step });
    if (payload === lastPartialPayload.current) return;
    window.clearTimeout(partialTimer.current);
    partialTimer.current = window.setTimeout(() => {
      savePartialOfferLead({
        form,
        offer,
        source: "flowarm-website",
        lastStep: step,
        submittedAt: new Date().toISOString()
      })
        .then(() => {
          lastPartialPayload.current = payload;
        })
        .catch(() => {});
    }, 900);
    return () => window.clearTimeout(partialTimer.current);
  }, [consent, form, offer, step, submitState]);

  const submitLead = async () => {
    setSubmitState("submitting");
    try {
      const result = await submitOfferLead({
        form,
        offer,
        source: "flowarm-website",
        submittedAt: new Date().toISOString()
      });
      setSubmittedOffer(result);
      setSubmitState("success");
    } catch {
      setSubmitState("error");
    }
  };

  return (
    <section id="angebot" className="bg-pearl px-4 py-20 text-ink sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-warm">2-Minuten-Konfigurator</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{t.funnelTitle}</h2>
          </div>
          <div className="w-full max-w-sm">
            <div className="mb-2 flex justify-between text-xs font-semibold text-ink/45"><span>Fortschritt</span><span>{step + 1}/{steps.length}</span></div>
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
                  <div className="mt-8 rounded-lg border border-warm/18 bg-[#fff8ed] p-5 shadow-inner shadow-black/5">
                    <div className="flex flex-wrap items-end gap-3">
                      <input type="number" value={form.area} onChange={(e) => set("area", e.target.value)} className="w-36 rounded-md border border-warm/25 bg-white px-4 py-3 text-3xl font-semibold text-ink shadow-sm outline-none transition focus:border-warm focus:ring-4 focus:ring-warm/15" />
                      <span className="pb-3 text-ink/60">m² beheizte Fläche</span>
                    </div>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/55">Gemeint ist die beheizte Wohn- oder Nutzfläche. Nicht beheizte Nebenräume können Sie weglassen.</p>
                    <input type="range" min="30" max="350" value={form.area} onChange={(e) => set("area", e.target.value)} className="mt-8 w-full accent-warm" />
                  </div>
                )}
                {current.custom === "zipCity" && (
                  <div className="mt-8 rounded-lg border border-warm/18 bg-[#fff8ed] p-5 shadow-inner shadow-black/5">
                    <input value={form.zipCity} onChange={(e) => set("zipCity", e.target.value)} placeholder="z. B. 60311 Frankfurt" className={`${inputClass} w-full`} />
                    <p className="mt-3 text-sm leading-6 text-ink/55">Damit planen wir Anfahrt, regionale Verfügbarkeit und eine realistische Terminoption.</p>
                  </div>
                )}
                {current.custom === "contact" && (
                  <div className="mt-7 grid gap-4 sm:grid-cols-2">
                    <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Name" autoComplete="name" className={inputClass} />
                    <input value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="E-Mail" autoComplete="email" className={inputClass} />
                    <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Telefon" autoComplete="tel" className={inputClass} />
                    <label className="flex cursor-pointer items-start gap-4 rounded-md border border-warm/20 bg-[#fff8ed] p-5 text-sm leading-6 text-ink/72 transition hover:border-warm/45 hover:bg-[#fff4e4] sm:col-span-2">
                      <input checked={consent} onChange={(event) => setConsent(event.target.checked)} type="checkbox" className="mt-1 h-5 w-5 shrink-0 rounded border-ink/25 accent-warm" />
                      <span>
                        Ich habe die <a href="/datenschutz" className="font-semibold text-warm underline decoration-warm/40 underline-offset-4">Datenschutzerklärung</a> gelesen und bin einverstanden, dass FloWarm meine Angaben zur Angebotserstellung und Kontaktaufnahme per E-Mail oder Telefon verarbeitet.
                      </span>
                    </label>
                    {!canContinue && (
                      <p className="text-sm text-ink/45 sm:col-span-2">Bitte alle Kontaktdaten eintragen und die Einwilligung bestätigen.</p>
                    )}
                  </div>
                )}
                {current.custom === "price" && (
                  <div className="mt-7 space-y-5">
                    {submitState === "success" && (
                      <div className="rounded-lg border border-green-500/30 bg-green-50 p-5 text-green-900">
                        <p className="font-semibold">Ihre Anfrage wurde übermittelt.</p>
                        <p className="mt-2 text-sm">Angebotsnummer: {submittedOffer?.offerNo || submittedOffer?.id || "wird zugewiesen"}. Wir melden uns zur technischen Prüfung.</p>
                      </div>
                    )}
                    {submitState === "error" && (
                      <div className="rounded-lg border border-red-500/30 bg-red-50 p-5 text-red-900">
                        <p className="font-semibold">Die Anfrage konnte nicht gesendet werden.</p>
                        <p className="mt-2 text-sm">Bitte prüfen Sie die Server-/Netlify-Konfiguration oder kontaktieren Sie FloWarm direkt telefonisch.</p>
                      </div>
                    )}
                    <PriceCalculator offer={offer} hint={t.legalHint} />
                    <div className="grid gap-3 sm:grid-cols-[1.2fr_.8fr]">
                      <button onClick={submitLead} disabled={submitState === "submitting" || submitState === "success"} className="flex min-h-[60px] items-center justify-center gap-2 rounded-md bg-warm px-5 py-4 text-base font-bold text-ink shadow-glow transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60">
                        <CalendarCheck size={20} /> {submitState === "submitting" ? "Anfrage wird gesendet..." : "Anfrage absenden"}
                      </button>
                      <button className="flex min-h-[60px] items-center justify-center gap-2 rounded-md border border-ink/15 bg-white px-5 py-4 font-semibold text-ink transition hover:border-warm/50 hover:bg-[#fff8ed]"><PhoneCall size={18} /> Rückruf</button>
                    </div>
                    <PdfOffer form={form} offer={offer} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
            <div className="mt-8 flex justify-between">
              <button disabled={step === 0} onClick={() => setStep(step - 1)} className="flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-ink/60 disabled:opacity-25">
                <ArrowLeft size={17} /> Zurück
              </button>
              <button disabled={step === steps.length - 1 || !canContinue} onClick={() => setStep(step + 1)} className="flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white disabled:opacity-25">
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
