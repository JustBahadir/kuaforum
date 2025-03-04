
-- Create a bucket for photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('photos', 'Photos', true, 5242880, '{image/*}')
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT 
USING (bucket_id = 'photos')
ON CONFLICT DO NOTHING;

CREATE POLICY "Authenticated users can upload files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'photos' AND
    auth.role() = 'authenticated'
  )
ON CONFLICT DO NOTHING;

CREATE POLICY "Users can update their own files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'photos' AND
    auth.uid() = owner
  )
ON CONFLICT DO NOTHING;

CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'photos' AND
    auth.uid() = owner
  )
ON CONFLICT DO NOTHING;
