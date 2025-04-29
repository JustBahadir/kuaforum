
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.34.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    // Get params from request
    const { personnel_id } = await req.json()
    
    console.log("Recovering operations for personnel_id:", personnel_id)
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase environment variables are not set!");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Retrieve the personnel details to get their shop ID for proper isolation
    let dukkanId;
    
    if (personnel_id) {
      const { data: personelData, error: personelError } = await supabase
        .from('personel')
        .select('dukkan_id')
        .eq('id', personnel_id)
        .single();
        
      if (personelError) {
        throw new Error(`Error retrieving personnel: ${personelError.message}`);
      }
      
      if (!personelData.dukkan_id) {
        throw new Error("Personnel has no associated business");
      }
      
      dukkanId = personelData.dukkan_id;
    } else {
      // If no personnel ID provided, retrieve shop ID from request token
      const authHeader = req.headers.get('authorization') || '';
      const token = authHeader.split(' ')[1];
      
      if (!token) {
        throw new Error("No authorization token provided");
      }
      
      // Verify the token and get the user ID
      const { data: userData, error: userError } = await supabase.auth.getUser(token);
      
      if (userError || !userData) {
        throw new Error(`Error authenticating: ${userError?.message || "Unknown error"}`);
      }
      
      // Get the user's shop ID
      const { data: profileData } = await supabase
        .from('profiles')
        .select('dukkan_id')
        .eq('id', userData.user.id)
        .maybeSingle();
        
      if (!profileData?.dukkan_id) {
        throw new Error("User has no associated business");
      }
      
      dukkanId = profileData.dukkan_id;
    }
    
    console.log("Operating on dukkan_id:", dukkanId);
    
    // Get all completed appointments for the business (with optional personnel filter)
    const query = supabase
      .from('randevular')
      .select(`
        *,
        personel:personel_id(id, ad_soyad, prim_yuzdesi),
        islemler
      `)
      .eq('durum', 'tamamlandi')
      .eq('dukkan_id', dukkanId); // Important: filter by dukkan_id for proper isolation
    
    if (personnel_id) {
      query.eq('personel_id', personnel_id);
    }
    
    const { data: appointments, error: appointmentsError } = await query;
    
    if (appointmentsError) {
      throw new Error(`Error retrieving appointments: ${appointmentsError.message}`);
    }
    
    console.log(`Found ${appointments.length} completed appointments`);
    
    // Get existing operations to avoid duplicates
    const { data: existingOperations, error: existingError } = await supabase
      .from('personel_islemleri')
      .select('randevu_id')
      .in('randevu_id', appointments.map(app => app.id));
      
    if (existingError) {
      throw new Error(`Error retrieving existing operations: ${existingError.message}`);
    }
    
    const existingAppointmentIds = new Set(existingOperations.map(op => op.randevu_id));
    
    console.log(`Found ${existingOperations.length} existing operations`);
    
    // Filter appointments that don't have operations yet
    const newAppointments = appointments.filter(app => !existingAppointmentIds.has(app.id));
    
    console.log(`Processing ${newAppointments.length} new appointments`);
    
    // Create operations for each filtered appointment
    const operations = [];
    
    for (const appointment of newAppointments) {
      try {
        // Get service details for each service in the appointment
        const serviceIds = Array.isArray(appointment.islemler) ? appointment.islemler : 
          typeof appointment.islemler === 'object' ? Object.values(appointment.islemler) : [];
        
        for (const serviceId of serviceIds) {
          const { data: service, error: serviceError } = await supabase
            .from('islemler')
            .select('*')
            .eq('id', serviceId)
            .single();
            
          if (serviceError) {
            console.error(`Error retrieving service ${serviceId}: ${serviceError.message}`);
            continue;
          }
          
          const primYuzdesi = appointment.personel?.prim_yuzdesi || 0;
          const tutar = service?.fiyat || 0;
          const odenen = primYuzdesi > 0 ? (tutar * primYuzdesi / 100) : 0;
          
          operations.push({
            personel_id: appointment.personel_id,
            islem_id: serviceId,
            tutar: tutar,
            odenen: odenen,
            prim_yuzdesi: primYuzdesi,
            puan: service?.puan || 0,
            aciklama: service?.islem_adi || 'Bilinmeyen işlem',
            musteri_id: appointment.musteri_id,
            randevu_id: appointment.id,
            created_at: appointment.tarih + ' ' + appointment.saat,
            dukkan_id: dukkanId // Important: set dukkan_id for proper business isolation
          });
        }
      } catch (err) {
        console.error(`Error processing appointment ${appointment.id}:`, err);
      }
    }
    
    console.log(`Created ${operations.length} operation records`);
    
    // Insert operations if any
    if (operations.length > 0) {
      const { data: insertedOperations, error: insertError } = await supabase
        .from('personel_islemleri')
        .insert(operations);
        
      if (insertError) {
        throw new Error(`Error inserting operations: ${insertError.message}`);
      }
      
      console.log("Successfully inserted operations");
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        count: operations.length,
        operations: operations.slice(0, 10) // Only return a sample for debugging
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error("Error in function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      },
    )
  }
})
