-- Enable Row Level Security
alter table if exists public."Customer" enable row level security;
alter table if exists public."Sports" enable row level security;
alter table if exists public."Invitation" enable row level security;
alter table if exists public."InvitationParticipant" enable row level security;

-- Policies: Public read for feed
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

-- Policies: Write rules
-- Customer: allow insert/update for self (optional minimal)
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

-- Invitation: only owners can insert/update/delete
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

-- InvitationParticipant: users can join/leave themselves
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

