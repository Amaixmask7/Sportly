-- Create InvitationComment table
CREATE TABLE IF NOT EXISTS public."InvitationComment" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invitation_id UUID NOT NULL REFERENCES public."Invitation"(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public."Customer"(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (length(content) > 0 AND length(content) <= 500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public."InvitationComment" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view comments"
    ON public."InvitationComment"
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert comments"
    ON public."InvitationComment"
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own comments"
    ON public."InvitationComment"
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
    ON public."InvitationComment"
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public."InvitationComment";

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_invitation_comment_invitation_id ON public."InvitationComment"(invitation_id);
CREATE INDEX IF NOT EXISTS idx_invitation_comment_user_id ON public."InvitationComment"(user_id);
CREATE INDEX IF NOT EXISTS idx_invitation_comment_created_at ON public."InvitationComment"(created_at);
