
-- This SQL function needs to be created in Supabase SQL editor
-- to prevent infinite recursion in profile policies

CREATE OR REPLACE FUNCTION create_appointment(
  p_dukkan_id bigint,
  p_musteri_id bigint,
  p_personel_id bigint,
  p_tarih date,
  p_saat time,
  p_durum text,
  p_notlar text,
  p_islemler jsonb,
  p_customer_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
  v_durum text;
  v_notlar text;
BEGIN
  -- Set default values if null
  v_durum := COALESCE(p_durum, 'onaylandi');
  v_notlar := COALESCE(p_notlar, '');
  
  INSERT INTO public.randevular (
    dukkan_id,
    musteri_id,
    personel_id,
    tarih,
    saat,
    durum,
    notlar,
    islemler,
    customer_id
  )
  VALUES (
    p_dukkan_id,
    p_musteri_id,
    p_personel_id,
    p_tarih,
    p_saat,
    v_durum,
    v_notlar,
    p_islemler,
    p_customer_id
  )
  RETURNING to_json(randevular.*) INTO result;
  
  RETURN result;
END;
$$;
