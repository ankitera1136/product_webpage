import bcrypt from "bcryptjs";
import { createClient, createPool, postgresConnectionString } from "@vercel/postgres";
import { config } from "./config";

type SqlTag = (strings: TemplateStringsArray, ...values: any[]) => Promise<{ rows: any[] }>;

const pooledConnectionString =
  postgresConnectionString("pool") ?? process.env.POSTGRES_URL;
const directConnectionString =
  postgresConnectionString("direct") ??
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.POSTGRES_URL;

const hasPooledConnection =
  typeof pooledConnectionString === "string" &&
  pooledConnectionString.includes("-pooler.");

let pool: ReturnType<typeof createPool> | null = null;

export const sql: SqlTag = async (strings, ...values) => {
  if (hasPooledConnection) {
    if (!pool) {
      pool = createPool({ connectionString: pooledConnectionString });
    }
    return pool.sql(strings, ...values);
  }

  if (!directConnectionString) {
    throw new Error(
      "Missing Postgres connection string. Set POSTGRES_URL (pooled) or POSTGRES_URL_NON_POOLING (direct)."
    );
  }

  const client = createClient({ connectionString: directConnectionString });
  await client.connect();
  try {
    return await client.sql(strings, ...values);
  } finally {
    await client.end();
  }
};

let schemaReady: Promise<void> | null = null;

async function ensureSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS tags (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      short_description TEXT NOT NULL,
      price_text TEXT NOT NULL,
      link_url TEXT NOT NULL,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS product_images (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS product_tags (
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (product_id, tag_id)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      id SERIAL PRIMARY KEY,
      admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL
    )
  `;
}

async function seedDefaultAdmin() {
  const { rows } = await sql`SELECT id FROM admins WHERE email = ${config.adminEmail}`;
  if (rows.length > 0) return;

  const passwordHash = bcrypt.hashSync(config.adminPassword, 10);
  const now = new Date().toISOString();
  await sql`
    INSERT INTO admins (name, email, password_hash, role, must_change_password, created_at)
    VALUES ('Owner', ${config.adminEmail}, ${passwordHash}, 'owner', TRUE, ${now})
  `;
}

export async function initDb() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await ensureSchema();
      await seedDefaultAdmin();
    })();
  }
  return schemaReady;
}
