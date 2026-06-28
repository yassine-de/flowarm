import "dotenv/config";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import pg from "pg";
import { randomUUID } from "node:crypto";
import { createOfferPdf } from "../src/lib/pdf.js";

const app = express();
const port = process.env.PORT || 8787;
const isProduction = process.env.NODE_ENV === "production";
const jwtSecret = process.env.JWT_SECRET;
const databaseUrl = process.env.DATABASE_URL;
const databaseNeedsSsl = databaseUrl && !/localhost|127\.0\.0\.1/i.test(databaseUrl);
const pool = databaseUrl ? new pg.Pool({ connectionString: databaseUrl, ssl: databaseNeedsSsl ? { rejectUnauthorized: false } : false }) : null;
const defaultPriceSettings = { setup: 270, milling: 27, manifold: 600, closing: 9, leveling: 24 };
const memory = { users: [], offers: [], visitorEvents: [], priceSettings: { ...defaultPriceSettings, updatedAt: new Date().toISOString() } };
const offerStatuses = ["Unvollständig", "Neu", "Angebot gesendet", "Termin gebucht", "Bestätigt", "In Bearbeitung", "Abgeschlossen"];
let adminBootstrapPromise;

if (isProduction && !jwtSecret) {
  throw new Error("JWT_SECRET is required in production");
}

app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json({ limit: "2mb" }));
app.use(async (_req, res, next) => {
  try {
    await ensureBootstrapAdmin();
    next();
  } catch (error) {
    console.error("Admin bootstrap failed:", error.message);
    res.status(500).json({ error: "bootstrap_failed" });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "flowarm-api", database: Boolean(pool) });
});

app.get("/api/prices", async (_req, res) => {
  res.json(await getPriceSettings());
});

app.post("/api/analytics/visit", async (req, res) => {
  await saveVisitorEvent({
    ip: getClientIp(req),
    path: String(req.body?.path || "/").slice(0, 500),
    referrer: String(req.body?.referrer || "").slice(0, 1000),
    userAgent: String(req.headers["user-agent"] || "").slice(0, 1000)
  });
  res.json({ ok: true });
});

app.post("/api/auth/register", async (req, res) => {
  const { email, password, name, phone } = req.body;
  if (!validEmail(email) || !validPassword(password) || !name) return res.status(400).json({ error: "invalid_payload" });
  const exists = await findUserByEmail(email);
  if (exists) return res.status(409).json({ error: "duplicate_email" });
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await createUser({ email, passwordHash, name, phone, role: "customer" });
  res.json(createSession(user));
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await findUserByEmail(email);
  if (!user || !(await bcrypt.compare(password || "", user.password_hash))) return res.status(401).json({ error: "invalid_credentials" });
  res.json(createSession(user));
});

app.get("/api/auth/me", requireAuth, async (req, res) => {
  const user = await findUserByEmail(req.user.email);
  if (!user) return res.status(404).json({ error: "not_found" });
  res.json({ user: { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role } });
});

app.post("/api/offers", async (req, res) => {
  const { form, offer, source } = req.body;
  if (!form || !offer || !validEmail(form.email) || !form.name || !form.phone) return res.status(400).json({ error: "invalid_payload" });
  const saved = await saveCompletedOffer({
    offerNo: await nextOfferNo(),
    project: { ...form, password: undefined, source },
    prices: offer.positions,
    totals: { net: offer.net, vat: offer.vat, gross: offer.gross }
  });
  await queueOfferNotifications({ offerNo: saved.offerNo, form, offer });
  res.json(saved);
});

app.post("/api/offers/partial", async (req, res) => {
  const { form, offer, source, lastStep } = req.body;
  if (!form || !hasUsableContact(form)) return res.status(400).json({ error: "invalid_payload" });
  const saved = await savePartialOffer({
    offerNo: await nextOfferNo(),
    project: { ...form, password: undefined, source, lastStep, partial: true },
    prices: offer?.positions || [],
    totals: { net: Number(offer?.net || 0), vat: Number(offer?.vat || 0), gross: Number(offer?.gross || 0) }
  });
  res.json(saved);
});

