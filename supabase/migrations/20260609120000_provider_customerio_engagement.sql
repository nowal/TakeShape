create table if not exists public.provider_homeowner_engagement_events (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  homeowner_lead_id uuid null references public.provider_sourced_homeowner_leads(id) on delete set null,
  homeowner_identity_key text null,
  source_system text not null default 'customer_io',
  event_type text not null,
  channel text null,
  external_event_id text null,
  external_delivery_id text null,
  external_customer_id text null,
  customer_io_cio_id text null,
  customer_io_campaign_id text null,
  customer_io_action_id text null,
  customer_io_broadcast_id text null,
  customer_io_newsletter_id text null,
  recipient text null,
  subject text null,
  message_preview text null,
  occurred_at timestamptz not null default now(),
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists provider_homeowner_engagement_events_external_event_idx
  on public.provider_homeowner_engagement_events (source_system, external_event_id);

create index if not exists provider_homeowner_engagement_events_provider_type_idx
  on public.provider_homeowner_engagement_events (provider_id, event_type, occurred_at desc);

create index if not exists provider_homeowner_engagement_events_homeowner_idx
  on public.provider_homeowner_engagement_events (provider_id, homeowner_lead_id, occurred_at desc);

create table if not exists public.provider_home_scans (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  homeowner_lead_id uuid null references public.provider_sourced_homeowner_leads(id) on delete set null,
  homeowner_identity_key text null,
  homeowner_name text null,
  address text null,
  scan_label text null,
  scan_status text not null default 'completed',
  scan_completed_at timestamptz not null default now(),
  model_url text null,
  floor_plan_url text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists provider_home_scans_provider_completed_idx
  on public.provider_home_scans (provider_id, scan_completed_at desc);

create index if not exists provider_home_scans_homeowner_idx
  on public.provider_home_scans (provider_id, homeowner_lead_id, scan_completed_at desc);

alter table public.provider_homeowner_engagement_events disable row level security;
alter table public.provider_home_scans disable row level security;

grant select, insert on public.provider_homeowner_engagement_events to anon, authenticated;
grant select, insert, update on public.provider_home_scans to anon, authenticated;
