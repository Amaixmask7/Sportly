-- ALL-IN-ONE SETUP FOR SPORTLY
-- Jalankan file ini langsung di Supabase SQL Editor.

-- Ensure required extensions
create extension if not exists pgcrypto;

-- 1) TABEL PARTISIPASI + REALTIME
create table if not exists public."InvitationParticipant" (
	id uuid primary key default gen_random_uuid(),
	invitation_id uuid not null references public."Invitation"(id) on delete cascade,
	user_id uuid not null references public."Customer"(id) on delete cascade,
	created_at timestamp with time zone not null default now(),
	unique(invitation_id, user_id)
);

alter publication supabase_realtime add table public."InvitationParticipant";

-- 2) ENABLE RLS
alter table if exists public."Customer" enable row level security;
alter table if exists public."Sports" enable row level security;
alter table if exists public."Invitation" enable row level security;
alter table if exists public."InvitationParticipant" enable row level security;

-- 3) RLS POLICIES (READ PUBLIK)
create policy if not exists "Public read customers"
	on public."Customer"
	for select
	to anon, authenticated
	using (true);

create policy if not exists "Public read sports"
	on public."Sports"
	for select
	to anon, authenticated
	using (true);

create policy if not exists "Public read invitations"
	on public."Invitation"
	for select
	to anon, authenticated
	using (true);

create policy if not exists "Public read participants for counts"
	on public."InvitationParticipant"
	for select
	to anon, authenticated
	using (true);

-- 4) RLS POLICIES (WRITE TERLINDUNGI)
-- Customer: insert/update untuk diri sendiri
create policy if not exists "Users can insert own customer profile"
	on public."Customer"
	for insert
	to authenticated
	with check (id = auth.uid());

create policy if not exists "Users can update own customer profile"
	on public."Customer"
	for update
	to authenticated
	using (id = auth.uid())
	with check (id = auth.uid());

-- Invitation: owner-only write
create policy if not exists "Users can create invitation"
	on public."Invitation"
	for insert
	to authenticated
	with check (owner_id = auth.uid());

create policy if not exists "Owners can update invitation"
	on public."Invitation"
	for update
	to authenticated
	using (owner_id = auth.uid())
	with check (owner_id = auth.uid());

create policy if not exists "Owners can delete invitation"
	on public."Invitation"
	for delete
	to authenticated
	using (owner_id = auth.uid());

-- InvitationParticipant: user bisa join/leave dirinya
create policy if not exists "Users can join invitation"
	on public."InvitationParticipant"
	for insert
	to authenticated
	with check (user_id = auth.uid());

create policy if not exists "Users can leave joined invitation"
	on public."InvitationParticipant"
	for delete
	to authenticated
	using (user_id = auth.uid());

-- 5) SEED SPORTS (idempotent by Slug)
insert into public."Sports" (id, "Sport_name", "Slug", "Description", "Min_participants", "Max_participants", is_active)
select coalesce((select id from public."Sports" s where s."Slug" = v.slug limit 1), gen_random_uuid()),
       v.name, v.slug, v.description, v.minp, v.maxp, true
from (
  values
    ('Futsal', 'futsal', 'Olahraga futsal bersama.', 5, 10),
    ('Basket', 'basket', 'Olahraga basket bersama.', 5, 10),
    ('Badminton', 'badminton', 'Olahraga badminton bersama.', 2, 4),
    ('Sepakbola', 'sepakbola', 'Olahraga sepakbola bersama.', 11, 22),
    ('Tenis', 'tenis', 'Olahraga tenis bersama.', 2, 4)
) as v(name, slug, description, minp, maxp)
where not exists (select 1 from public."Sports" s2 where s2."Slug" = v.slug);
