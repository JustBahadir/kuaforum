
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

// Supabase client setup
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { customer_id, personnel_id, get_all_shop_operations } = await req.json();

    if (!customer_id && !personnel_id && !get_all_shop_operations) {
      return new Response(
        JSON.stringify({ error: 'Either customer_id, personnel_id, or get_all_shop_operations is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log(`Processing request for ${customer_id ? 'customer ID ' + customer_id : personnel_id ? 'personnel ID ' + personnel_id : 'all shop operations'}...`);

    // Get appointments based on provided parameters
    let appointments;
    let appointmentsError;

    if (customer_id) {
      // For customer operations
      const result = await supabase
        .from('randevular')
        .select(`
          id, 
          tarih, 
          saat, 
          durum,
          notlar,
          personel_id, 
          musteri_id,
          personel:personel_id (id, ad_soyad),
          islemler
        `)
        .eq('musteri_id', customer_id)
        .eq('durum', 'tamamlandi');

      appointments = result.data;
      appointmentsError = result.error;
    } else if (personnel_id) {
      // For personnel operations
      const result = await supabase
        .from('randevular')
        .select(`
          id, 
          tarih, 
          saat, 
          durum,
          notlar,
          personel_id,
          musteri_id,
          personel:personel_id (id, ad_soyad, prim_yuzdesi),
          musteri:musteri_id (id, first_name, last_name),
          islemler
        `)
        .eq('personel_id', personnel_id)
        .eq('durum', 'tamamlandi');

      appointments = result.data;
      appointmentsError = result.error;
    } else if (get_all_shop_operations) {
      // For all shop operations
      const result = await supabase
        .from('randevular')
        .select(`
          id, 
          tarih, 
          saat, 
          durum,
          notlar,
          personel_id,
          musteri_id,
          personel:personel_id (id, ad_soyad, prim_yuzdesi),
          musteri:musteri_id (id, first_name, last_name),
          islemler
        `)
        .eq('durum', 'tamamlandi')
        .order('tarih', { ascending: false })
        .order('saat', { ascending: false });

      appointments = result.data;
      appointmentsError = result.error;
    }

    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError);
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
        JSON.stringify({ message: 'No completed appointments found', count: 0 }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    console.log(`Found ${appointments.length} completed appointments`);

    // Array to store operations
    const operations = [];

    // Create personnel operations for each appointment
    for (const appointment of appointments) {
      // Check appointment services
      if (!appointment.islemler || !Array.isArray(appointment.islemler) || appointment.islemler.length === 0) {
        console.log(`No service information found for appointment ${appointment.id}`);
        continue;
      }

      // Process each service ID
      for (const islemId of appointment.islemler) {
        const { data: islem, error: islemError } = await supabase
          .from('islemler')
          .select('*')
          .eq('id', islemId)
          .single();

        if (islemError) {
          console.error(`Error fetching service ID ${islemId}:`, islemError);
          continue;
        }

        if (!islem) {
          console.log(`Service ID ${islemId} not found`);
          continue;
        }

        // Get personnel commission percentage
        let primYuzdesi = 0;
        if (appointment.personel && appointment.personel.prim_yuzdesi) {
          primYuzdesi = appointment.personel.prim_yuzdesi;
        } else if (appointment.personel_id) {
          const { data: personelData } = await supabase
            .from('personel')
            .select('prim_yuzdesi')
            .eq('id', appointment.personel_id)
            .single();

          if (personelData) {
            primYuzdesi = personelData.prim_yuzdesi || 0;
          }
        }

        // Create operation data
        const operationData = {
          personel_id: appointment.personel_id,
          islem_id: islem.id,
          musteri_id: appointment.musteri_id,
          tutar: islem.fiyat || 0,
          odenen: islem.fiyat || 0, // Default to full payment
          prim_yuzdesi: primYuzdesi,
          puan: islem.puan || 0,
          aciklama: islem.islem_adi || 'Service',
          notlar: appointment.notlar || '',
          randevu_id: appointment.id,
          created_at: `${appointment.tarih}T${appointment.saat || '00:00:00'}`
        };

        // Check if operation record exists
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
            console.error('Error creating operation record:', operationError);
          } else if (newOperation) {
            operations.push(newOperation[0]);
            console.log(`Created operation record for appointment ${appointment.id}, service ${islem.islem_adi}`);
          }
        } else {
          console.log(`Operation record already exists for appointment ${appointment.id}, service ${islem.islem_adi}`);
        }
      }
    }

    // Force update shop statistics after creating new operations
    try {
      await supabase.rpc('update_shop_statistics');
      console.log("Shop statistics updated successfully");
    } catch (statsError) {
      console.error("Error updating shop statistics:", statsError);
    }

    // Get all personel_islemleri if requested for all shop operations
    let allOperations = operations;
    if (get_all_shop_operations) {
      const { data: existingOperations, error: operationsError } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          personel:personel_id(*),
          musteri:musteri_id(*),
          islem:islem_id(*)
        `)
        .order('created_at', { ascending: false });
        
      if (!operationsError) {
        allOperations = existingOperations;
      }
    }

    return new Response(
      JSON.stringify({
        message: `${operations.length} operations created, ${allOperations.length} operations returned`,
        count: allOperations.length,
        operations: allOperations
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
