import { Menu, X } from "lucide-react";
import { useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "./Logo";

export default function Navbar({ t, lang, setLang, go, user, onLogin, onLogout }) {
  const [open, setOpen] = useState(false);
  const links = [
    ["#regionen", t.nav.cities]
  ];
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-ink/70 backdrop-blur-2xl">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
        <button onClick={() => go("/")} aria-label="FloWarm Startseite">
          <Logo />
        </button>
        <div className="hidden items-center gap-7 md:flex">
          {links.map(([href, label]) => (
            <button key={href} onClick={() => go(href)} className="text-sm text-white/72 transition hover:text-white">
              {label}
            </button>
          ))}
          <LanguageSwitcher lang={lang} setLang={setLang} />
          {user && (
            <button onClick={() => go("#dashboard")} className="text-sm text-white/72 transition hover:text-white">
              Dashboard
            </button>
          )}
          <button onClick={() => go("#angebot")} className="rounded-full bg-warm px-5 py-3 text-sm font-bold text-ink shadow-glow">
            Angebot berechnen
          </button>
          <button onClick={user ? onLogout : onLogin} className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white">
            {user ? "Abmelden" : "Anmelden"}
          </button>
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menü">
          {open ? <X /> : <Menu />}
        </button>
      </nav>
      {open && (
        <div className="border-t border-white/10 bg-ink px-4 py-5 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map(([href, label]) => (
              <button key={href} onClick={() => { go(href); setOpen(false); }} className="text-left text-white/80">
                {label}
              </button>
            ))}
            <LanguageSwitcher lang={lang} setLang={setLang} />
            <button onClick={() => { user ? onLogout() : onLogin(); setOpen(false); }} className="text-left text-white/80">
              {user ? "Abmelden" : "Anmelden"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
