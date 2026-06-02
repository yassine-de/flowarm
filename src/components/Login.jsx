export default function Login({ title = "Login", note = "Demo-Zugang ohne echte Authentifizierung." }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[.04] p-5">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-white/55">{note}</p>
      <div className="mt-5 grid gap-3">
        <input placeholder="E-Mail" className="rounded-md border border-white/12 bg-black/25 px-4 py-3 text-white outline-none focus:border-warm" />
        <input placeholder="Passwort" type="password" className="rounded-md border border-white/12 bg-black/25 px-4 py-3 text-white outline-none focus:border-warm" />
        <button className="rounded-md bg-warm px-4 py-3 font-bold text-ink">Einloggen</button>
      </div>
    </div>
  );
}
