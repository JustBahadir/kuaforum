
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.32.0";

// Handle CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }
  
  try {
    // Get request body
    const { customer_id, personnel_id, get_all_shop_operations } = await req.json();
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log("Supabase client created successfully");
    
    // Query parameters
    let queryParams: any = {};
    
    if (customer_id) {
      queryParams.musteri_id = customer_id;
      console.log(`Processing operations for customer ID: ${customer_id}`);
    } else if (personnel_id) {
      queryParams.personel_id = personnel_id;
      console.log(`Processing operations for personnel ID: ${personnel_id}`);
    } else if (get_all_shop_operations) {
      // For shop-wide operations, we don't filter by customer or personnel
      queryParams = {};
      console.log("Processing all shop operations");
    } else {
      throw new Error("Either customer_id, personnel_id, or get_all_shop_operations must be provided");
    }
    
    // Find completed appointments
    const { data: appointments, error: appointmentsError } = await supabase
      .from('randevular')
      .select(`
        id,
        musteri_id,
        personel_id,
        islemler,
        tarih,
        saat,
        durum,
        notlar,
        personel:personel_id(ad_soyad, prim_yuzdesi)
      `)
      .eq('durum', 'tamamlandi')
      .order('tarih', { ascending: false });
    
    if (appointmentsError) {
      throw appointmentsError;
    }
    
    console.log(`Found ${appointments?.length || 0} completed appointments`);

    // Filter appointments based on queryParams if needed
    let filteredAppointments = appointments || [];
    if (customer_id) {
      filteredAppointments = filteredAppointments.filter(app => app.musteri_id === Number(customer_id));
    } else if (personnel_id) {
      filteredAppointments = filteredAppointments.filter(app => app.personel_id === Number(personnel_id));
    }
    
    console.log(`Filtered to ${filteredAppointments.length} appointments`);
    
    // Get service details for all services in appointments
    const allServiceIds = new Set<number>();
    filteredAppointments.forEach(app => {
      if (app.islemler && Array.isArray(JSON.parse(app.islemler))) {
        JSON.parse(app.islemler).forEach(serviceId => {
          allServiceIds.add(Number(serviceId));
        });
      }
    });
    
    const serviceIds = Array.from(allServiceIds);
    const { data: services, error: servicesError } = await supabase
      .from('islemler')
      .select('id, islem_adi, fiyat, puan')
      .in('id', serviceIds);
    
    if (servicesError) {
      throw servicesError;
    }
    
    console.log(`Retrieved ${services?.length || 0} services`);
    
    // Get existing operations to prevent duplicates
    const { data: existingOperations, error: opsError } = await supabase
      .from('personel_islemleri')
      .select('randevu_id');
      
    if (opsError) {
      throw opsError;
    }
    
    const existingOperationIds = new Set(existingOperations?.map(op => op.randevu_id) || []);
    console.log(`Found ${existingOperationIds.size} existing operations`);
    
    // Process each appointment
    const processedAppointments = [];
    const operations = [];
    let countProcessed = 0;
    
    // Process each appointment
    for (const appointment of filteredAppointments) {
      // Skip if operation already exists for this appointment
      if (existingOperationIds.has(appointment.id)) {
        console.log(`Skipping already processed appointment ID ${appointment.id}`);
        continue;
      }
      
      try {
        // Get customer info
        const { data: customer } = await supabase
          .from('musteriler')
          .select('first_name, last_name')
          .eq('id', appointment.musteri_id)
          .maybeSingle();
        
        // Get personnel commission percentage
        const primYuzdesi = appointment.personel?.prim_yuzdesi || 0;
        
        // Get the date-time for the operation
        const appointmentDateTime = new Date(`${appointment.tarih}T${appointment.saat}`);
        
        // Process each service in the appointment
        const parsedServices = JSON.parse(appointment.islemler || '[]');
        
        if (Array.isArray(parsedServices) && parsedServices.length > 0) {
          for (const serviceId of parsedServices) {
            const service = services?.find(s => s.id === Number(serviceId));
            
            if (service) {
              // Create operation record
              const operation = {
                personel_id: appointment.personel_id,
                islem_id: service.id,
                tutar: service.fiyat,
                odenen: service.fiyat * (primYuzdesi / 100), // Calculate commission
                prim_yuzdesi: primYuzdesi,
                puan: service.puan,
                aciklama: service.islem_adi,
                musteri_id: appointment.musteri_id,
                randevu_id: appointment.id,
                created_at: appointmentDateTime.toISOString(),
                notlar: appointment.notlar || null,
                photos: [] // Initialize with empty photos array
              };
              
              operations.push(operation);
            } else {
              console.warn(`Service ID ${serviceId} not found`);
            }
          }
        } else {
          console.warn(`No valid services found for appointment ID ${appointment.id}`);
        }
        
        processedAppointments.push(appointment.id);
        countProcessed++;
      } catch (error) {
        console.error(`Error processing appointment ID ${appointment.id}:`, error);
      }
    }
    
    // Insert operations in batches
    let insertedCount = 0;
    if (operations.length > 0) {
      // Insert all operations at once
      const { data: insertedData, error: insertError } = await supabase
        .from('personel_islemleri')
        .insert(operations)
        .select();
        
      if (insertError) {
        console.error("Error inserting operations:", insertError);
        throw insertError;
      }
      
      insertedCount = insertedData?.length || 0;
      console.log(`Inserted ${insertedCount} operations`);
    }
    
    // Update shop statistics
    try {
      await supabase.rpc('update_shop_statistics');
      console.log("Shop statistics updated");
    } catch (error) {
      console.warn("Failed to update shop statistics:", error);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        count: insertedCount,
        processed: countProcessed,
        operations: operations
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
