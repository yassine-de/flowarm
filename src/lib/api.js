const apiBase = import.meta.env.VITE_API_BASE_URL || "";

export async function submitOfferLead(payload) {
  const response = await fetch(`${apiBase}/api/offers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error("offer_submit_failed");
  return response.json();
}

export async function savePartialOfferLead(payload) {
  const response = await fetch(`${apiBase}/api/offers/partial`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error("partial_offer_submit_failed");
  return response.json();
}

export async function getPriceSettings() {
  const response = await fetch(`${apiBase}/api/prices`);
  if (!response.ok) throw new Error("prices_load_failed");
  return response.json();
}

export async function trackVisit(payload) {
  const response = await fetch(`${apiBase}/api/analytics/visit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error("visit_track_failed");
  return response.json();
}

export async function loginUser(credentials) {
  const response = await fetch(`${apiBase}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials)
  });
  if (!response.ok) throw new Error("login_failed");
  return response.json();
}

export async function registerCustomer(data) {
  const response = await fetch(`${apiBase}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error("register_failed");
  return response.json();
}

export async function getCurrentUser(token) {
  const response = await fetch(`${apiBase}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error("session_failed");
  return response.json();
}

export async function listAdminOffers(token) {
  const response = await fetch(`${apiBase}/api/admin/offers`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error("admin_offers_failed");
  return response.json();
}

export async function updateAdminPrices(token, prices) {
  const response = await fetch(`${apiBase}/api/admin/prices`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(prices)
  });
  if (!response.ok) throw new Error("admin_prices_update_failed");
  return response.json();
}

export async function getAdminAnalytics(token) {
  const response = await fetch(`${apiBase}/api/admin/analytics`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error("admin_analytics_failed");
  return response.json();
}
