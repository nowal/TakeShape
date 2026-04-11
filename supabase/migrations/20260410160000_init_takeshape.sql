-- TakeShape initial relational schema
-- Notes:
-- 1) Firestore collection `painters` is intentionally renamed to `providers`.
-- 2) IDs are text to support direct reuse of existing Firestore document IDs.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.providers (
  id text primary key,
  user_id text unique,
  business_name text not null default '',
  address text not null default '',
  coords jsonb,
  range_km numeric,
  is_insured boolean not null default false,
  logo_url text not null default '',
  phone_number text not null default '',
  sessions jsonb not null default '[]'::jsonb,
  paid boolean not null default false,
  paying boolean not null default false,
  billing_plan text,
  subscription_status text,
  stripe_customer_id text,
  stripe_subscription_id text,
  trial_ends_at timestamptz,
  terms_and_conditions_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.homeowners (
  id text primary key,
  name text not null default '',
  email text not null default '',
  phone text not null default '',
  sessions jsonb not null default '[]'::jsonb,
  houses jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.houses (
  id text primary key,
  homeowner_id text references public.homeowners(id) on delete set null,
  address text not null default '',
  room_ids jsonb not null default '[]'::jsonb,
  add_ons jsonb not null default '[]'::jsonb,
  submitted boolean not null default false,
  accepted boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.sessions (
  id text primary key,
  homeowner_id text references public.homeowners(id) on delete set null,
  house_id text references public.houses(id) on delete set null,
  current_room_id text,
  quote_feedback text,
  chat_history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  last_active timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.rooms (
  id text primary key,
  session_id text not null references public.sessions(id) on delete cascade,
  house_id text references public.houses(id) on delete set null,
  name text not null default '',
  images jsonb not null default '[]'::jsonb,
  processed boolean not null default false,
  model_path text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.quotes (
  id text primary key,
  provider_id text not null references public.providers(id) on delete cascade,
  session_id text references public.sessions(id) on delete set null,
  homeowner_id text references public.homeowners(id) on delete set null,
  house_id text references public.houses(id) on delete set null,
  signalwire_conference_id text,
  signalwire_recording_id text,
  status text not null default 'draft',
  pricing jsonb not null default '{}'::jsonb,
  customer_info jsonb not null default '{}'::jsonb,
  signature jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.pricing_sheets (
  id text primary key,
  provider_id text not null unique references public.providers(id) on delete cascade,
  base_rate numeric not null default 0,
  minimum_charge numeric not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.pricing_rules (
  id text primary key,
  pricing_sheet_id text not null references public.pricing_sheets(id) on delete cascade,
  condition text not null,
  amount numeric not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.video_assets (
  id text primary key,
  quote_id text references public.quotes(id) on delete cascade,
  provider_id text references public.providers(id) on delete set null,
  source text not null check (source in ('upload', 'signalwire')),
  storage_provider text not null check (storage_provider in ('r2', 'signalwire', 'firebase')),
  bucket text,
  object_key text,
  file_name text,
  content_type text,
  file_size_bytes bigint,
  duration_seconds numeric,
  signalwire_recording_id text,
  upstream_url text,
  playback_url text,
  thumbnail_url text,
  status text not null default 'pending',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.crm_connections (
  id text primary key,
  provider_id text not null references public.providers(id) on delete cascade,
  channel text not null check (channel in ('unified', 'zapier')),
  status text not null default 'active',
  external_account_id text,
  credential_ref text,
  field_mapping jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.lead_delivery_outbox (
  id text primary key,
  provider_id text not null references public.providers(id) on delete cascade,
  quote_id text references public.quotes(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  attempts integer not null default 0,
  next_attempt_at timestamptz,
  last_error text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_sessions_homeowner_id on public.sessions(homeowner_id);
create index if not exists idx_sessions_house_id on public.sessions(house_id);
create index if not exists idx_sessions_last_active on public.sessions(last_active desc);
create index if not exists idx_rooms_session_id on public.rooms(session_id);
create index if not exists idx_quotes_provider_id on public.quotes(provider_id);
create index if not exists idx_quotes_session_id on public.quotes(session_id);
create index if not exists idx_quotes_signalwire_conference_id on public.quotes(signalwire_conference_id);
create index if not exists idx_video_assets_quote_id on public.video_assets(quote_id);
create index if not exists idx_video_assets_provider_id on public.video_assets(provider_id);
create index if not exists idx_video_assets_signalwire_recording_id on public.video_assets(signalwire_recording_id);
create index if not exists idx_lead_delivery_outbox_status_next_attempt on public.lead_delivery_outbox(status, next_attempt_at);

create or replace trigger trg_providers_updated_at
before update on public.providers
for each row execute function public.set_updated_at();

create or replace trigger trg_homeowners_updated_at
before update on public.homeowners
for each row execute function public.set_updated_at();

create or replace trigger trg_houses_updated_at
before update on public.houses
for each row execute function public.set_updated_at();

create or replace trigger trg_sessions_updated_at
before update on public.sessions
for each row execute function public.set_updated_at();

create or replace trigger trg_rooms_updated_at
before update on public.rooms
for each row execute function public.set_updated_at();

create or replace trigger trg_quotes_updated_at
before update on public.quotes
for each row execute function public.set_updated_at();

create or replace trigger trg_pricing_sheets_updated_at
before update on public.pricing_sheets
for each row execute function public.set_updated_at();

create or replace trigger trg_pricing_rules_updated_at
before update on public.pricing_rules
for each row execute function public.set_updated_at();

create or replace trigger trg_video_assets_updated_at
before update on public.video_assets
for each row execute function public.set_updated_at();

create or replace trigger trg_crm_connections_updated_at
before update on public.crm_connections
for each row execute function public.set_updated_at();

create or replace trigger trg_lead_delivery_outbox_updated_at
before update on public.lead_delivery_outbox
for each row execute function public.set_updated_at();

alter table public.providers enable row level security;
alter table public.homeowners enable row level security;
alter table public.houses enable row level security;
alter table public.sessions enable row level security;
alter table public.rooms enable row level security;
alter table public.quotes enable row level security;
alter table public.pricing_sheets enable row level security;
alter table public.pricing_rules enable row level security;
alter table public.video_assets enable row level security;
alter table public.crm_connections enable row level security;
alter table public.lead_delivery_outbox enable row level security;

