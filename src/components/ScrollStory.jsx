import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { assets } from "../data/content";
import SceneSection from "./SceneSection";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollStory({ t, go }) {
  const wrap = useRef(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(max-width: 767px), (prefers-reduced-motion: reduce)").matches;
    if (reduce || !wrap.current) return;
    const trigger = ScrollTrigger.create({
      trigger: wrap.current,
      start: "top top",
      end: `+=${t.story.length * 360}`,
      pin: true,
      scrub: 0.35,
      onUpdate: (self) => setActive(Math.min(t.story.length - 1, Math.floor(self.progress * t.story.length)))
    });
    return () => trigger.kill();
  }, [t.story.length]);

  return (
    <section ref={wrap} className="relative h-screen min-h-[680px] overflow-hidden">
      {t.story.map((scene, index) => (
        <SceneSection key={scene[0]} scene={scene} image={assets.scenes[index]} active={active === index} />
      ))}
      <div className="absolute inset-x-0 top-24 z-10 mx-auto flex max-w-7xl justify-between px-4 sm:px-6">
        <div className="flex max-w-[calc(100vw-2rem)] flex-wrap items-center gap-2 rounded-md border border-warm/35 bg-[#fff8ed] px-4 py-3 text-ink shadow-2xl shadow-black/45">
          <span className="h-3 w-3 shrink-0 rounded-full bg-warm shadow-[0_0_22px_rgba(242,138,24,.95)]" />
          {t.heroBadge.split(".").filter(Boolean).map((item, index) => (
            <span key={item.trim()} className="flex items-center gap-2 rounded-sm bg-white px-2 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-ink shadow-sm sm:text-xs">
              {index > 0 && <span className="hidden h-1.5 w-1.5 rounded-full bg-warm sm:block" />}
              {item.trim()}
            </span>
          ))}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 z-10">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-14 sm:px-6 md:grid-cols-[1.1fr_.9fr] md:items-end">
          <motion.div key={active} initial={{ y: 26, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.55 }}>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-warm">FloWarm System</p>
            <h1 className="max-w-4xl text-balance text-4xl font-semibold leading-[1.02] sm:text-6xl lg:text-7xl">
              {t.story[active][0]}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/74 sm:text-xl">{t.story[active][1]}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => go("#angebot")} className="rounded-full bg-warm px-6 py-4 font-bold text-ink shadow-glow">
                Kostenloses Angebot starten
              </button>
              <button onClick={() => go("#prozess")} className="rounded-full border border-white/25 px-6 py-4 font-semibold text-white/85">
                Prozess ansehen
              </button>
            </div>
          </motion.div>
          <div className="glass hidden rounded-lg p-5 md:block">
            <div className="mb-3 flex items-center justify-between text-sm text-white/60">
              <span>Ihr Weg zur warmen Fläche</span>
              <span>{active + 1}/7</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/12">
              <div className="h-full rounded-full bg-warm transition-all" style={{ width: `${((active + 1) / 7) * 100}%` }} />
            </div>
          </div>
        </div>
        <ChevronDown className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 animate-bounce text-white/40 md:block" />
      </div>
    </section>
  );
}
