import { useState } from "react";

export default function CookieBanner({ go }) {
  const [visible, setVisible] = useState(() => !localStorage.getItem("flowarm-cookie-choice"));
  const save = (choice) => {
    localStorage.setItem("flowarm-cookie-choice", choice);
    setVisible(false);
  };

  if (!visible) return null;
  return (
    <div className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-4xl rounded-lg border border-white/12 bg-ink p-4 shadow-2xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-white">Datenschutz-Einstellungen</p>
          <p className="mt-1 text-sm leading-6 text-white/68">
            Wir nutzen notwendige lokale Speicherung fuer Login, Sicherheit und Websitefunktionen. Analyse- und Marketingdienste bleiben deaktiviert, solange Sie nicht zustimmen.
          </p>
          <button onClick={() => go("/datenschutz")} className="mt-2 text-sm font-semibold text-warm">Datenschutzerklaerung ansehen</button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => save("necessary")} className="rounded-md border border-white/15 px-4 py-2 text-sm">Nur notwendige</button>
          <button onClick={() => save("accepted")} className="rounded-md bg-warm px-4 py-2 text-sm font-bold text-ink">Akzeptieren</button>
        </div>
      </div>
    </div>
  );
}
