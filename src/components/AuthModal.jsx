import { X } from "lucide-react";
import { useState } from "react";
import { loginUser, registerCustomer } from "../lib/api";
import Logo from "./Logo";

export default function AuthModal({ open, onClose, onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  if (!open) return null;

  const submit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("submitting");
    setError("");
    try {
      const payload = {
        name: form.get("name")?.toString() || "",
        phone: form.get("phone")?.toString() || "",
        email: form.get("email")?.toString() || "",
        password: form.get("password")?.toString() || ""
      };
      const result = mode === "login" ? await loginUser(payload) : await registerCustomer(payload);
      localStorage.setItem("flowarm-auth-token", result.token);
      onAuthenticated(result.user);
      onClose();
    } catch {
      setError(mode === "login" ? "Login fehlgeschlagen. Bitte Zugangsdaten prüfen." : "Registrierung fehlgeschlagen. Bitte später erneut versuchen.");
      setStatus("error");
    }
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
              <input required name="name" placeholder="Name" className="rounded-md border border-white/12 bg-black/25 px-4 py-4 outline-none focus:border-warm" />
              <input required name="phone" placeholder="Telefon" className="rounded-md border border-white/12 bg-black/25 px-4 py-4 outline-none focus:border-warm" />
            </div>
          )}
          <input required name="email" type="email" placeholder="E-Mail" className="w-full rounded-md border border-white/12 bg-black/25 px-4 py-4 outline-none focus:border-warm" />
          <input required name="password" type="password" placeholder="Passwort" minLength={8} className="w-full rounded-md border border-white/12 bg-black/25 px-4 py-4 outline-none focus:border-warm" />
          {mode === "register" && (
            <label className="flex items-start gap-3 rounded-md border border-white/12 bg-white/[.04] p-4 text-sm leading-6 text-white/62">
              <input required type="checkbox" className="mt-1 accent-warm" />
              <span>
                Ich habe die <a href="/datenschutz" className="font-semibold text-warm underline decoration-warm/40 underline-offset-4">Datenschutzerklaerung</a> gelesen und stimme der Verarbeitung meiner Daten zur Kontoerstellung zu.
              </span>
            </label>
          )}
          {error && <p className="rounded-md border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-100">{error}</p>}
          <p className="text-sm leading-6 text-white/55">
            Admin-Zugänge werden aus Sicherheitsgründen nur serverseitig vergeben.
          </p>
          <button disabled={status === "submitting"} className="w-full rounded-md bg-warm px-5 py-4 font-bold text-ink disabled:opacity-60">
            {status === "submitting" ? "Bitte warten..." : mode === "login" ? "Einloggen" : "Registrieren"}
          </button>
        </form>
      </div>
    </div>
  );
}
