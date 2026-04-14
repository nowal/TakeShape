create table if not exists public.provider_embed_settings (
  provider_id text primary key references public.providers(id) on delete cascade,
  intake_settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists set_provider_embed_settings_updated_at on public.provider_embed_settings;
create trigger set_provider_embed_settings_updated_at
before update on public.provider_embed_settings
for each row
execute function public.set_updated_at();