app.get("/api/admin/offers", requireAuth, requireRole("admin", "staff"), async (_req, res) => {
  res.json(await listOffers());
});

app.get("/api/admin/analytics", requireAuth, requireRole("admin", "staff"), async (_req, res) => {
  res.json(await getAnalytics());
});

app.get("/api/admin/prices", requireAuth, requireRole("admin", "staff"), async (_req, res) => {
  res.json(await getPriceSettings());
});

app.put("/api/admin/prices", requireAuth, requireRole("admin", "staff"), async (req, res) => {
  const prices = sanitizePriceSettings(req.body);
  if (!prices) return res.status(400).json({ error: "invalid_payload" });
  res.json(await updatePriceSettings(prices));
});

app.patch("/api/admin/offers/:id/status", requireAuth, requireRole("admin", "staff"), async (req, res) => {
  const status = String(req.body.status || "");
  if (!offerStatuses.includes(status)) {
    return res.status(400).json({ error: "invalid_status" });
  }
  res.json(await updateOfferStatus(req.params.id, status));
});

function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "missing_token" });
  try {
    req.user = jwt.verify(token, jwtSecret || "flowarm-local-secret");
    next();
  } catch {
    res.status(401).json({ error: "invalid_token" });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) return res.status(403).json({ error: "forbidden" });
    next();
  };
}

function createSession(user) {
  const safeUser = { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role };
  const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, jwtSecret || "flowarm-local-secret", { expiresIn: "7d" });
  return { token, user: safeUser };
}

async function findUserByEmail(email) {
  if (pool) {
    const result = await pool.query("select * from users where lower(email) = lower($1) limit 1", [email]);
    return result.rows[0];
  }
  return memory.users.find((user) => user.email.toLowerCase() === String(email).toLowerCase());
}

async function createUser({ email, passwordHash, name, phone, role }) {
  if (pool) {
    const result = await pool.query(
      "insert into users (email, password_hash, name, phone, role) values ($1, $2, $3, $4, $5) returning *",
      [email, passwordHash, name, phone || null, role]
    );
    return result.rows[0];
  }
  const user = { id: randomUUID(), email, password_hash: passwordHash, name, phone, role };
  memory.users.push(user);
  return user;
}

async function nextOfferNo() {
  const year = new Date().getFullYear();
  if (pool) {
    const result = await pool.query("select count(*)::int as count from offers where offer_no like $1", [`AG-${year}-%`]);
    return `AG-${year}-${String(1801 + result.rows[0].count).padStart(4, "0")}`;
  }
  return `AG-${year}-${String(1801 + memory.offers.length).padStart(4, "0")}`;
}

async function saveOffer({ offerNo, status, project, prices, totals }) {
  if (pool) {
    const result = await pool.query(
      "insert into offers (offer_no, status, project, prices, totals) values ($1, $2, $3, $4, $5) returning id, offer_no as \"offerNo\", status, project, totals, created_at as \"createdAt\"",
      [offerNo, status, toJson(project), toJson(prices), toJson(totals)]
    );
    return result.rows[0];
  }
  const offer = { id: randomUUID(), offerNo, status, project, prices, totals, createdAt: new Date().toISOString() };
  memory.offers.push(offer);
  return offer;
}

async function saveCompletedOffer({ offerNo, project, prices, totals }) {
  const email = String(project.email || "").toLowerCase();
  const phone = String(project.phone || "");
  if (pool) {
    const existing = await pool.query(
      `select id from offers
       where status = 'Unvollständig'
       and (($1 <> '' and lower(project->>'email') = $1) or ($2 <> '' and project->>'phone' = $2))
       order by created_at desc
       limit 1`,
      [email, phone]
    );
    if (existing.rows[0]) {
      const result = await pool.query(
        `update offers
         set status = 'Neu', project = $2, prices = $3, totals = $4
         where id = $1
         returning id, offer_no as "offerNo", status, project, totals, created_at as "createdAt"`,
        [existing.rows[0].id, toJson(project), toJson(prices), toJson(totals)]
      );
      return result.rows[0];
    }
  } else {
    const existing = memory.offers.find((item) => (
      item.status === "Unvollständig" &&
      ((email && String(item.project?.email || "").toLowerCase() === email) || (phone && item.project?.phone === phone))
    ));
    if (existing) {
      existing.status = "Neu";
      existing.project = project;
      existing.prices = prices;
      existing.totals = totals;
      return existing;
    }
  }
  return saveOffer({ offerNo, status: "Neu", project, prices, totals });
}

