
-- Add the kategori function to handle dukkan_id
CREATE OR REPLACE FUNCTION public.add_kategori(p_kategori_adi TEXT, p_sira INTEGER, p_dukkan_id BIGINT)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  INSERT INTO public.islem_kategorileri(kategori_adi, sira, dukkan_id)
  VALUES (p_kategori_adi, p_sira, p_dukkan_id)
  RETURNING to_json(islem_kategorileri.*) INTO result;
  
  RETURN result;
END;
$$;

-- Make sure islem_kategorileri has the dukkan_id column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'islem_kategorileri'
    AND column_name = 'dukkan_id'
  ) THEN
    ALTER TABLE public.islem_kategorileri ADD COLUMN dukkan_id BIGINT;
  END IF;
END $$;

-- Create storage bucket for avatars if it doesn't exist
BEGIN;
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;
COMMIT;
