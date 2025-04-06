
-- Function to recover operations for a specific customer's appointments
CREATE OR REPLACE FUNCTION public.recover_customer_appointments(p_customer_id bigint)
RETURNS TABLE(
  id bigint,
  tarih text,
  saat text,
  personel_id bigint,
  musteri_id bigint,
  durum text,
  notlar text,
  created_at timestamptz,
  service_name text,
  personnel_name text,
  amount numeric,
  points numeric
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.tarih::text,
    r.saat::text,
    r.personel_id,
    r.musteri_id,
    r.durum,
    r.notlar,
    r.created_at,
    CASE 
      WHEN jsonb_array_length(r.islemler) > 0 THEN
        (SELECT i.islem_adi FROM islemler i WHERE i.id = (r.islemler->>0)::bigint)
      ELSE 'Randevu'
    END AS service_name,
    (SELECT p.ad_soyad FROM personel p WHERE p.id = r.personel_id) AS personnel_name,
    COALESCE(
      (SELECT SUM(i.fiyat) 
       FROM islemler i 
       WHERE i.id = ANY(SELECT jsonb_array_elements_text(r.islemler)::bigint)),
      0
    ) AS amount,
    COALESCE(
      (SELECT SUM(i.puan) 
       FROM islemler i 
       WHERE i.id = ANY(SELECT jsonb_array_elements_text(r.islemler)::bigint)),
      0
    ) AS points
  FROM randevular r
  WHERE r.musteri_id = p_customer_id
  AND r.durum = 'tamamlandi'
  ORDER BY r.created_at DESC;
END;
$$;

-- Function to process a completed appointment
CREATE OR REPLACE FUNCTION public.process_completed_appointment(appointment_id bigint)
RETURNS SETOF personel_islemleri
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_appointment randevular;
  v_service record;
  v_service_id bigint;
  v_personnel_commission numeric;
  v_amount numeric;
  v_points numeric;
  v_commission_amount numeric;
  v_customer_name text;
  v_operation_id bigint;
  v_personnel_name text;
BEGIN
  -- Get appointment details
  SELECT * INTO v_appointment 
  FROM randevular 
  WHERE id = appointment_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Appointment not found: %', appointment_id;
  END IF;
  
  -- Mark appointment as completed if not already
  IF v_appointment.durum <> 'tamamlandi' THEN
    UPDATE randevular SET durum = 'tamamlandi' WHERE id = appointment_id;
  END IF;
  
  -- Get customer name
  SELECT 
    CONCAT(first_name, ' ', last_name) INTO v_customer_name
  FROM musteriler
  WHERE id = v_appointment.musteri_id;
  
  IF v_customer_name IS NULL THEN
    v_customer_name := 'Belirtilmemiş';
  END IF;
  
  -- Get personnel commission rate
  SELECT 
    ad_soyad, prim_yuzdesi INTO v_personnel_name, v_personnel_commission
  FROM personel
  WHERE id = v_appointment.personel_id;
  
  IF v_personnel_commission IS NULL THEN
    v_personnel_commission := 0;
  END IF;
  
  -- Process each service in the appointment
  FOR v_service_id IN 
    SELECT jsonb_array_elements_text(v_appointment.islemler)::bigint
  LOOP
    -- Get service details
    SELECT 
      id, islem_adi, fiyat, puan INTO v_service
    FROM islemler
    WHERE id = v_service_id;
    
    IF NOT FOUND THEN
      CONTINUE; -- Skip if service not found
    END IF;
    
    v_amount := v_service.fiyat;
    v_points := v_service.puan;
    v_commission_amount := (v_amount * v_personnel_commission) / 100;
    
    -- Check if operation already exists
    SELECT id INTO v_operation_id
    FROM personel_islemleri
    WHERE 
      randevu_id = appointment_id AND
      islem_id = v_service_id AND
      personel_id = v_appointment.personel_id;
      
    IF FOUND THEN
      -- Update existing operation
      UPDATE personel_islemleri
      SET 
        tutar = v_amount,
        puan = v_points,
        prim_yuzdesi = v_personnel_commission,
        odenen = v_commission_amount,
        aciklama = CONCAT(v_service.islem_adi, ' hizmeti verildi - ', v_customer_name, ' (Randevu #', appointment_id, ')'),
        notlar = v_appointment.notlar
      WHERE id = v_operation_id
      RETURNING * INTO v_service;
    ELSE
      -- Create new operation
      INSERT INTO personel_islemleri (
        personel_id,
        islem_id,
        tutar,
        puan,
        prim_yuzdesi,
        odenen,
        musteri_id,
        randevu_id,
        aciklama,
        notlar
      ) VALUES (
        v_appointment.personel_id,
        v_service_id,
        v_amount,
        v_points,
        v_personnel_commission,
        v_commission_amount,
        v_appointment.musteri_id,
        appointment_id,
        CONCAT(v_service.islem_adi, ' hizmeti verildi - ', v_customer_name, ' (Randevu #', appointment_id, ')'),
        v_appointment.notlar
      );
    END IF;
    
    RETURN QUERY
    SELECT * FROM personel_islemleri
    WHERE randevu_id = appointment_id
    ORDER BY created_at DESC;
  END LOOP;

  -- Update shop statistics
  PERFORM update_shop_statistics();
  
  -- If no operations were created (which shouldn't happen if the appointment has services)
  RETURN;
END;
$$;
