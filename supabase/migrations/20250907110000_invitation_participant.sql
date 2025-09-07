-- Create InvitationParticipant table
create table if not exists public."InvitationParticipant" (
	id uuid primary key default gen_random_uuid(),
	invitation_id uuid not null references public."Invitation"(id) on delete cascade,
	user_id uuid not null references public."Customer"(id) on delete cascade,
	created_at timestamp with time zone not null default now(),
	unique(invitation_id, user_id)
);

-- Enable realtime
alter publication supabase_realtime add table public."InvitationParticipant";
