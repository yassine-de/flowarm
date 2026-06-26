export default function Logo({ className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-label="FloWarm GmbH">
      <span className="relative grid h-12 w-12 place-items-center rounded-md border border-warm/35 bg-black shadow-glow">
        <span className="absolute inset-1 rounded-md bg-gradient-to-br from-warm/22 via-transparent to-white/5" />
        <svg viewBox="0 0 44 44" className="relative h-8 w-8" role="img" aria-hidden="true">
          <path d="M12 13h17.5c3.4 0 3.4 5.4 0 5.4H14.5c-3.4 0-3.4 5.4 0 5.4h15c3.4 0 3.4 5.4 0 5.4H12" fill="none" stroke="#f59b16" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M32 18.4H14.5M12 23.8h17.5" fill="none" stroke="#ffd28a" strokeWidth="1.2" strokeLinecap="round" opacity=".9" />
        </svg>
      </span>
      <span className="leading-none">
        <span className="block text-[22px] font-semibold tracking-wide text-white">FloWarm</span>
        <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.38em] text-warm">GmbH</span>
      </span>
    </div>
  );
}
