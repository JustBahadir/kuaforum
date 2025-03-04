
-- Create a bucket for photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'Photos', true);

-- Create RLS policies for the bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'photos');

CREATE POLICY "Authenticated users can upload files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'photos' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'photos' AND
    auth.uid() = owner
  );

CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'photos' AND
    auth.uid() = owner
  );
