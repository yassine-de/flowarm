const measurementId = "G-LG9NBTWWHP";

export function grantGoogleConsent() {
  if (!window.gtag) return;
  window.gtag("consent", "update", {
    ad_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "granted",
    analytics_storage: "granted"
  });
}

export function trackPageView(path) {
  if (!window.gtag || localStorage.getItem("flowarm-cookie-choice") !== "accepted") return;
  window.gtag("event", "page_view", {
    page_title: document.title,
    page_location: window.location.href,
    page_path: path
  });
}

export function trackOfferConversion() {
  if (!window.gtag || localStorage.getItem("flowarm-cookie-choice") !== "accepted") return;
  window.gtag("event", "generate_lead", {
    send_to: measurementId,
    event_category: "lead",
    event_label: "Sofortangebot"
  });
}
