-- =============================================
-- PINKS HUB — SUPABASE DATABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- LEADS / CRM TABLE
-- =============================================
create table if not exists leads (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- Contact info
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  company_name text,
  
  -- Deal info
  product_type text not null, -- business_funding, asset_finance, invoice_finance, vehicle_leasing_business, vehicle_leasing_personal, salary_sacrifice
  pipeline_stage text default 'new_enquiry',
  potential_commission numeric(10,2) default 0,
  deal_value numeric(12,2) default 0,
  
  -- Notes
  notes text,
  source text default 'direct', -- direct, website, referral, social
  
  -- Meta
  brand text default 'pinks_associates', -- pinks_associates, pinks_asset_finance, pinks_vehicle_leasing
  priority text default 'normal', -- low, normal, high
  is_archived boolean default false
);

-- =============================================
-- CONTENT / POSTS TABLE
-- =============================================
create table if not exists posts (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- Content
  title text,
  original_content text not null,
  
  -- Per-platform content (generated versions)
  linkedin_content text,
  facebook_content text,
  instagram_content text,
  tiktok_content text,
  youtube_content text,
  wordpress_content text,
  gbp_content text,
  
  -- Scheduling
  scheduled_for timestamptz,
  status text default 'draft', -- draft, scheduled, published, failed
  
  -- Platforms to publish to
  platforms jsonb default '[]',
  
  -- Brand
  brand text default 'pinks_associates',
  
  -- Media
  media_urls jsonb default '[]'
);

-- =============================================
-- LEAD NOTES TABLE
-- =============================================
create table if not exists lead_notes (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now(),
  lead_id uuid references leads(id) on delete cascade,
  note text not null,
  note_type text default 'general' -- general, call, email, meeting
);

-- =============================================
-- CONTENT CALENDAR TABLE
-- =============================================
create table if not exists content_calendar (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now(),
  post_id uuid references posts(id) on delete set null,
  scheduled_date date not null,
  day_of_week text, -- tuesday, thursday
  title text,
  notes text,
  status text default 'planned' -- planned, content_ready, published
);

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger leads_updated_at before update on leads
  for each row execute function update_updated_at();

create trigger posts_updated_at before update on posts
  for each row execute function update_updated_at();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
alter table leads enable row level security;
alter table posts enable row level security;
alter table lead_notes enable row level security;
alter table content_calendar enable row level security;

-- Allow all operations for authenticated users
create policy "Authenticated users can do everything on leads"
  on leads for all using (auth.role() = 'authenticated');

create policy "Authenticated users can do everything on posts"
  on posts for all using (auth.role() = 'authenticated');

create policy "Authenticated users can do everything on lead_notes"
  on lead_notes for all using (auth.role() = 'authenticated');

create policy "Authenticated users can do everything on content_calendar"
  on content_calendar for all using (auth.role() = 'authenticated');

-- =============================================
-- SAMPLE DATA (optional — delete if not needed)
-- =============================================
-- Insert a test lead to verify setup
-- insert into leads (first_name, last_name, email, company_name, product_type, pipeline_stage, potential_commission, notes)
-- values ('Test', 'Lead', 'test@example.com', 'Test Company Ltd', 'asset_finance', 'new_enquiry', 500.00, 'This is a test lead');
