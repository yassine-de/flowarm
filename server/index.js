import "dotenv/config";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import pg from "pg";
import { randomUUID } from "node:crypto";

const app = express();
const port = process.env.PORT || 8787;
const isProduction = process.env.NODE_ENV === "production";
const jwtSecret = process.env.JWT_SECRET;
const databaseUrl = process.env.DATABASE_URL;
const databaseNeedsSsl = databaseUrl && !/localhost|127\.0\.0\.1/i.test(databaseUrl);
const pool = databaseUrl ? new pg.Pool({ connectionString: databaseUrl, ssl: databaseNeedsSsl ? { rejectUnauthorized: false } : false }) : null;
const defaultPriceSettings = { setup: 270, milling: 27, manifold: 600, closing: 9, leveling: 24 };
const memory = { users: [], offers: [], priceSettings: { ...defaultPriceSettings, updatedAt: new Date().toISOString() } };
const offerStatuses = ["Unvollständig", "Neu", "Angebot gesendet", "Termin gebucht", "Bestätigt", "In Bearbeitung", "Abgeschlossen"];

if (isProduction && !jwtSecret) {
  throw new Error("JWT_SECRET is required in production");
}

app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json({ limit: "2mb" }));

await bootstrapAdmin();

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "flowarm-api", database: Boolean(pool) });
});

app.get("/api/prices", async (_req, res) => {
  res.json(await getPriceSettings());
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
  await notifyLead({ offerNo, form, offer }).catch((error) => console.warn("Lead notification failed:", error.message));
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
      [offerNo, status, project, prices, totals]
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
        [existing.rows[0].id, project, prices, totals]
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
        [existing.rows[0].id, project, prices, totals]
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
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    disableFileAccess: true,
    disableUrlAccess: true
  });
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

const shouldListen = !process.env.NETLIFY && !process.env.AWS_LAMBDA_FUNCTION_NAME;

if (shouldListen) {
  app.listen(port, () => {
    console.log(`FloWarm API running on http://127.0.0.1:${port}`);
  });
}

export default app;
