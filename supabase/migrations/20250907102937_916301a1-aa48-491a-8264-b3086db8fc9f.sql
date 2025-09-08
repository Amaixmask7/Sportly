-- First, let's populate the Sports table with the sports mentioned
INSERT INTO public."Sports" ("Sport_name", "Slug", "Description", "Min_participants", "Max_participants", "is_active") VALUES
('Futsal', 'futsal', 'Fast-paced indoor football played with 5 players per team', 6, 10, true),
('Basket', 'basket', 'Basketball game played with 5 players per team', 6, 10, true),
('Badminton', 'badminton', 'Racquet sport played with shuttlecocks', 2, 4, true),
('Sepakbola', 'sepakbola', 'Football/soccer played with 11 players per team', 10, 22, true),
('Tenis', 'tenis', 'Racquet sport played on a court', 2, 4, true);

-- Enable Row Level Security on all tables
ALTER TABLE public."Customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Invitation" ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public."Sports" ENABLE ROW LEVEL SECURITY;

-- Create policies for Customer table (profiles)
CREATE POLICY "Users can view their own profile"
ON public."Customer"
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"  
ON public."Customer"
FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public."Customer" 
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Create policies for Sports table (public read access)
CREATE POLICY "Anyone can view sports"
ON public."Sports"
FOR SELECT
USING (is_active = true);

-- Create policies for Invitation table
CREATE POLICY "Anyone can view active invitations"
ON public."Invitation"
FOR SELECT  
USING (is_canceled = false);

CREATE POLICY "Users can create their own invitations"
ON public."Invitation"
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own invitations"
ON public."Invitation" 
FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own invitations"
ON public."Invitation"
FOR DELETE
USING (auth.uid() = owner_id);

-- Enable realtime for invitations table
ALTER TABLE public."Invitation" REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public."Invitation";