-- FASE 1: Segurança e Base (CRÍTICO)

-- 1. RLS Policies para player_stats
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can view their own stats"
ON public.player_stats
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Organizers and admins can manage stats"
ON public.player_stats
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM tournaments
    WHERE tournaments.id = player_stats.tournament_id
    AND (tournaments.organizer_id = auth.uid() OR has_role(auth.uid(), 'admin'))
  )
);

-- 2. RLS Policies para tournament_phases
ALTER TABLE public.tournament_phases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Phases are viewable by everyone"
ON public.tournament_phases
FOR SELECT
USING (true);

CREATE POLICY "Organizers can manage phases"
ON public.tournament_phases
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM tournaments
    WHERE tournaments.id = tournament_phases.tournament_id
    AND (tournaments.organizer_id = auth.uid() OR has_role(auth.uid(), 'admin'))
  )
);

-- 3. Storage Buckets para avatars e banners
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('banners', 'banners', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies para avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage RLS Policies para banners
CREATE POLICY "Banner images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'banners');

CREATE POLICY "Team owners can upload team banners"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'banners'
  AND (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id::text = (storage.foldername(name))[1]
      AND teams.owner_id = auth.uid()
    )
    OR has_role(auth.uid(), 'organizer')
    OR has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "Owners can update banners"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'banners'
  AND (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id::text = (storage.foldername(name))[1]
      AND teams.owner_id = auth.uid()
    )
    OR has_role(auth.uid(), 'organizer')
    OR has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "Owners can delete banners"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'banners'
  AND (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id::text = (storage.foldername(name))[1]
      AND teams.owner_id = auth.uid()
    )
    OR has_role(auth.uid(), 'organizer')
    OR has_role(auth.uid(), 'admin')
  )
);