
-- recover_customer_appointments fonksiyonu oluşturuluyor
CREATE OR REPLACE FUNCTION public.recover_customer_appointments(p_customer_id bigint)
RETURNS TABLE (
  id bigint,
  tarih date,
  saat time without time zone,
  durum text,
  notlar text,
  personel_id bigint,
  islemler jsonb,
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
    r.tarih,
    r.saat,
    r.durum,
    r.notlar,
    r.personel_id,
    r.islemler,
    -- Hizmet adını json içindeki ilk işlem için getir
    (SELECT i.islem_adi FROM islemler i WHERE i.id = (r.islemler->>0)::bigint LIMIT 1) as service_name,
    -- Personel adını getir
    (SELECT p.ad_soyad FROM personel p WHERE p.id = r.personel_id) as personnel_name,
    -- İşlem tutarını getir
    (SELECT i.fiyat FROM islemler i WHERE i.id = (r.islemler->>0)::bigint LIMIT 1) as amount,
    -- İşlem puanını getir
    (SELECT i.puan FROM islemler i WHERE i.id = (r.islemler->>0)::bigint LIMIT 1) as points
  FROM 
    randevular r
  WHERE 
    r.musteri_id = p_customer_id
    AND r.durum = 'tamamlandi'
  ORDER BY 
    r.tarih DESC, r.saat DESC;
END;
$$;

-- Edge fonksiyonu için ihtiyaç duyulan trigger fonksiyonu
CREATE OR REPLACE FUNCTION public.process_completed_appointment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Randevu tamamlandıysa işlemler oluştur
  IF NEW.durum = 'tamamlandi' AND OLD.durum != 'tamamlandi' THEN
    -- İşlemleri oluştur
    INSERT INTO personel_islemleri (
      personel_id,
      islem_id,
      tutar,
      odenen,
      prim_yuzdesi,
      puan,
      aciklama,
      musteri_id,
      randevu_id,
      created_at
    )
    SELECT
      NEW.personel_id,
      (jsonb_array_elements_text(NEW.islemler))::bigint as islem_id,
      i.fiyat,
      i.fiyat, -- Varsayılan olarak tam ödeme
      COALESCE(p.prim_yuzdesi, 0),
      i.puan,
      i.islem_adi,
      NEW.musteri_id,
      NEW.id,
      NEW.tarih + NEW.saat
    FROM
      islemler i
    LEFT JOIN
      personel p ON p.id = NEW.personel_id
    WHERE
      i.id IN (SELECT (jsonb_array_elements_text(NEW.islemler))::bigint);
  END IF;

  RETURN NEW;
END;
$$;

-- Tamamlanan randevular için trigger
DROP TRIGGER IF EXISTS on_appointment_completed ON randevular;
CREATE TRIGGER on_appointment_completed
  AFTER UPDATE ON randevular
  FOR EACH ROW
  EXECUTE FUNCTION process_completed_appointment();
