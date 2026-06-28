import { Download } from "lucide-react";
import { useMemo } from "react";
import { assets } from "../data/content";

export default function PdfOffer({ form, offer }) {
  const offerNo = useMemo(() => `AG-${new Date().getFullYear()}-${Math.floor(1800 + Math.random() * 800)}`, []);
  const download = async () => {
    const { createOfferPdf } = await import("../lib/pdf");
    const logo = await imageToDataUrl(assets.logo);
    const doc = createOfferPdf({ form, offer, offerNo, logo });
    doc.save(`${offerNo}-FloWarm-Angebot.pdf`);
  };
  return (
    <div>
      <button onClick={download} className="flex min-h-[58px] w-full items-center justify-center gap-2 rounded-md bg-warm px-5 py-4 font-bold text-ink shadow-glow transition hover:-translate-y-0.5">
        <Download size={18} /> PDF-Angebot erstellen
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