async function savePartialOffer({ offerNo, project, prices, totals }) {
  const email = String(project.email || "").toLowerCase();
  const phone = String(project.phone || "");
  if (pool) {
    const existing = await pool.query(
      `select id from offers
       where status = 'Unvollständig'
       and (($1 <> '' and lower(project->>'email') = $1) or ($2 <> '' and project->>'phone' = $2))
       order by created_at desc
       limit 1`,
      [email, phone]
    );
    if (existing.rows[0]) {
      const result = await pool.query(
        `update offers
         set project = $2, prices = $3, totals = $4
         where id = $1
         returning id, offer_no as "offerNo", status, project, totals, created_at as "createdAt"`,
        [existing.rows[0].id, toJson(project), toJson(prices), toJson(totals)]
      );
      return result.rows[0];
    }
  } else {
    const existing = memory.offers.find((item) => (
      item.status === "Unvollständig" &&
      ((email && String(item.project?.email || "").toLowerCase() === email) || (phone && item.project?.phone === phone))
    ));
    if (existing) {
      existing.project = project;
      existing.prices = prices;
      existing.totals = totals;
      return existing;
    }
  }
  return saveOffer({ offerNo, status: "Unvollständig", project, prices, totals });
}

async function listOffers() {
  if (pool) {
    const result = await pool.query("select id, offer_no as \"offerNo\", status, project, totals, created_at as \"createdAt\" from offers order by created_at desc limit 250");
    return result.rows;
  }
  return memory.offers;
}

async function saveVisitorEvent({ ip, path, referrer, userAgent }) {
  if (pool) {
    await ensureVisitorEventsTable();
    await pool.query(
      "insert into visitor_events (ip, path, referrer, user_agent) values ($1, $2, $3, $4)",
      [ip || null, path || "/", referrer || null, userAgent || null]
    );
    return;
  }
  memory.visitorEvents.push({ id: randomUUID(), ip, path, referrer, userAgent, createdAt: new Date().toISOString() });
}

async function getAnalytics() {
  if (pool) {
    await ensureVisitorEventsTable();
    const [summary, recent] = await Promise.all([
      pool.query(
        `select
          count(*)::int as "totalVisits",
          count(distinct ip)::int as "uniqueIps",
          count(*) filter (where created_at >= now() - interval '24 hours')::int as "visits24h",
          count(*) filter (where created_at >= now() - interval '7 days')::int as "visits7d"
         from visitor_events`
      ),
      pool.query(
        `select id, ip, path, referrer, user_agent as "userAgent", created_at as "createdAt"
         from visitor_events
         order by created_at desc
         limit 100`
      )
    ]);
    return { summary: summary.rows[0], recent: recent.rows };
  }
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const week = 7 * day;
  return {
    summary: {
      totalVisits: memory.visitorEvents.length,
      uniqueIps: new Set(memory.visitorEvents.map((event) => event.ip).filter(Boolean)).size,
      visits24h: memory.visitorEvents.filter((event) => now - new Date(event.createdAt).getTime() <= day).length,
      visits7d: memory.visitorEvents.filter((event) => now - new Date(event.createdAt).getTime() <= week).length
    },
    recent: [...memory.visitorEvents].reverse().slice(0, 100)
  };
}

