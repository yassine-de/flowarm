import "dotenv/config";
import bcrypt from "bcryptjs";
import pg from "pg";

const { DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is required to seed a persistent admin account.");
}

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required.");
}

const pool = new pg.Pool({ connectionString: DATABASE_URL });

try {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const result = await pool.query(
    `
      insert into users (email, password_hash, name, phone, role)
      values ($1, $2, $3, null, 'admin')
      on conflict (email)
      do update set
        password_hash = excluded.password_hash,
        name = excluded.name,
        role = 'admin'
      returning id, email, name, role
    `,
    [ADMIN_EMAIL, passwordHash, ADMIN_NAME || "FloWarm Admin"]
  );

  console.log(`Admin account ready: ${result.rows[0].email} (${result.rows[0].role})`);
} finally {
  await pool.end();
}
