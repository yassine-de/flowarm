import { currency } from "../lib/pricing";

export default function PriceCalculator({ offer, hint }) {
  return (
    <div className="premium-border rounded-lg bg-black/45 p-5">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <p className="text-sm text-white/55">Vorläufiger Brutto-Festpreis</p>
          <p className="mt-1 text-3xl font-semibold text-white">{currency(offer.gross)}</p>
        </div>
        <span className="rounded-full bg-warm/15 px-3 py-1 text-xs font-bold text-warm">inkl. 19 % MwSt.</span>
      </div>
      <div className="mt-6 space-y-3">
        {offer.positions.map((item) => (
          <div key={item.label} className="flex justify-between gap-4 border-b border-white/8 pb-3 text-sm">
            <span className="text-white/70">{item.label}</span>
            <span className="font-semibold">{currency(item.qty * item.price)}</span>
          </div>
        ))}
      </div>
      <div className="mt-5 space-y-2 text-sm">
        <div className="flex justify-between text-white/65"><span>Netto</span><span>{currency(offer.net)}</span></div>
        <div className="flex justify-between text-white/65"><span>19 % MwSt.</span><span>{currency(offer.vat)}</span></div>
      </div>
      <p className="mt-5 rounded-md bg-white/7 p-3 text-xs leading-5 text-white/60">{hint}</p>
    </div>
  );
}
