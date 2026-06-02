import { Download, Mail } from "lucide-react";
import { useMemo } from "react";
import { createOfferPdf } from "../lib/pdf";
import { assets } from "../data/content";

export default function PdfOffer({ form, offer }) {
  const offerNo = useMemo(() => `AG-${new Date().getFullYear()}-${Math.floor(1800 + Math.random() * 800)}`, []);
  const download = async () => {
    const logo = await imageToDataUrl(assets.logo);
    const doc = createOfferPdf({ form, offer, offerNo, logo });
    doc.save(`${offerNo}-FloWarm-Angebot.pdf`);
  };
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button onClick={download} className="flex items-center justify-center gap-2 rounded-md bg-warm px-5 py-4 font-bold text-ink">
        <Download size={18} /> PDF-Angebot erstellen
      </button>
      <button className="flex items-center justify-center gap-2 rounded-md border border-white/18 px-5 py-4 font-semibold text-white/80">
        <Mail size={18} /> Demo: per E-Mail senden
      </button>
    </div>
  );
}

async function imageToDataUrl(src) {
  try {
    const response = await fetch(src);
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}
