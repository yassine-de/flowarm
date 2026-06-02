const copy = {
  "/impressum": ["Impressum", "FloWarm GmbH, Musterstraße 1, 60311 Frankfurt am Main. Geschäftsführer: Demo. E-Mail: info@flowarm.de. Diese Seite ist ein Platzhalter und muss vor Veröffentlichung rechtlich geprüft werden."],
  "/datenschutz": ["Datenschutz", "Wir verarbeiten Demo-Formulardaten nur zur Angebotserstellung. Für den Live-Betrieb werden Rechtsgrundlagen, Aufbewahrung, Supabase-Hosting, E-Mail-Versand und Betroffenenrechte vollständig dokumentiert."],
  "/agb": ["AGB", "Alle Preise sind vorläufige Festpreise vorbehaltlich technischer Prüfung. Termine, Leistungsumfang und Zahlungsbedingungen werden im finalen Angebot verbindlich geregelt."]
};

export default function LegalPage({ path }) {
  const [title, text] = copy[path] || copy["/impressum"];
  return (
    <main className="min-h-[70vh] bg-pearl px-4 py-32 text-ink sm:px-6">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-warm">Rechtliches</p>
        <h1 className="mt-4 text-5xl font-semibold">{title}</h1>
        <p className="mt-7 leading-8 text-ink/65">{text}</p>
      </div>
    </main>
  );
}
