import { ArrowRight, CheckCircle2, Clock3, Hammer, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { assets, cityPages } from "../data/content";

export default function CityLandingPage({ path, go }) {
  const page = cityPages[path] || cityPages["/fussbodenheizung-frankfurt"];
  const services = [
    ["Estrich fräsen", "Heizkanäle werden präzise in den vorhandenen Estrich eingebracht.", Hammer],
    ["Rohre verlegen", "Heizrohre werden bündig eingelegt und nach Heizkreisen strukturiert.", Sparkles],
    ["Verteiler planen", "Je Ebene wird die passende Verteilertechnik im Preisrahmen berücksichtigt.", ShieldCheck],
    ["3-Tage-Ablauf", "Vorbereitung, Fräsen, Rohrverlegung und Anschlussvorbereitung klar getaktet.", Clock3]
  ];
  const process = [
    ["1", "Sofortangebot berechnen", "Fläche, Etagen, Projektart und Ort eingeben. Danach erhalten Sie direkt einen nachvollziehbaren Preisrahmen."],
    ["2", "Technische Prüfung", "Estrich, Aufbauhöhe, Verteilerposition und Heizkreisplanung werden vor Ort oder anhand Ihrer Unterlagen geprüft."],
    ["3", "Saubere Umsetzung", "FloWarm fräst die Heizkanäle, verlegt Rohre und bereitet den Anschluss systematisch vor."]
  ];

  return (
    <main className="pt-20">
      <section className="relative min-h-[78vh] overflow-hidden px-4 py-24 sm:px-6">
        <img src={assets.scenes[6]} alt={page.title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/58 to-black/18" />
        <div className="relative mx-auto max-w-7xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-warm/30 bg-black/45 px-4 py-2 text-sm font-bold uppercase tracking-[0.24em] text-warm backdrop-blur">
            <MapPin size={16} /> FloWarm Region {page.city}
          </p>
          <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-tight sm:text-7xl">{page.title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/74">{page.text}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => go("/#angebot")} className="inline-flex items-center gap-2 rounded-full bg-warm px-6 py-4 font-bold text-ink shadow-glow">
              Angebot berechnen <ArrowRight size={18} />
            </button>
            <button onClick={() => go("/#prozess")} className="rounded-full border border-white/25 px-6 py-4 font-semibold text-white/85">
              3-Tage-Ablauf ansehen
            </button>
          </div>
        </div>
      </section>

      <section className="bg-pearl px-4 py-18 text-ink sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-warm">Lokale Modernisierung</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Fußbodenheizung nachrüsten mit klarer Planung in {page.city}.</h2>
            <p className="mt-5 text-lg leading-8 text-ink/64">{page.intro}</p>
            <p className="mt-5 text-lg leading-8 text-ink/64">{page.localFocus}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {services.map(([title, text, Icon]) => (
              <div key={title} className="rounded-lg bg-white p-6 shadow-xl shadow-black/5">
                <div className="mb-5 grid h-11 w-11 place-items-center rounded-full bg-warm/12 text-warm">
                  <Icon size={21} />
                </div>
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="mt-3 leading-7 text-ink/62">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink px-4 py-20 text-white sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[.75fr_1.25fr] lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-warm">Einsatzgebiete</p>
              <h2 className="mt-3 text-4xl font-semibold">In {page.city} und Umgebung für Sie im Einsatz.</h2>
            </div>
            <p className="text-lg leading-8 text-white/62">
              Ob Wohnung, Einfamilienhaus, Mehrfamilienhaus oder Gewerbe: Die genaue Machbarkeit wird technisch geprüft, der erste Preisrahmen kommt sofort aus dem Konfigurator.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {page.districts.map((district) => (
              <span key={district} className="rounded-full border border-white/12 bg-white/[.06] px-4 py-2 text-sm font-semibold text-white/78">
                {district}
              </span>
            ))}
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {["Wohnungssanierung", "Hausmodernisierung", "Gewerbeflächen"].map((useCase) => (
              <div key={useCase} className="rounded-lg border border-white/10 bg-white/[.04] p-5">
                <CheckCircle2 className="mb-4 text-warm" />
                <h3 className="font-semibold">{useCase}</h3>
                <p className="mt-3 text-sm leading-6 text-white/56">
                  Geeignet für Projekte, bei denen Komfort, niedrige Aufbauhöhe und planbare Bauzeit wichtig sind.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-pearl px-4 py-20 text-ink sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-warm">Ablauf</p>
              <h2 className="mt-3 text-4xl font-semibold">Vom Sofortangebot zur warmen Fläche.</h2>
              <p className="mt-5 text-lg leading-8 text-ink/62">
                Der Prozess ist so aufgebaut, dass Sie schnell eine Entscheidung treffen können und danach die technischen Details sauber geprüft werden.
              </p>
              <button onClick={() => go("/#angebot")} className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-4 font-bold text-white">
                Jetzt Preis berechnen <ArrowRight size={18} />
              </button>
            </div>
            <div className="grid gap-4">
              {process.map(([number, title, text]) => (
                <div key={title} className="flex gap-5 rounded-lg bg-white p-5 shadow-xl shadow-black/5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-warm text-lg font-bold text-ink">{number}</span>
                  <div>
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <p className="mt-2 leading-7 text-ink/62">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-graphite px-4 py-20 text-white sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.85fr_1.15fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-warm">FAQ {page.city}</p>
            <h2 className="mt-3 text-4xl font-semibold">Häufige Fragen zur Fußbodenheizung in {page.city}.</h2>
          </div>
          <div className="grid gap-4">
            {page.faq.map(([question, answer]) => (
              <div key={question} className="rounded-lg border border-white/10 bg-white/[.04] p-5">
                <h3 className="font-semibold">{question}</h3>
                <p className="mt-3 leading-7 text-white/58">{answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black px-4 py-16 text-white sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 rounded-lg border border-warm/20 bg-white/[.04] p-6 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-warm">Sofortangebot</p>
            <h2 className="mt-2 text-3xl font-semibold">Preis für {page.city} in ca. 2 Minuten berechnen.</h2>
          </div>
          <button onClick={() => go("/#angebot")} className="inline-flex items-center justify-center gap-2 rounded-full bg-warm px-6 py-4 font-bold text-ink shadow-glow">
            Konfigurator starten <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </main>
  );
}
