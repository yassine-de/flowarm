export const assets = {
  logo: "/assets/flowarm/logo-flowarm-orange.png",
  scenes: [
    "/assets/flowarm/scene-01-empty-room.webp",
    "/assets/flowarm/scene-02-milling-machine.webp",
    "/assets/flowarm/scene-03-milled-grooves.webp",
    "/assets/flowarm/scene-04-pipe-installation.webp",
    "/assets/flowarm/scene-05-pipes-finished.webp",
    "/assets/flowarm/scene-06-heat-visualization.webp",
    "/assets/flowarm/scene-07-final-room.webp"
  ]
};

export const translations = {
  de: {
    nav: { offer: "Angebot berechnen", customer: "Kundenkonto", admin: "Admin", cities: "Regionen" },
    heroBadge: "Sofortangebot. Premium-Ausführung. Deutschlandweit.",
    story: [
      ["Fußbodenheizung schlüsselfertig in 3 Tagen", "Präzises FBH-Fräsen. Saubere Verlegung. Transparente Festpreise."],
      ["Millimetergenaue Frästechnik", "Wir fräsen die Heizkanäle sauber und effizient direkt in den bestehenden Estrich."],
      ["Perfekte Vorbereitung", "Tiefe, saubere Fräsbahnen für eine präzise Rohrverlegung."],
      ["Rohrverlegung durch Fachpersonal", "Die Heizrohre werden passgenau und bündig in die Fräsbahnen eingelegt."],
      ["Systematisch verlegt", "Mehrere Heizkreise sorgen für gleichmäßige Wärmeverteilung."],
      ["Wärme, die man spürt", "Effiziente Fußbodenheizung für mehr Komfort und geringere Energiekosten."],
      ["Jetzt Angebot in 2min berechnen", "Ihr vorläufiger Festpreis mit PDF-Angebot und Terminoption."]
    ],
    funnelTitle: "Sofortangebot konfigurieren",
    legalHint: "Vorläufiger Festpreis vorbehaltlich technischer Prüfung."
  },
  en: {
    nav: { offer: "Calculate offer", customer: "Customer area", admin: "Admin", cities: "Cities" },
    heroBadge: "Instant quote. Premium execution. Planned in Germany.",
    story: [
      ["Turnkey underfloor heating in 3 days", "Precise milling. Clean installation. Transparent fixed pricing."],
      ["Millimetre-accurate milling", "We cut heating channels directly into the existing screed."],
      ["Perfect preparation", "Clean channels for precise pipe installation."],
      ["Installed by specialists", "Heating pipes are laid flush and accurately."],
      ["Systematic circuits", "Multiple heating circuits ensure even heat distribution."],
      ["Warmth you can feel", "Efficient comfort with lower energy demand."],
      ["Calculate your quote in 2 minutes", "Preliminary fixed price with PDF and booking options."]
    ],
    funnelTitle: "Configure instant quote",
    legalHint: "Preliminary fixed price subject to technical inspection."
  },
  tr: {
    nav: { offer: "Teklif hesapla", customer: "Müşteri hesabı", admin: "Admin", cities: "Bölgeler" },
    heroBadge: "Anında teklif. Premium uygulama. Almanya'da planlama.",
    story: [
      ["3 günde anahtar teslim yerden ısıtma", "Hassas frezeleme. Temiz montaj. Şeffaf sabit fiyat."],
      ["Milimetrik freze teknolojisi", "Isıtma kanallarını mevcut şap içine temizce açıyoruz."],
      ["Mükemmel hazırlık", "Hassas boru döşemesi için temiz kanallar."],
      ["Uzman ekip montajı", "Borular kanallara tam ve düz şekilde yerleştirilir."],
      ["Sistemli döşeme", "Birden fazla devre dengeli ısı dağılımı sağlar."],
      ["Hissedilen sıcaklık", "Daha fazla konfor ve düşük enerji maliyeti."],
      ["Teklifini 2 dakikada hesapla", "PDF ve randevu seçeneğiyle ön sabit fiyat."]
    ],
    funnelTitle: "Anında teklif yapılandır",
    legalHint: "Teknik kontrol şartıyla geçerli ön sabit fiyat."
  }
};

export const cityPages = {
  "/fussbodenheizung-frankfurt": {
    city: "Frankfurt",
    title: "Fußbodenheizung fräsen in Frankfurt",
    text: "FloWarm realisiert nachträgliche Fußbodenheizung in Frankfurter Wohnungen, Häusern und Gewerbeflächen mit sauberer Frästechnik, planbaren Terminen und transparentem Sofortangebot."
  },
  "/fussbodenheizung-friedberg": {
    city: "Friedberg",
    title: "Fußbodenheizung nachrüsten in Friedberg",
    text: "Für Friedberg und Umgebung planen wir FBH-Fräsen, Rohrverlegung und Verteilertechnik als eingespielten Ablauf mit regionaler Nähe und schneller Angebotserstellung."
  },
  "/fussbodenheizung-wetterau": {
    city: "Wetterau",
    title: "Fußbodenheizung für die Wetterau",
    text: "In der Wetterau verbindet FloWarm präzise Estrichfräsen mit einer effizienten Installation für Sanierungen und Modernisierungen im Bestand."
  },
  "/fussbodenheizung-giessen": {
    city: "Gießen",
    title: "Fußbodenheizung fräsen in Gießen",
    text: "Von der Wohnungsmodernisierung bis zum Einfamilienhaus: FloWarm liefert in Gießen eine klare Kalkulation, saubere Baustellenführung und schnelle Umsetzung."
  }
};

export const defaultPrices = {
  setup: 690,
  milling: 72,
  manifold: 540,
  closing: 18,
  leveling: 26
};

export const demoRequests = [
  { id: "AG-2026-1872", name: "Mara Schneider", email: "mara@example.de", city: "Frankfurt", area: 118, status: "Angebot gesendet", gross: 16386.78 },
  { id: "AG-2026-1873", name: "Emre Yilmaz", email: "emre@example.de", city: "Friedberg", area: 84, status: "Termin gebucht", gross: 12172.51 },
  { id: "AG-2026-1874", name: "Julia Hahn", email: "julia@example.de", city: "Gießen", area: 156, status: "Neu", gross: 21044.44 }
];
