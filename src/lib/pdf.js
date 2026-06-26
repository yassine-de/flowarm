import { jsPDF } from "jspdf";
import { currency } from "./pricing.js";

const ink = [11, 11, 13];
const graphite = [28, 28, 28];
const warm = [242, 138, 24];
const gold = [215, 162, 74];
const soft = [247, 244, 239];

export function createOfferPdf({ form, offer, offerNo }) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const today = new Date();
  const valid = new Date(today);
  valid.setDate(valid.getDate() + 14);

  drawHeader(doc, offerNo);
  drawAddressBlock(doc, form, today, valid);
  drawProjectSummary(doc, form, offer);
  drawPositionsPageOne(doc, offer);
  drawPageNumber(doc, 1, 2);
  doc.addPage();
  drawPositionsAndTermsPageTwo(doc, offer);
  drawPageNumber(doc, 2, 2);

  return doc;
}

function drawHeader(doc, offerNo) {
  doc.setFillColor(...ink);
  doc.rect(0, 0, 595, 128, "F");
  doc.setFillColor(...warm);
  doc.rect(0, 124, 595, 4, "F");

  drawFlowarmLogo(doc, 52, 38);

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(27);
  doc.text("Sofortangebot", 405, 52);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(220, 220, 220);
  doc.text(offerNo, 405, 74);
  doc.setTextColor(...gold);
  doc.setFontSize(9);
  doc.text("FloWarm GmbH", 405, 94);
}

function drawFlowarmLogo(doc, x, y) {
  doc.setDrawColor(...warm);
  doc.setLineWidth(3.2);
  doc.setLineCap("round");
  doc.roundedRect(x, y + 2, 40, 40, 6, 6, "S");
  doc.line(x + 10, y + 13, x + 29, y + 13);
  doc.line(x + 29, y + 13, x + 15, y + 22);
  doc.line(x + 15, y + 22, x + 30, y + 22);
  doc.line(x + 30, y + 22, x + 12, y + 31);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("FloWarm", x + 54, y + 22);
  doc.setFontSize(9);
  doc.setCharSpace(3.2);
  doc.setTextColor(...warm);
  doc.text("GMBH", x + 57, y + 37);
  doc.setCharSpace(0);
}

function drawAddressBlock(doc, form, today, valid) {
  const left = 52;
  const top = 162;
  doc.setTextColor(...graphite);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("KUNDENDATEN", left, top);
  doc.text("ANGEBOTSDATEN", 360, top);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  drawLabelValue(doc, "Kunde", form.name || "-", left, top + 28);
  drawLabelValue(doc, "E-Mail", form.email || "-", left, top + 48);
  drawLabelValue(doc, "Telefon", form.phone || "-", left, top + 68);
  drawLabelValue(doc, "Ort / PLZ", form.zipCity || "-", left, top + 88);

  drawLabelValue(doc, "Datum", today.toLocaleDateString("de-DE"), 360, top + 28);
  drawLabelValue(doc, "Gültig bis", valid.toLocaleDateString("de-DE"), 360, top + 48);
  drawLabelValue(doc, "Status", "vorläufiger Festpreis", 360, top + 68);
  drawLabelValue(doc, "Prüfung", "technisch vorbehalten", 360, top + 88);
}

function drawProjectSummary(doc, form, offer) {
  const x = 52;
  const y = 292;
  doc.setFillColor(...soft);
  doc.roundedRect(x, y, 491, 82, 8, 8, "F");
  doc.setDrawColor(230, 222, 212);
  doc.roundedRect(x, y, 491, 82, 8, 8, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...ink);
  doc.text("Projektübersicht", x + 18, y + 25);

  const items = [
    ["Immobilie", form.propertyType || "-", x + 18, y + 49, 72],
    ["Projektart", form.projectType || "-", x + 173, y + 49, 74],
    ["Fläche", `${form.area || 0} m²`, x + 328, y + 49, 72],
    ["Stockwerke", form.floors || "-", x + 18, y + 69, 72],
    ["Heizkreisverteiler", `${offer.manifolds || "-"} Stück`, x + 173, y + 69, 110]
  ];
  items.forEach(([label, value, col, row, offset]) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(105, 105, 105);
    doc.text(label, col, row);
    doc.setTextColor(...ink);
    doc.setFont("helvetica", "bold");
    doc.text(String(value), col + offset, row);
    doc.setFont("helvetica", "normal");
  });
}

