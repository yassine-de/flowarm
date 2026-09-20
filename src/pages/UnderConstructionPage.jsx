import { ArrowUpRight, Clock3, Mail, Phone } from "lucide-react";
import Logo from "../components/Logo";
import { assets } from "../data/content";

export default function UnderConstructionPage({ go }) {
  return (
    <div className="min-h-screen bg-ink text-white">
      <header className="absolute inset-x-0 top-0 z-20 border-b border-white/10 bg-ink/55 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <a
            href="tel:+4915158493054"
            className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white transition hover:border-warm/60 hover:text-warm sm:hidden"
            aria-label="FloWarm anrufen"
          >
            <Phone size={19} />
          </a>
          <a
            href="tel:+4915158493054"
            className="hidden items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-warm/60 hover:text-warm sm:inline-flex"
          >
            <Phone size={17} /> 0151 58493054
          </a>
        </div>
      </header>

      <main className="relative flex min-h-[calc(100vh-88px)] items-end overflow-hidden pt-20 lg:items-center">
        <img
          src={assets.scenes[3]}
          alt="FloWarm Facharbeiten an einer Fußbodenheizung"
          className="absolute inset-0 h-full w-full object-cover object-[58%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/35" />

        <section className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-14 pt-28 sm:px-6 sm:pb-20 lg:py-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-warm/35 bg-black/35 px-4 py-2 text-xs font-bold uppercase text-warm backdrop-blur-md">
              <Clock3 size={15} /> Unsere Website wird modernisiert
            </div>
            <h1 className="mt-6 text-balance text-5xl font-semibold leading-[1.04] sm:text-6xl lg:text-7xl">
              Wir bringen gerade<br />
              <span className="text-warm">Wärme ins Web.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72 sm:text-xl">
              Unsere neue Website ist bald für Sie da. FloWarm bleibt natürlich erreichbar und kümmert sich weiterhin um Ihre Fußbodenheizung.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="tel:+4915158493054"
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-warm px-6 py-4 font-bold text-ink shadow-glow transition hover:-translate-y-0.5"
              >
                <Phone size={19} /> Jetzt anrufen
              </a>
              <a
                href="mailto:info@flowarm.de"
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full border border-white/20 bg-black/25 px-6 py-4 font-semibold text-white backdrop-blur-md transition hover:border-warm/55 hover:text-warm"
              >
                <Mail size={19} /> info@flowarm.de
              </a>
            </div>

            <div className="mt-12 h-px w-full max-w-xl bg-gradient-to-r from-warm via-warm/35 to-transparent" />
            <p className="mt-5 text-sm leading-6 text-white/50">
              Präzises Fräsen. Saubere Installation. Effiziente Wärme.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-black px-4 py-7 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} FloWarm GmbH</p>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <button onClick={() => go("/impressum")} className="inline-flex items-center gap-1.5 transition hover:text-white">
              Impressum <ArrowUpRight size={14} />
            </button>
            <button onClick={() => go("/datenschutz")} className="inline-flex items-center gap-1.5 transition hover:text-white">
              Datenschutz <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
