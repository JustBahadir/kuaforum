
-- This SQL function needs to be created in Supabase SQL editor
-- to prevent infinite recursion in profile policies

CREATE OR REPLACE FUNCTION create_appointment(appointment_data json)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
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
    (appointment_data->>'dukkan_id')::bigint,
    (appointment_data->>'musteri_id')::bigint,
    (appointment_data->>'personel_id')::bigint,
    (appointment_data->>'tarih')::date,
    (appointment_data->>'saat')::time,
    COALESCE(appointment_data->>'durum', 'onaylandi'),
    COALESCE(appointment_data->>'notlar', ''),
    COALESCE(appointment_data->'islemler', '[]'::jsonb),
    (appointment_data->>'customer_id')::uuid
  )
  RETURNING to_json(randevular.*) INTO result;
  
  RETURN result;
END;
$$;