function drawPositionsPageOne(doc, offer) {
  const x = 52;
  let y = 406;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...warm);
  doc.text("Preispositionen", x, y);
  y = drawOfferTable(doc, offer.positions.slice(0, 3), y + 20, 1, false);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(105, 105, 105);
  doc.text("Fortsetzung der Preispositionen und Summen auf Seite 2.", 52, y + 30);
}

function drawPositionsAndTermsPageTwo(doc, offer) {
  let y = 58;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...warm);
  doc.text("Preispositionen Fortsetzung", 52, y);
  y = drawOfferTable(doc, offer.positions.slice(3), y + 20, 4, true, offer);

  y += 28;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...ink);
  doc.text("Zahlungs- und Ausführungshinweise", 52, y);
  y += 28;

  const paragraphs = [
    "Der Rechnungsbetrag ist sofort fällig und muss innerhalb von 7 Tagen nach Rechnungsstellung bezahlt werden.",
    "Diesem Angebot liegt die VOB, neueste Fassung, zugrunde. Die Abrechnung erfolgt, sofern es sich nicht um ein Pauschalangebot handelt, nach dem örtlichen Aufmaß.",
    "Maßänderungen können aufgrund der Gegebenheiten vor Ort eintreten.",
    "Der ausgewiesene Preis ist ein vorläufiger Festpreis vorbehaltlich technischer Prüfung vor Ort. Estrichstärke, Untergrund, Verteilerposition, Heizkreisplanung und Anschlussbedingungen werden im Rahmen der technischen Prüfung final bewertet.",
    "Ist dieses Angebot für Sie von Interesse? Dann freuen wir uns auf die Auftragserteilung."
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(...graphite);
  paragraphs.forEach((text) => {
    const lines = doc.splitTextToSize(text, 470);
    doc.text(lines, 52, y, { lineHeightFactor: 1.35 });
    y += lines.length * 14 + 10;
  });

  drawCompanyFooter(doc);
}

