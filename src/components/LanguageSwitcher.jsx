export default function LanguageSwitcher({ lang, setLang }) {
  return (
    <div className="flex rounded-full border border-white/15 bg-white/5 p-1">
      {["de", "tr", "en"].map((item) => (
        <button
          key={item}
          onClick={() => setLang(item)}
          className={`h-8 rounded-full px-3 text-xs font-semibold uppercase transition ${lang === item ? "bg-warm text-ink" : "text-white/70 hover:text-white"}`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
