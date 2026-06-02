import "dotenv/config";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import pg from "pg";

const app = express();
const port = process.env.PORT || 8787;
const jwtSecret = process.env.JWT_SECRET || "flowarm-demo-secret";
const pool = process.env.DATABASE_URL ? new pg.Pool({ connectionString: process.env.DATABASE_URL }) : null;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const demoUsers = [];
const demoOffers = [];

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "flowarm-api", database: Boolean(pool) });
});

app.post("/api/auth/register", async (req, res) => {
  const { email, password, name, role = "customer" } = req.body;
  const exists = demoUsers.find((user) => user.email === email);
  if (exists) return res.status(409).json({ error: "duplicate_email" });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = { id: crypto.randomUUID(), email, name, role, passwordHash };
  demoUsers.push(user);
  const token = jwt.sign({ sub: user.id, email, role }, jwtSecret, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, email, name, role } });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = demoUsers.find((item) => item.email === email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: "invalid_credentials" });
  const token = jwt.sign({ sub: user.id, email, role: user.role }, jwtSecret, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, email, name: user.name, role: user.role } });
});

app.post("/api/offers", async (req, res) => {
  const offer = {
    id: `AG-${new Date().getFullYear()}-${String(1800 + demoOffers.length + 1)}`,
    status: "Neu",
    createdAt: new Date().toISOString(),
    ...req.body
  };
  demoOffers.push(offer);
  res.json(offer);
});

app.get("/api/admin/offers", (_req, res) => {
  res.json(demoOffers);
});

app.post("/api/email/offer", async (req, res) => {
  if (!process.env.SMTP_HOST) return res.json({ queued: false, reason: "SMTP not configured", payload: req.body });
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  await transporter.sendMail({
    from: process.env.MAIL_FROM || "FloWarm <angebote@flowarm.de>",
    to: req.body.email,
    subject: `Ihr FloWarm Angebot ${req.body.offerNo}`,
    text: "Vielen Dank. Ihr vorläufiges FloWarm Festpreisangebot ist im Anhang verfügbar."
  });
  res.json({ queued: true });
});

app.listen(port, () => {
  console.log(`FloWarm API running on http://127.0.0.1:${port}`);
});
