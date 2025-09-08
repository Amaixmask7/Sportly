-- Create UserRating table
CREATE TABLE IF NOT EXISTS public."UserRating" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invitation_id UUID NOT NULL REFERENCES public."Invitation"(id) ON DELETE CASCADE,
    rater_id UUID NOT NULL REFERENCES public."Customer"(id) ON DELETE CASCADE,
    rated_user_id UUID NOT NULL REFERENCES public."Customer"(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT CHECK (length(comment) <= 500),
    would_play_again BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate ratings for same invitation
    UNIQUE(invitation_id, rater_id, rated_user_id)
);

-- Enable RLS
ALTER TABLE public."UserRating" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view ratings"
    ON public."UserRating"
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Users can insert their own ratings"
    ON public."UserRating"
    FOR INSERT
    TO authenticated
    WITH CHECK (rater_id = auth.uid());

CREATE POLICY "Users can update their own ratings"
    ON public."UserRating"
    FOR UPDATE
    TO authenticated
    USING (rater_id = auth.uid())
    WITH CHECK (rater_id = auth.uid());

CREATE POLICY "Users can delete their own ratings"
    ON public."UserRating"
    FOR DELETE
    TO authenticated
    USING (rater_id = auth.uid());

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public."UserRating";

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_rating_rated_user_id ON public."UserRating"(rated_user_id);
CREATE INDEX IF NOT EXISTS idx_user_rating_rater_id ON public."UserRating"(rater_id);
CREATE INDEX IF NOT EXISTS idx_user_rating_invitation_id ON public."UserRating"(invitation_id);
CREATE INDEX IF NOT EXISTS idx_user_rating_created_at ON public."UserRating"(created_at);
