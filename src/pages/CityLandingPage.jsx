import { ArrowRight } from "lucide-react";
import { assets, cityPages } from "../data/content";

export default function CityLandingPage({ path, go }) {
  const page = cityPages[path] || cityPages["/fussbodenheizung-frankfurt"];
  return (
    <main className="pt-20">
      <section className="relative min-h-[76vh] overflow-hidden px-4 py-24 sm:px-6">
        <img src={assets.scenes[6]} alt={page.title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/15" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-warm">FloWarm Region</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-tight sm:text-7xl">{page.title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">{page.text}</p>
          <button onClick={() => go("/#angebot")} className="mt-8 inline-flex items-center gap-2 rounded-full bg-warm px-6 py-4 font-bold text-ink">
            Angebot berechnen <ArrowRight size={18} />
          </button>
        </div>
      </section>
      <section className="bg-pearl px-4 py-16 text-ink sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
          {["Sofortangebot", "Saubere Frästechnik", "3-Tage-Ablauf"].map((title) => (
            <div key={title} className="rounded-lg bg-white p-6 shadow-xl shadow-black/5">
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="mt-3 leading-7 text-ink/62">
                Premium-Prozess, klare Kommunikation und ein Angebot mit nachvollziehbaren Positionen für {page.city}.
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