async function getPriceSettings() {
  if (pool) {
    await ensurePriceSettingsTable();
    await pool.query(
      `insert into price_settings (id, setup, milling, manifold, closing, leveling)
       values (1, $1, $2, $3, $4, $5)
       on conflict (id) do nothing`,
      [defaultPriceSettings.setup, defaultPriceSettings.milling, defaultPriceSettings.manifold, defaultPriceSettings.closing, defaultPriceSettings.leveling]
    );
    const result = await pool.query(
      `select setup::float, milling::float, manifold::float, closing::float, leveling::float, updated_at as "updatedAt"
       from price_settings
       where id = 1`
    );
    return result.rows[0];
  }
  return memory.priceSettings;
}

async function updatePriceSettings(prices) {
  if (pool) {
    await ensurePriceSettingsTable();
    const result = await pool.query(
      `insert into price_settings (id, setup, milling, manifold, closing, leveling)
       values (1, $1, $2, $3, $4, $5)
       on conflict (id) do update set
         setup = excluded.setup,
         milling = excluded.milling,
         manifold = excluded.manifold,
         closing = excluded.closing,
         leveling = excluded.leveling,
         updated_at = now()
       returning setup::float, milling::float, manifold::float, closing::float, leveling::float, updated_at as "updatedAt"`,
      [prices.setup, prices.milling, prices.manifold, prices.closing, prices.leveling]
    );
    return result.rows[0];
  }
  memory.priceSettings = { ...prices, updatedAt: new Date().toISOString() };
  return memory.priceSettings;
}

async function ensurePriceSettingsTable() {
  await pool.query(`
    create table if not exists price_settings (
      id int primary key default 1,
      setup numeric not null,
      milling numeric not null,
      manifold numeric not null,
      closing numeric not null,
      leveling numeric not null,
      updated_at timestamptz not null default now()
    )
  `);
}

async function ensureVisitorEventsTable() {
  await pool.query(`
    create table if not exists visitor_events (
      id uuid primary key default gen_random_uuid(),
      ip text,
      path text,
      referrer text,
      user_agent text,
      created_at timestamptz not null default now()
    )
  `);
}

async function updateOfferStatus(id, status) {
  if (pool) {
    const result = await pool.query(
      "update offers set status = $2 where id = $1 returning id, offer_no as \"offerNo\", status, project, totals, created_at as \"createdAt\"",
      [id, status]
    );
    return result.rows[0];
  }
  const offer = memory.offers.find((item) => item.id === id);
  if (offer) offer.status = status;
  return offer;
}

async function notifyLead({ offerNo, form, offer }) {
  if (!process.env.SMTP_HOST || !process.env.LEAD_NOTIFICATION_TO) return;
  const transporter = createMailTransporter();
  await transporter.sendMail({
    from: process.env.MAIL_FROM || "FloWarm <info@flowarm.de>",
    to: process.env.LEAD_NOTIFICATION_TO,
    replyTo: form.email,
    subject: `Neue FloWarm Anfrage ${offerNo}`,
    text: [
      `Angebot: ${offerNo}`,
      `Name: ${form.name}`,
      `E-Mail: ${form.email}`,
      `Telefon: ${form.phone}`,
      `Ort: ${form.zipCity}`,
      `Fläche: ${form.area} m²`,
      `Brutto: ${new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(offer.gross)}`
    ].join("\n")
  });
}

async function queueOfferNotifications(payload) {
  const results = await Promise.allSettled([
    notifyLead(payload),
    notifyCustomerWithPdf(payload)
  ]);
  const [leadResult, customerResult] = results;
  if (leadResult.status === "rejected") console.warn("Lead notification failed:", leadResult.reason?.message || leadResult.reason);
  if (customerResult.status === "rejected") console.warn("Customer notification failed:", customerResult.reason?.message || customerResult.reason);
}

