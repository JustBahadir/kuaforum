
-- Create a function to add an operation to both customer and personnel history
CREATE OR REPLACE FUNCTION add_operation(
  p_personel_id BIGINT,
  p_musteri_id BIGINT,
  p_islem_id BIGINT,
  p_tutar NUMERIC,
  p_aciklama TEXT,
  p_notlar TEXT DEFAULT NULL,
  p_photos TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prim_yuzdesi NUMERIC;
  v_odenen NUMERIC;
  v_puan INTEGER;
  v_result JSONB;
BEGIN
  -- Get the personnel's commission percentage
  SELECT prim_yuzdesi INTO v_prim_yuzdesi
  FROM personel
  WHERE id = p_personel_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Personnel not found';
  END IF;
  
  -- Get the service's points
  SELECT puan INTO v_puan
  FROM islemler
  WHERE id = p_islem_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Service not found';
  END IF;
  
  -- Calculate commission
  v_odenen := (p_tutar * v_prim_yuzdesi) / 100;
  
  -- Insert the operation
  INSERT INTO personel_islemleri (
    personel_id,
    musteri_id,
    islem_id,
    tutar,
    prim_yuzdesi,
    odenen,
    puan,
    aciklama,
    notlar,
    photos
  ) VALUES (
    p_personel_id,
    p_musteri_id,
    p_islem_id,
    p_tutar,
    v_prim_yuzdesi,
    v_odenen,
    v_puan,
    p_aciklama,
    p_notlar,
    p_photos
  )
  RETURNING to_jsonb(personel_islemleri.*) INTO v_result;
  
  -- Update shop statistics
  PERFORM update_shop_statistics();
  
  RETURN v_result;
END;
$$;

-- Create a function to update operation notes
CREATE OR REPLACE FUNCTION update_operation_notes(
  p_operation_id BIGINT,
  p_notes TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Update the notes
  UPDATE personel_islemleri
  SET notlar = p_notes
  WHERE id = p_operation_id
  RETURNING to_jsonb(personel_islemleri.*) INTO v_result;
  
  IF v_result IS NULL THEN
    RAISE EXCEPTION 'Operation not found';
  END IF;
  
  RETURN v_result;
END;
$$;

-- Create a function to add a photo to an operation
CREATE OR REPLACE FUNCTION add_operation_photo(
  p_operation_id BIGINT,
  p_photo_url TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_photos TEXT[];
  v_updated_photos TEXT[];
  v_result JSONB;
BEGIN
  -- Get current photos
  SELECT photos INTO v_current_photos
  FROM personel_islemleri
  WHERE id = p_operation_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Operation not found';
  END IF;
  
  -- Check if we already have 2 photos
  IF array_length(v_current_photos, 1) >= 2 THEN
    RAISE EXCEPTION 'Maximum of 2 photos allowed';
  END IF;
  
  -- Add the new photo
  v_updated_photos := array_append(v_current_photos, p_photo_url);
  
  -- Update the operation
  UPDATE personel_islemleri
  SET photos = v_updated_photos
  WHERE id = p_operation_id
  RETURNING to_jsonb(personel_islemleri.*) INTO v_result;
  
  RETURN v_result;
END;
$$;
