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
const pool = process.env.DATABASE_URL ? new pg.Pool({ connectionString: process.env.DATABASE_URL }) : null;
const memory = { users: [], offers: [] };

if (isProduction && !jwtSecret) {
  throw new Error("JWT_SECRET is required in production");
}

app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json({ limit: "2mb" }));

await bootstrapAdmin();

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "flowarm-api", database: Boolean(pool) });
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
  const offerNo = await nextOfferNo();
  const saved = await saveOffer({
    offerNo,
    status: "Neu",
    project: { ...form, password: undefined, source },
    prices: offer.positions,
    totals: { net: offer.net, vat: offer.vat, gross: offer.gross }
  });
  await notifyLead({ offerNo, form, offer }).catch((error) => console.warn("Lead notification failed:", error.message));
  res.json(saved);
});

app.get("/api/admin/offers", requireAuth, requireRole("admin", "staff"), async (_req, res) => {
  res.json(await listOffers());
});

app.patch("/api/admin/offers/:id/status", requireAuth, requireRole("admin", "staff"), async (req, res) => {
  const status = String(req.body.status || "");
  if (!["Neu", "Angebot gesendet", "Termin gebucht", "Bestätigt", "In Bearbeitung", "Abgeschlossen"].includes(status)) {
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

async function listOffers() {
  if (pool) {
    const result = await pool.query("select id, offer_no as \"offerNo\", status, project, totals, created_at as \"createdAt\" from offers order by created_at desc limit 250");
    return result.rows;
  }
  return memory.offers;
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
    from: process.env.MAIL_FROM || "FloWarm <angebote@flowarm.de>",
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

app.listen(port, () => {
  console.log(`FloWarm API running on http://127.0.0.1:${port}`);
});