function drawOfferTable(doc, items, y, startNumber, includeTotals = false, offer = null) {
  const x = 52;
  const widths = [34, 244, 52, 45, 54, 62];
  const tableWidth = widths.reduce((sum, width) => sum + width, 0);
  const descX = x + widths[0] + 8;
  const qtyX = x + widths[0] + widths[1] + widths[2] - 8;
  const unitX = x + widths[0] + widths[1] + widths[2] + widths[3] - 8;
  const priceX = x + widths[0] + widths[1] + widths[2] + widths[3] + widths[4] - 8;
  const totalX = x + tableWidth - 8;
  const descriptions = {
    "Anfahrt/Rüstzeug": [
      "Enthalten sind:",
      "- Baustelleneinrichtung und Maschinenbereitstellung",
      "- Schutzmaßnahmen für den Arbeitsbereich",
      "- Anfahrt und Rüstzeit"
    ],
    "Fräsen & Rohrlegung": [
      "Enthalten sind:",
      "- millimetergenaue Fräsarbeiten im bestehenden Estrich",
      "- Einlegen der Heizrohre in die vorbereiteten Kanäle",
      "- Vorbereitung der Heizkreise für die weitere Anbindung"
    ],
    "Heizkreisverteiler": [
      "Enthalten sind:",
      "- Verteilertechnik je geplanter Ebene",
      "- Zuordnung der Heizkreise",
      "- Montagevorbereitung für den späteren Anschluss"
    ],
    "Verschließen der Rohrkanäle": [
      "Enthalten sind:",
      "- fachgerechtes Verschließen der gefrästen Kanäle",
      "- Vorbereitung für den weiteren Bodenaufbau",
      "- Verarbeitung nach Rohrverlegung"
    ],
    "Ausgleichsmasse": [
      "Inbegriffen sind:",
      "- Randdämmstreifen",
      "- Nivelliermasse bis zu einer Stärke von 3 mm",
      "- Grundierung als Vorabmaßnahme",
      "",
      "Verlegefähiger Boden wird hergestellt."
    ]
  };

  doc.setDrawColor(25, 25, 25);
  doc.setLineWidth(0.6);
  doc.rect(x, y, tableWidth, 26, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...ink);
  drawCellText(doc, "Pos.", x + 6, y + 17);
  drawCellText(doc, "Beschreibung", descX, y + 17);
  drawCellText(doc, "Menge", qtyX, y + 17, "right");
  drawCellText(doc, "Einheit", unitX, y + 17, "right");
  drawCellText(doc, "EP", priceX, y + 17, "right");
  drawCellText(doc, "Gesamt", totalX, y + 17, "right");
  drawVerticalLines(doc, x, y, widths, 26);
  y += 26;

  items.forEach((item, index) => {
    const desc = descriptions[item.label] || ["Leistungsposition gemäß Angebot."];
    const rowHeight = Math.max(82, 25 + desc.length * 12);
    doc.rect(x, y, tableWidth, rowHeight, "S");
    drawVerticalLines(doc, x, y, widths, rowHeight);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...ink);
    doc.text(String(startNumber + index), x + 17, y + 18, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text(item.label, descX, y + 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.7);
    doc.setTextColor(...graphite);
    desc.forEach((line, lineIndex) => {
      if (line) doc.text(line, descX, y + 34 + lineIndex * 12);
    });

    doc.setFontSize(9);
    doc.setTextColor(...ink);
    doc.text(String(item.qty), qtyX, y + 20, { align: "right" });
    doc.text(item.unit, unitX, y + 20, { align: "right" });
    doc.text(currency(item.price).replace("€", "").trim(), priceX, y + 20, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.text(currency(item.qty * item.price).replace("€", "").trim(), totalX, y + 20, { align: "right" });
    y += rowHeight;
  });

  if (includeTotals && offer) {
    const labelX = x + 8;
    const amountX = totalX;
    const rows = [
      ["Zwischensumme (netto)", currency(offer.net)],
      ["Umsatzsteuer 19 %", currency(offer.vat)],
      ["Gesamtbetrag", currency(offer.gross), true]
    ];
    rows.forEach(([label, value, bold]) => {
      const rowHeight = 24;
      doc.rect(x, y, tableWidth, rowHeight, "S");
      doc.line(x + tableWidth - 86, y, x + tableWidth - 86, y + rowHeight);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(...ink);
      doc.text(label, labelX, y + 16);
      doc.text(value.replace("€", "").trim(), amountX, y + 16, { align: "right" });
      y += rowHeight;
    });
  }

  return y;
}

function drawCellText(doc, text, x, y, align = "left") {
  doc.text(text, x, y, { align });
}

function drawVerticalLines(doc, x, y, widths, height) {
  let current = x;
  widths.slice(0, -1).forEach((width) => {
    current += width;
    doc.line(current, y, current, y + height);
  });
}

function drawCompanyFooter(doc) {
  const y = 720;
  doc.setFillColor(...soft);
  doc.roundedRect(52, y, 491, 78, 8, 8, "F");
  doc.setDrawColor(230, 222, 212);
  doc.roundedRect(52, y, 491, 78, 8, 8, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...ink);
  doc.text("FloWarm GmbH", 70, y + 22);
  doc.text("Bankverbindung", 245, y + 22);
  doc.text("Kontakt", 405, y + 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...graphite);
  doc.text("Herrnstr. 8a", 70, y + 39);
  doc.text("63674 Altenstadt", 70, y + 52);

  doc.text("Commerzbank", 245, y + 39);
  doc.text("IBAN: DE82 5004 0000 0800 9268 00", 245, y + 52);
  doc.text("BIC: COBADEFXXX", 245, y + 65);

  doc.text("info@flowarm.de", 405, y + 39);
  doc.text("0151 58493054", 405, y + 52);
  doc.text("www.flowarm.de", 405, y + 65);
}

function drawPageNumber(doc, page, total) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(125, 125, 125);
  doc.text(`Seite ${page}/${total}`, 297.5, 824, { align: "center" });
}

function drawLabelValue(doc, label, value, x, y) {
  doc.setFont("helvetica", "normal");
  doc.setTextColor(95, 95, 95);
  doc.text(`${label}:`, x, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...ink);
  doc.text(String(value), x + 70, y);
}
