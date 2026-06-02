export function calculateOffer(form, prices) {
  const area = Number(form.area || 0);
  const floors = form.floors === "3+" ? 3 : Number(form.floors || 1);
  const manifolds = Math.max(1, Math.ceil(area / 95), floors);
  const positions = [
    { label: "Anfahrt/Rüstzeug", unit: "Pauschale", qty: 1, price: prices.setup },
    { label: "Fräsen & Rohrlegung", unit: "m²", qty: area, price: prices.milling },
    { label: "Heizkreisverteiler", unit: "Stück", qty: manifolds, price: prices.manifold },
    { label: "Verschließen der Rohrkanäle", unit: "m²", qty: area, price: prices.closing },
    { label: "Ausgleichsmasse", unit: "m²", qty: area, price: prices.leveling }
  ];
  const net = positions.reduce((sum, item) => sum + item.qty * item.price, 0);
  const vat = net * 0.19;
  const gross = net + vat;
  return { positions, net, vat, gross, manifolds };
}

export function currency(value) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value || 0);
}
