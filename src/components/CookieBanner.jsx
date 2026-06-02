import { useState } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(() => localStorage.getItem("flowarm-cookies") !== "accepted");
  if (!visible) return null;
  return (
    <div className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-4xl rounded-lg border border-white/12 bg-ink p-4 shadow-2xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm leading-6 text-white/68">
          Wir nutzen notwendige Cookies für diese Demo. Analyse und Marketing bleiben deaktiviert, bis Sie zustimmen.
        </p>
        <div className="flex gap-2">
          <button onClick={() => setVisible(false)} className="rounded-md border border-white/15 px-4 py-2 text-sm">Ablehnen</button>
          <button onClick={() => { localStorage.setItem("flowarm-cookies", "accepted"); setVisible(false); }} className="rounded-md bg-warm px-4 py-2 text-sm font-bold text-ink">Akzeptieren</button>
        </div>
      </div>
    </div>
  );
}
