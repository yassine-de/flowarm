import { Flame } from "lucide-react";
import { assets } from "../data/content";

export default function Logo({ className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src={assets.logo}
        alt="FloWarm GmbH"
        className="h-10 w-auto"
        onError={(event) => {
          event.currentTarget.style.display = "none";
          event.currentTarget.nextElementSibling.style.display = "flex";
        }}
      />
      <span className="hidden items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-warm text-ink shadow-glow">
          <Flame size={21} />
        </span>
        <span className="leading-tight">
          <span className="block text-lg font-semibold tracking-wide text-white">FloWarm</span>
          <span className="block text-[10px] font-bold uppercase tracking-[0.35em] text-warm">GmbH</span>
        </span>
      </span>
    </div>
  );
}
