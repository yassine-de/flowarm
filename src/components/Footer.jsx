import Logo from "./Logo";

export default function Footer({ go }) {
  return (
    <footer className="border-t border-white/10 bg-black px-4 py-12">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.3fr_.7fr_.7fr]">
        <div>
          <Logo />
          <p className="mt-5 max-w-md text-sm leading-6 text-white/58">
            FloWarm GmbH steht für präzises FBH-Fräsen, saubere Installation und ein Sofortangebot, das Kunden sofort verstehen.
          </p>
        </div>
        <div className="space-y-3 text-sm text-white/70">
          <button onClick={() => go("/impressum")}>Impressum</button><br />
          <button onClick={() => go("/datenschutz")}>Datenschutz</button><br />
          <button onClick={() => go("/agb")}>AGB</button><br />
          <button onClick={() => go("/widerruf")}>Widerruf</button>
        </div>
        <div className="space-y-3 text-sm text-white/70">
          <button onClick={() => go("/fussbodenheizung-frankfurt")}>Frankfurt</button><br />
          <button onClick={() => go("/fussbodenheizung-friedberg")}>Friedberg</button><br />
          <button onClick={() => go("/fussbodenheizung-wetterau")}>Wetterau</button><br />
          <button onClick={() => go("/fussbodenheizung-giessen")}>Gießen</button>
        </div>
      </div>
    </footer>
  );
}
