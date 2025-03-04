
-- Create a bucket for photos if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('photos', 'Photos', true, 5242880, '{image/*}')
ON CONFLICT (id) DO NOTHING;

-- Create a bucket for shop photos if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('shop-photos', 'Shop Photos', true, 5242880, '{image/*}')
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the photos bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT 
USING (bucket_id = 'photos')
ON CONFLICT DO NOTHING;

CREATE POLICY "Authenticated users can upload photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'photos' AND
    auth.role() = 'authenticated'
  )
ON CONFLICT DO NOTHING;

CREATE POLICY "Users can update their own photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'photos' AND
    auth.uid() = owner
  )
ON CONFLICT DO NOTHING;

CREATE POLICY "Users can delete their own photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'photos' AND
    auth.uid() = owner
  )
ON CONFLICT DO NOTHING;

-- Create RLS policies for the shop-photos bucket
CREATE POLICY "Public Access for shop photos" ON storage.objects FOR SELECT 
USING (bucket_id = 'shop-photos')
ON CONFLICT DO NOTHING;

CREATE POLICY "Authenticated users can upload shop photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'shop-photos' AND
    auth.role() = 'authenticated'
  )
ON CONFLICT DO NOTHING;

CREATE POLICY "Users can update their own shop photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'shop-photos' AND
    auth.uid() = owner
  )
ON CONFLICT DO NOTHING;

CREATE POLICY "Users can delete their own shop photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'shop-photos' AND
    auth.uid() = owner
  )
ON CONFLICT DO NOTHING;
