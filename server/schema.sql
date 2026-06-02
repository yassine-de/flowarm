create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  name text,
  phone text,
  role text not null default 'customer',
  created_at timestamptz not null default now()
);

create table if not exists offers (
  id uuid primary key default gen_random_uuid(),
  offer_no text unique not null,
  user_id uuid references users(id),
  status text not null default 'Neu',
  project jsonb not null,
  prices jsonb not null,
  totals jsonb not null,
  pdf_url text,
  created_at timestamptz not null default now()
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid references offers(id),
  starts_at timestamptz not null,
  status text not null default 'requested',
  internal_note text,
  created_at timestamptz not null default now()
);

create table if not exists callbacks (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid references offers(id),
  phone text not null,
  preferred_time text,
  status text not null default 'Neu',
  created_at timestamptz not null default now()
);

create table if not exists price_settings (
  id int primary key default 1,
  setup numeric not null,
  milling numeric not null,
  manifold numeric not null,
  closing numeric not null,
  leveling numeric not null,
  updated_at timestamptz not null default now()
);
