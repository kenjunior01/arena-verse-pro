-- Fase 1: Adicionar políticas RLS ao bucket banners
CREATE POLICY "Authenticated users can upload to banners"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'banners' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own files in banners"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'banners' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files in banners"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'banners' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Fase 2: Promover usuário atual para admin
UPDATE user_roles 
SET role = 'admin'
WHERE user_id = '4a405374-2f2b-4780-80e7-ea416249d1a9';

-- Fase 3: Adicionar role organizer também
INSERT INTO user_roles (user_id, role)
VALUES ('4a405374-2f2b-4780-80e7-ea416249d1a9', 'organizer')
ON CONFLICT (user_id, role) DO NOTHING;