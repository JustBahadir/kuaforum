
// This file contains SQL function definitions that need to be created in the Supabase database

/*
-- Function to add a category with explicit dukkan_id parameter
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
*/
