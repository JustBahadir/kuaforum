
-- Create a bucket for shop photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('shop-photos', 'Shop Photos', true, 5242880, '{image/*}')
ON CONFLICT (id) DO NOTHING;

-- Create a policy to allow anyone to read from the shop-photos bucket
CREATE POLICY "Public Read Access for shop-photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'shop-photos')
ON CONFLICT DO NOTHING;

-- Create a policy to allow authenticated users to upload to the shop-photos bucket
CREATE POLICY "Authenticated Users can upload to shop-photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'shop-photos')
ON CONFLICT DO NOTHING;

-- Create a policy to allow authenticated users to update their own objects in the shop-photos bucket
CREATE POLICY "Authenticated Users can update their own objects in shop-photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'shop-photos' AND auth.uid() = owner)
ON CONFLICT DO NOTHING;

-- Create a policy to allow authenticated users to delete their own objects in the shop-photos bucket
CREATE POLICY "Authenticated Users can delete their own objects in shop-photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'shop-photos' AND auth.uid() = owner)
ON CONFLICT DO NOTHING;

-- Create photos bucket for profiles and avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('photos', 'Photos', true, 5242880, '{image/*}')
ON CONFLICT (id) DO NOTHING;

-- Create a policy to allow anyone to read from the photos bucket
CREATE POLICY "Public Read Access for photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'photos')
ON CONFLICT DO NOTHING;

-- Create a policy to allow authenticated users to upload to the photos bucket
CREATE POLICY "Authenticated Users can upload to photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'photos')
ON CONFLICT DO NOTHING;

-- Create a policy to allow authenticated users to update their own objects in the photos bucket
CREATE POLICY "Authenticated Users can update their own objects in photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'photos' AND auth.uid() = owner)
ON CONFLICT DO NOTHING;

-- Create a policy to allow authenticated users to delete their own objects in the photos bucket
CREATE POLICY "Authenticated Users can delete their own objects in photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'photos' AND auth.uid() = owner)
ON CONFLICT DO NOTHING;

