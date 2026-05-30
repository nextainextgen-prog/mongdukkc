-- =====================================================================
-- มองดึก KC — schema (phase 1)
-- Run this in Supabase SQL editor.
-- =====================================================================

-- Extensions
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- slips: every slip verification attempt, success or not
-- ---------------------------------------------------------------------
create table if not exists public.slips (
  id              uuid primary key default gen_random_uuid(),
  trans_ref       text,                       -- Thunder transRef
  amount          numeric(14, 2),
  currency        text default 'THB',
  trans_date      timestamptz,
  sender_name     text,
  sender_bank     text,
  receiver_name   text,
  receiver_bank   text,
  status          text not null check (status in ('success','duplicate','error')),
  source          text not null default 'line' check (source in ('line','manual','api')),
  line_user_id    text,
  raw_response    jsonb,
  error_message   text,
  created_at      timestamptz not null default now()
);

-- Unique on trans_ref blocks duplicate slips submitted twice.
create unique index if not exists slips_trans_ref_unique
  on public.slips (trans_ref) where trans_ref is not null;

create index if not exists slips_created_at_idx on public.slips (created_at desc);
create index if not exists slips_status_idx on public.slips (status);
create index if not exists slips_trans_date_idx on public.slips (trans_date);

-- ---------------------------------------------------------------------
-- line_settings: a single-row table (channel token / secret)
-- ---------------------------------------------------------------------
create table if not exists public.line_settings (
  id                   uuid primary key default gen_random_uuid(),
  channel_access_token text,
  channel_secret       text,
  webhook_url          text,
  is_active            boolean not null default false,
  updated_at           timestamptz not null default now()
);

-- Seed the single row if not present.
insert into public.line_settings (is_active)
select false
where not exists (select 1 from public.line_settings);

-- ---------------------------------------------------------------------
-- flex_templates: reusable LINE Flex Message JSON, can be themed
-- ---------------------------------------------------------------------
create table if not exists public.flex_templates (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  kind         text not null check (kind in ('success','duplicate','error','custom')),
  is_default   boolean not null default false,
  content      jsonb not null,
  updated_at   timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

create index if not exists flex_templates_kind_idx on public.flex_templates (kind);

-- Only one default per kind.
create unique index if not exists flex_templates_default_per_kind
  on public.flex_templates (kind) where is_default = true;

-- ---------------------------------------------------------------------
-- app_settings: free-form key/value for future modules
-- ---------------------------------------------------------------------
create table if not exists public.app_settings (
  id         uuid primary key default gen_random_uuid(),
  key        text not null unique,
  value      jsonb,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Reserve namespaces for future modules without building them yet.
--   (cash flow, cost & profit, inventory, reports)
-- ---------------------------------------------------------------------
create schema if not exists money;     -- รายรับ/รายจ่าย
create schema if not exists stock;     -- สต๊อกสินค้า
create schema if not exists reports;   -- รายงาน

-- Helper: keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists set_line_settings_updated_at on public.line_settings;
create trigger set_line_settings_updated_at
  before update on public.line_settings
  for each row execute function public.set_updated_at();

drop trigger if exists set_flex_templates_updated_at on public.flex_templates;
create trigger set_flex_templates_updated_at
  before update on public.flex_templates
  for each row execute function public.set_updated_at();

drop trigger if exists set_app_settings_updated_at on public.app_settings;
create trigger set_app_settings_updated_at
  before update on public.app_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Row-level security: tighten before opening to the public internet.
-- For now, service_role bypasses RLS; anon has read-only on summary view.
-- ---------------------------------------------------------------------
alter table public.slips enable row level security;
alter table public.line_settings enable row level security;
alter table public.flex_templates enable row level security;
alter table public.app_settings enable row level security;
