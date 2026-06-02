import { X } from "lucide-react";
import { useState } from "react";
import Logo from "./Logo";

export default function AuthModal({ open, onClose, onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("customer");
  if (!open) return null;

  const submit = (event) => {
    event.preventDefault();
    onAuthenticated({ role, name: role === "admin" ? "FloWarm Admin" : "Kunde" });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/75 px-4 backdrop-blur-xl">
      <div className="w-full max-w-xl rounded-lg border border-white/12 bg-ink p-5 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <Logo />
          <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full border border-white/12" aria-label="Schließen">
            <X size={18} />
          </button>
        </div>
        <div className="mt-8 flex rounded-full border border-white/12 bg-white/5 p-1">
          <button onClick={() => setMode("login")} className={`h-11 flex-1 rounded-full font-semibold ${mode === "login" ? "bg-warm text-ink" : "text-white/65"}`}>
            Anmelden
          </button>
          <button onClick={() => setMode("register")} className={`h-11 flex-1 rounded-full font-semibold ${mode === "register" ? "bg-warm text-ink" : "text-white/65"}`}>
            Konto erstellen
          </button>
        </div>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "register" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <input required placeholder="Name" className="rounded-md border border-white/12 bg-black/25 px-4 py-4 outline-none focus:border-warm" />
              <input required placeholder="Telefon" className="rounded-md border border-white/12 bg-black/25 px-4 py-4 outline-none focus:border-warm" />
            </div>
          )}
          <input required type="email" placeholder="E-Mail" className="w-full rounded-md border border-white/12 bg-black/25 px-4 py-4 outline-none focus:border-warm" />
          <input required type="password" placeholder="Passwort" className="w-full rounded-md border border-white/12 bg-black/25 px-4 py-4 outline-none focus:border-warm" />
          <div className="rounded-md border border-white/12 p-3">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/45">Demo-Rolle</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={() => setRole("customer")} className={`rounded-md px-4 py-3 text-sm font-semibold ${role === "customer" ? "bg-warm text-ink" : "bg-white/7 text-white/70"}`}>
                Kunde
              </button>
              <button type="button" onClick={() => setRole("admin")} className={`rounded-md px-4 py-3 text-sm font-semibold ${role === "admin" ? "bg-warm text-ink" : "bg-white/7 text-white/70"}`}>
                Admin
              </button>
            </div>
          </div>
          <button className="w-full rounded-md bg-warm px-5 py-4 font-bold text-ink">
            {mode === "login" ? "Einloggen" : "Registrieren"}
          </button>
        </form>
      </div>
    </div>
  );
}