async function notifyCustomer({ offerNo, form, offer }) {
  if (!process.env.SMTP_HOST || !validEmail(form.email)) return;
  const transporter = createMailTransporter();
  const format = (value) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value || 0);
  const positions = (offer.positions || [])
    .map((item) => `${item.label}: ${item.qty} ${item.unit} x ${format(item.price)} = ${format(Number(item.qty || 0) * Number(item.price || 0))}`)
    .join("\n");
  await transporter.sendMail({
    from: process.env.MAIL_FROM || "FloWarm <info@flowarm.de>",
    to: form.email,
    subject: `Ihr vorläufiges FloWarm Angebot ${offerNo}`,
    text: [
      `Hallo ${form.name},`,
      "",
      `vielen Dank für Ihre Anfrage. Hier ist Ihr vorläufiges FloWarm Angebot ${offerNo}:`,
      "",
      positions,
      "",
      `Netto: ${format(offer.net)}`,
      `19 % MwSt.: ${format(offer.vat)}`,
      `Brutto: ${format(offer.gross)}`,
      "",
      "Der Preis ist vorbehaltlich technischer Prüfung. Wir melden uns zur Abstimmung der nächsten Schritte.",
      "",
      "Freundliche Grüße",
      "Ihr FloWarm Team"
    ].join("\n")
  });
}

async function notifyCustomerWithPdf({ offerNo, form, offer }) {
  if (!process.env.SMTP_HOST || !validEmail(form.email)) return;
  const transporter = createMailTransporter();
  const format = (value) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value || 0);
  const pdf = createOfferPdf({ form, offer, offerNo });
  const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));
  const positionRows = (offer.positions || [])
    .map((item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #e8e1d8;color:#2b2b2b;">${escapeHtml(item.label)}</td>
        <td style="padding:10px 0;border-bottom:1px solid #e8e1d8;text-align:right;color:#2b2b2b;">${escapeHtml(String(item.qty))} ${escapeHtml(item.unit)}</td>
        <td style="padding:10px 0;border-bottom:1px solid #e8e1d8;text-align:right;font-weight:700;color:#111111;">${format(Number(item.qty || 0) * Number(item.price || 0))}</td>
      </tr>
    `)
    .join("");
  const textPositions = (offer.positions || [])
    .map((item) => `${item.label}: ${item.qty} ${item.unit} = ${format(Number(item.qty || 0) * Number(item.price || 0))}`)
    .join("\n");
  const html = `
    <div style="margin:0;padding:0;background:#f7f4ef;font-family:Arial,Helvetica,sans-serif;color:#111111;">
      <div style="max-width:680px;margin:0 auto;padding:28px 18px;">
        <div style="background:#0b0b0d;border-radius:12px 12px 0 0;padding:24px 28px;border-bottom:4px solid #f28a18;">
          <div style="font-size:24px;font-weight:800;color:#ffffff;">FloWarm</div>
          <div style="margin-top:6px;font-size:12px;font-weight:700;color:#f28a18;letter-spacing:3px;text-transform:uppercase;">Vorläufiges Angebot</div>
        </div>
        <div style="background:#ffffff;padding:28px;border-radius:0 0 12px 12px;border:1px solid #eee7de;border-top:0;">
          <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Hallo ${escapeHtml(form.name)},</p>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">vielen Dank für Ihre Anfrage und Ihr Interesse an FloWarm. Wir freuen uns, dass Sie sich ein Angebot für Ihre Fußbodenheizung eingeholt haben.</p>
          <p style="margin:0 0 22px;font-size:16px;line-height:1.6;">Im Anhang finden Sie Ihr vorläufiges Angebot <strong>${escapeHtml(offerNo)}</strong> als PDF. Wenn das Angebot für Sie passt, freuen wir uns sehr über Ihren Auftrag und stimmen anschließend die technische Prüfung sowie den nächsten Schritt mit Ihnen ab.</p>
          <div style="background:#fff8ed;border:1px solid #f2d7b4;border-radius:10px;padding:18px;margin:22px 0;">
            <div style="font-size:13px;color:#755127;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;">Vorläufiger Brutto-Festpreis</div>
            <div style="margin-top:6px;font-size:30px;font-weight:800;color:#111111;">${format(offer.gross)}</div>
            <div style="margin-top:4px;font-size:13px;color:#755127;">inkl. 19 % MwSt., vorbehaltlich technischer Prüfung</div>
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:18px;">${positionRows}
            <tr><td colspan="2" style="padding:14px 0 4px;text-align:right;color:#666666;">Netto</td><td style="padding:14px 0 4px;text-align:right;color:#111111;">${format(offer.net)}</td></tr>
            <tr><td colspan="2" style="padding:4px 0;text-align:right;color:#666666;">19 % MwSt.</td><td style="padding:4px 0;text-align:right;color:#111111;">${format(offer.vat)}</td></tr>
            <tr><td colspan="2" style="padding:10px 0 0;text-align:right;font-weight:800;color:#111111;">Gesamt</td><td style="padding:10px 0 0;text-align:right;font-weight:800;color:#111111;">${format(offer.gross)}</td></tr>
          </table>
          <p style="margin:26px 0 0;font-size:15px;line-height:1.6;color:#333333;">Bei Fragen antworten Sie einfach auf diese E-Mail oder rufen Sie uns an. Wir melden uns zeitnah bei Ihnen.</p>
          <p style="margin:22px 0 0;font-size:15px;line-height:1.6;color:#333333;">Freundliche Grüße<br><strong>Ihr FloWarm Team</strong></p>
        </div>
      </div>
    </div>
  `;
  await transporter.sendMail({
    from: process.env.MAIL_FROM || "FloWarm <info@flowarm.de>",
    to: form.email,
    subject: `Ihr vorläufiges FloWarm Angebot ${offerNo}`,
    html,
    text: [
      `Hallo ${form.name},`,
      "",
      "vielen Dank für Ihre Anfrage und Ihr Interesse an FloWarm.",
      `Im Anhang finden Sie Ihr vorläufiges Angebot ${offerNo} als PDF.`,
      "Wenn das Angebot für Sie passt, freuen wir uns sehr über Ihren Auftrag.",
      "",
      textPositions,
      "",
      `Netto: ${format(offer.net)}`,
      `19 % MwSt.: ${format(offer.vat)}`,
      `Brutto: ${format(offer.gross)}`,
      "",
      "Der Preis ist vorbehaltlich technischer Prüfung. Wir melden uns zur Abstimmung der nächsten Schritte.",
      "",
      "Freundliche Grüße",
      "Ihr FloWarm Team"
    ].join("\n"),
    attachments: [
      {
        filename: `FloWarm-Angebot-${offerNo}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf"
      }
    ]
  });
}

function createMailTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    disableFileAccess: true,
    disableUrlAccess: true
  });
}

async function bootstrapAdmin() {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) return;
  const existing = await findUserByEmail(process.env.ADMIN_EMAIL);
  if (existing) return;
  await createUser({
    email: process.env.ADMIN_EMAIL,
    passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12),
    name: process.env.ADMIN_NAME || "FloWarm Admin",
    phone: null,
    role: "admin"
  });
}

function ensureBootstrapAdmin() {
  adminBootstrapPromise ||= bootstrapAdmin().catch((error) => {
    adminBootstrapPromise = null;
    throw error;
  });
  return adminBootstrapPromise;
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ""));
}

function validPassword(password) {
  return String(password || "").length >= 8;
}

function hasUsableContact(form) {
  const email = String(form.email || "");
  const phone = String(form.phone || "").replace(/\D/g, "");
  return validEmail(email) || phone.length >= 5;
}

function getClientIp(req) {
  const forwarded = req.headers["x-nf-client-connection-ip"] || req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "";
  return String(Array.isArray(forwarded) ? forwarded[0] : forwarded).split(",")[0].trim();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function sanitizePriceSettings(body) {
  const candidate = {
    setup: Number(body?.setup),
    milling: Number(body?.milling),
    manifold: Number(body?.manifold),
    closing: Number(body?.closing),
    leveling: Number(body?.leveling)
  };
  const valid = Object.values(candidate).every((value) => Number.isFinite(value) && value >= 0 && value < 100000);
  return valid ? candidate : null;
}

function toJson(value) {
  return JSON.stringify(value ?? null);
}

const shouldListen = !process.env.NETLIFY && !process.env.AWS_LAMBDA_FUNCTION_NAME;

if (shouldListen) {
  app.listen(port, () => {
    console.log(`FloWarm API running on http://127.0.0.1:${port}`);
  });
}

export default app;
