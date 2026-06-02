import { jsPDF } from "jspdf";
import { currency } from "./pricing";

export function createOfferPdf({ form, offer, offerNo, logo }) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const today = new Date();
  const valid = new Date(today);
  valid.setDate(valid.getDate() + 14);

  doc.setFillColor(12, 12, 14);
  doc.rect(0, 0, 595, 115, "F");
  if (logo) {
    try {
      doc.addImage(logo, "PNG", 42, 32, 138, 42);
    } catch {
      doc.setTextColor(242, 138, 24);
      doc.setFontSize(22);
      doc.text("FloWarm GmbH", 42, 62);
    }
  }
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text("Sofortangebot", 395, 52);
  doc.setFontSize(10);
  doc.text(offerNo, 395, 72);

  doc.setTextColor(20, 20, 20);
  doc.setFontSize(11);
  doc.text(`Datum: ${today.toLocaleDateString("de-DE")}`, 42, 150);
  doc.text(`Gültig bis: ${valid.toLocaleDateString("de-DE")}`, 42, 168);
  doc.text(`Kunde: ${form.name || "-"}`, 42, 198);
  doc.text(`E-Mail: ${form.email || "-"}`, 42, 216);
  doc.text(`Telefon: ${form.phone || "-"}`, 42, 234);
  doc.text(`Projekt: ${form.propertyType || "-"} / ${form.projectType || "-"} / ${form.area || 0} m²`, 42, 264);
  doc.text(`Ort: ${form.zipCity || "-"}`, 42, 282);

  let y = 330;
  doc.setFontSize(12);
  doc.setTextColor(242, 138, 24);
  doc.text("Preispositionen", 42, y);
  y += 24;
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(10);
  offer.positions.forEach((item) => {
    doc.text(item.label, 42, y);
    doc.text(`${item.qty} ${item.unit}`, 310, y);
    doc.text(currency(item.qty * item.price), 465, y, { align: "right" });
    y += 22;
  });
  y += 18;
  doc.line(42, y, 465, y);
  y += 28;
  doc.text("Netto", 310, y);
  doc.text(currency(offer.net), 465, y, { align: "right" });
  y += 20;
  doc.text("19 % MwSt.", 310, y);
  doc.text(currency(offer.vat), 465, y, { align: "right" });
  y += 28;
  doc.setFontSize(15);
  doc.text("Brutto", 310, y);
  doc.text(currency(offer.gross), 465, y, { align: "right" });
  y += 42;
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.text("Vorläufiger Festpreis vorbehaltlich technischer Prüfung vor Ort.", 42, y);
  return doc;
}
