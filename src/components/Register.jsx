export default function Register() {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[.04] p-5">
      <h3 className="text-xl font-semibold">Konto erstellen</h3>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <input placeholder="Name" className="rounded-md border border-white/12 bg-black/25 px-4 py-3 text-white" />
        <input placeholder="Telefon" className="rounded-md border border-white/12 bg-black/25 px-4 py-3 text-white" />
        <input placeholder="E-Mail" className="rounded-md border border-white/12 bg-black/25 px-4 py-3 text-white" />
        <input placeholder="Passwort" type="password" className="rounded-md border border-white/12 bg-black/25 px-4 py-3 text-white" />
      </div>
    </div>
  );
}
