const pages = {
  "/impressum": {
    title: "Impressum",
    intro: "Angaben gemaess § 5 DDG",
    sections: [
      {
        heading: "Anbieter",
        body: [
          "FloWarm GmbH",
          "Herrnstr. 8a",
          "63674 Altenstadt",
          "Deutschland"
        ]
      },
      {
        heading: "Kontakt",
        body: [
          "Telefon: 0151 58493054",
          "E-Mail: info@flowarm.de",
          "Website: www.flowarm.de"
        ]
      },
      {
        heading: "Inhaltlich verantwortlich",
        body: [
          "FloWarm GmbH",
          "Herrnstr. 8a",
          "63674 Altenstadt"
        ]
      }
    ]
  },
  "/datenschutz": {
    title: "Datenschutzerklaerung",
    intro: "Informationen zur Verarbeitung personenbezogener Daten",
    sections: [
      {
        heading: "1. Verantwortlicher",
        body: [
          "FloWarm GmbH",
          "Herrnstr. 8a, 63674 Altenstadt",
          "E-Mail: info@flowarm.de",
          "Telefon: 0151 58493054"
        ]
      },
      {
        heading: "2. Zwecke der Verarbeitung",
        body: [
          "Wir verarbeiten personenbezogene Daten, wenn Sie den Angebots-Konfigurator nutzen, ein Kundenkonto erstellen, sich anmelden, ein PDF-Angebot erzeugen, einen Termin anfragen oder einen Rueckruf wuenschen.",
          "Verarbeitet werden insbesondere Name, E-Mail-Adresse, Telefonnummer, Projektangaben, Flaeche, Ort/PLZ, gewuenschter Zeitraum, Angebotsdaten, Statusinformationen sowie technische Serverdaten."
        ]
      },
      {
        heading: "3. Rechtsgrundlagen",
        body: [
          "Die Verarbeitung zur Angebotserstellung und Kontaktaufnahme erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, soweit sie zur Durchfuehrung vorvertraglicher Massnahmen erforderlich ist.",
          "Sicherheits-, Nachweis- und Administrationsdaten verarbeiten wir auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.",
          "Analyse- oder Marketingdienste setzen wir nur ein, wenn Sie vorher eingewilligt haben. Rechtsgrundlage ist dann Art. 6 Abs. 1 lit. a DSGVO."
        ]
      },
      {
        heading: "4. Hosting, Datenbank und E-Mail",
        body: [
          "Die Website ist fuer den Betrieb mit Netlify und Supabase vorbereitet. Dabei koennen technische Zugriffsdaten, Formularinhalte, Kundenkonto- und Angebotsdaten bei diesen Dienstleistern verarbeitet werden.",
          "E-Mails zum Angebot, zu Terminen oder Rueckrufen koennen ueber einen E-Mail-Dienstleister versendet werden. Die konkreten Anbieter und Auftragsverarbeitungsvertraege muessen vor Livegang final dokumentiert werden."
        ]
      },
      {
        heading: "5. Speicherdauer",
        body: [
          "Anfragedaten speichern wir, solange dies fuer die Bearbeitung der Anfrage, Angebotserstellung, Vertragsdurchfuehrung und gesetzliche Aufbewahrungspflichten erforderlich ist.",
          "Kundenkonten koennen auf Wunsch geloescht werden, soweit keine gesetzlichen Aufbewahrungspflichten entgegenstehen."
        ]
      },
      {
        heading: "6. Cookies und lokale Speicherung",
        body: [
          "Wir nutzen technisch notwendige lokale Speicherung, um Cookie-Entscheidungen, Logins und grundlegende Websitefunktionen bereitzustellen.",
          "Nicht notwendige Analyse- oder Marketing-Technologien werden erst nach Ihrer Einwilligung aktiviert. Eine erteilte Einwilligung koennen Sie jederzeit mit Wirkung fuer die Zukunft widerrufen."
        ]
      },
      {
        heading: "7. Ihre Rechte",
        body: [
          "Sie haben nach Massgabe der DSGVO Rechte auf Auskunft, Berichtigung, Loeschung, Einschraenkung der Verarbeitung, Datenuebertragbarkeit und Widerspruch.",
          "Sie koennen sich ausserdem bei einer Datenschutzaufsichtsbehoerde beschweren."
        ]
      },
      {
        heading: "8. Pflicht zur Bereitstellung",
        body: [
          "Die im Angebots-Konfigurator abgefragten Kontaktdaten sind erforderlich, damit wir ein Angebot zuordnen und Sie zur technischen Pruefung kontaktieren koennen.",
          "Ohne diese Angaben koennen wir kein persoenliches Sofortangebot bearbeiten."
        ]
      }
    ]
  },
  "/agb": {
    title: "AGB",
    intro: "Allgemeine Geschaeftsbedingungen fuer Angebotsanfragen",
    sections: [
      {
        heading: "1. Geltungsbereich",
        body: [
          "Diese Bedingungen gelten fuer die Nutzung des FloWarm Angebots-Konfigurators, fuer Angebotsanfragen und fuer die spaetere Beauftragung von Leistungen der FloWarm GmbH, soweit nicht im individuell bestaetigten Angebot abweichende Vereinbarungen getroffen werden."
        ]
      },
      {
        heading: "2. Sofortangebot",
        body: [
          "Der Konfigurator erstellt einen vorlaeufigen Festpreis auf Grundlage der vom Kunden eingegebenen Daten.",
          "Das Sofortangebot steht immer unter dem Vorbehalt einer technischen Pruefung, insbesondere von Estrich, Flaeche, Aufbau, Zugaenglichkeit, Heizkreisplanung und Ausfuehrbarkeit vor Ort."
        ]
      },
      {
        heading: "3. Vertragsschluss",
        body: [
          "Durch Absenden des Konfigurators wird noch kein verbindlicher Auftrag erteilt.",
          "Ein Vertrag kommt erst zustande, wenn FloWarm ein final bestaetigtes Angebot oder eine Auftragsbestaetigung uebermittelt und der Kunde dieses annimmt."
        ]
      },
      {
        heading: "4. Leistungsumfang",
        body: [
          "Der konkrete Leistungsumfang ergibt sich aus dem finalen Angebot. Moegliche Positionen sind Anfahrt/Ruestzeug, Fraesen und Rohrlegung, Heizkreisverteiler, Verschliessen der Rohrkanaele und Ausgleichsmasse.",
          "Nicht enthalten sind Leistungen, die im Angebot nicht ausdruecklich genannt sind, insbesondere Bodenbelagsarbeiten, Malerarbeiten, Elektroarbeiten oder bauseitige Vorbereitungen."
        ]
      },
      {
        heading: "5. Preise und Zahlung",
        body: [
          "Alle Verbraucherpreise werden inklusive gesetzlicher Umsatzsteuer ausgewiesen, sofern nicht anders gekennzeichnet.",
          "Zahlungsbedingungen, Faelligkeit und Abschlaege richten sich nach dem finalen Angebot oder der Auftragsbestaetigung."
        ]
      },
      {
        heading: "6. Termine und Mitwirkung",
        body: [
          "Termine werden gesondert abgestimmt und bestaetigt.",
          "Der Kunde stellt sicher, dass die Flaechen zum vereinbarten Termin frei, erreichbar und fuer die Ausfuehrung vorbereitet sind."
        ]
      },
      {
        heading: "7. Gewaehrleistung und Haftung",
        body: [
          "Es gelten die gesetzlichen Gewaehrleistungsrechte.",
          "Fuer Schaeden haftet FloWarm nach den gesetzlichen Vorschriften. Bei einfacher Fahrlaessigkeit ist die Haftung ausser bei Verletzung von Leben, Koerper oder Gesundheit auf wesentliche Vertragspflichten beschraenkt."
        ]
      },
      {
        heading: "8. Schlussbestimmungen",
        body: [
          "Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der uebrigen Bestimmungen unberuehrt.",
          "Vor Livegang sollten diese AGB anwaltlich auf das konkrete Geschaeftsmodell, Verbraucherrecht und Handwerks-/Bauvertragsrecht geprueft werden."
        ]
      }
    ]
  },
  "/widerruf": {
    title: "Widerrufsbelehrung",
    intro: "Hinweis fuer Verbraucher",
    sections: [
      {
        heading: "Noch kein Vertrag durch Anfrage",
        body: [
          "Das Absenden des Sofortangebots ist eine unverbindliche Anfrage und noch keine verbindliche Beauftragung.",
          "Ein verbindlicher Vertrag kommt erst durch ein final bestaetigtes Angebot oder eine Auftragsbestaetigung und Ihre Annahme zustande."
        ]
      },
      {
        heading: "Widerrufsrecht bei Verbrauchervertraegen",
        body: [
          "Wenn ein Vertrag mit einem Verbraucher ausschliesslich ueber Fernkommunikationsmittel geschlossen wird, koennen gesetzliche Widerrufsrechte und Informationspflichten bestehen.",
          "Die konkrete Widerrufsbelehrung muss passend zum spaeteren Abschlussprozess erstellt werden. Vor Livegang eines verbindlichen Online-Abschlusses ist eine anwaltliche Pruefung erforderlich."
        ]
      }
    ]
  }
};

export default function LegalPage({ path }) {
  const page = pages[path] || pages["/impressum"];

  return (
    <main className="min-h-[70vh] bg-pearl px-4 py-32 text-ink sm:px-6">
      <article className="mx-auto max-w-4xl">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-warm">Rechtliches</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">{page.title}</h1>
        <p className="mt-5 text-lg leading-8 text-ink/62">{page.intro}</p>
        <div className="mt-10 space-y-5">
          {page.sections.map((section) => (
            <section key={section.heading} className="rounded-lg border border-ink/10 bg-white p-6 shadow-xl shadow-black/5">
              <h2 className="text-2xl font-semibold">{section.heading}</h2>
              <div className="mt-4 space-y-2">
                {section.body.map((line) => (
                  <p key={line} className="leading-7 text-ink/68">{line}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
        {path !== "/impressum" && (
          <p className="mt-8 rounded-lg border border-warm/20 bg-warm/10 p-4 text-sm leading-6 text-ink/65">
            Hinweis: Diese Texte sind ein professionelles Vorab-Template fuer den Livegang und ersetzen keine Rechtsberatung.
          </p>
        )}
      </article>
    </main>
  );
}
