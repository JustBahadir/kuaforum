
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

// Supabase istemcisini oluştur
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // CORS preflight isteğini işle
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Supabase istemcisini oluştur
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // İstek gövdesini JSON olarak ayrıştır
    const { customer_id } = await req.json();

    if (!customer_id) {
      return new Response(
        JSON.stringify({ error: 'Müşteri ID gerekli' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log(`Müşteri ID ${customer_id} için tamamlanmış randevular işleniyor...`);

    // Müşterinin tamamlanmış randevularını getir
    const { data: appointments, error: appointmentsError } = await supabase
      .from('randevular')
      .select(`
        id, 
        tarih, 
        saat, 
        durum,
        notlar,
        personel_id, 
        personel:personel_id (id, ad_soyad),
        islemler
      `)
      .eq('musteri_id', customer_id)
      .eq('durum', 'tamamlandi');

    if (appointmentsError) {
      console.error('Randevu getirme hatası:', appointmentsError);
      return new Response(
        JSON.stringify({ error: appointmentsError.message }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    if (!appointments || appointments.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Tamamlanmış randevu bulunamadı', count: 0 }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    console.log(`${appointments.length} tamamlanmış randevu bulundu`);

    // İşlemleri saklamak için dizi
    const operations = [];

    // Her randevu için personel işlemleri oluştur
    for (const appointment of appointments) {
      // Randevu içindeki işlemleri kontrol et
      if (!appointment.islemler || !Array.isArray(appointment.islemler) || appointment.islemler.length === 0) {
        console.log(`Randevu ${appointment.id} için işlem bilgisi bulunamadı`);
        continue;
      }

      // Her işlem ID'si için hizmet bilgilerini getir
      for (const islemId of appointment.islemler) {
        const { data: islem, error: islemError } = await supabase
          .from('islemler')
          .select('*')
          .eq('id', islemId)
          .single();

        if (islemError) {
          console.error(`İşlem ID ${islemId} bilgisi alınamadı:`, islemError);
          continue;
        }

        if (!islem) {
          console.log(`İşlem ID ${islemId} bulunamadı`);
          continue;
        }

        // Personel işlemi oluştur
        const operationData = {
          personel_id: appointment.personel_id,
          islem_id: islem.id,
          musteri_id: customer_id,
          tutar: islem.fiyat || 0,
          odenen: islem.fiyat || 0, // Varsayılan olarak tam ödeme
          prim_yuzdesi: 0, // Prim değeri personel tablosundan alınabilir
          puan: islem.puan || 0,
          aciklama: islem.islem_adi || 'İşlem',
          notlar: appointment.notlar || '',
          randevu_id: appointment.id,
          created_at: `${appointment.tarih}T${appointment.saat || '00:00:00'}`
        };

        // Personel primini kontrol et
        if (appointment.personel && appointment.personel.id) {
          const { data: personelData } = await supabase
            .from('personel')
            .select('prim_yuzdesi')
            .eq('id', appointment.personel.id)
            .single();

          if (personelData) {
            operationData.prim_yuzdesi = personelData.prim_yuzdesi || 0;
          }
        }

        // İşlem kaydını eklemeye çalış - aynı randevu ID ile kayıt varsa ekleme
        const { data: existingOperation } = await supabase
          .from('personel_islemleri')
          .select('id')
          .eq('randevu_id', appointment.id)
          .eq('islem_id', islem.id)
          .maybeSingle();

        if (!existingOperation) {
          const { data: newOperation, error: operationError } = await supabase
            .from('personel_islemleri')
            .insert(operationData)
            .select();

          if (operationError) {
            console.error('İşlem kaydı oluşturma hatası:', operationError);
          } else if (newOperation) {
            operations.push(newOperation[0]);
            console.log(`Randevu ${appointment.id} için işlem kaydı oluşturuldu`);
          }
        } else {
          console.log(`Randevu ${appointment.id} için işlem kaydı zaten mevcut`);
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: `${operations.length} işlem kaydedildi`,
        count: operations.length,
        operations
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Beklenmeyen hata:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
