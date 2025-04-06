
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

// Create a Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  try {
    // Extract appointment ID from request body
    const { appointment_id } = await req.json();
    
    if (!appointment_id) {
      return new Response(
        JSON.stringify({ error: "Appointment ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Get appointment details
    const { data: appointment, error: appointmentError } = await supabase
      .from('randevular')
      .select(`
        *,
        personel:personel_id(*),
        musteri:musteri_id(*)
      `)
      .eq('id', appointment_id)
      .single();
      
    if (appointmentError || !appointment) {
      console.error("Error fetching appointment:", appointmentError);
      return new Response(
        JSON.stringify({ error: "Could not fetch appointment details", details: appointmentError }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Update appointment status if not already completed
    if (appointment.durum !== "tamamlandi") {
      const { error: updateError } = await supabase
        .from('randevular')
        .update({ durum: "tamamlandi" })
        .eq('id', appointment_id);
        
      if (updateError) {
        console.error("Error updating appointment status:", updateError);
        return new Response(
          JSON.stringify({ error: "Error updating appointment status", details: updateError }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }
    
    // Get service details for all services in the appointment
    const islemIds = Array.isArray(appointment.islemler) ? appointment.islemler : [];
    if (islemIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "No services found in appointment" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const { data: services, error: servicesError } = await supabase
      .from('islemler')
      .select('*')
      .in('id', islemIds);
      
    if (servicesError) {
      console.error("Error fetching services:", servicesError);
      return new Response(
        JSON.stringify({ error: "Error fetching service details", details: servicesError }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Get personnel commission rate
    const personnelData = appointment.personel;
    const primYuzdesi = personnelData?.prim_yuzdesi || 0;
    
    // Create personnel operations for each service
    const operations = [];
    for (const service of services) {
      const tutar = parseFloat(service.fiyat) || 0;
      const puan = parseInt(service.puan) || 0;
      const odenenPrim = (tutar * primYuzdesi) / 100;
      
      // Check if operation already exists
      const { data: existingOps } = await supabase
        .from('personel_islemleri')
        .select('id')
        .eq('randevu_id', appointment_id)
        .eq('islem_id', service.id)
        .eq('personel_id', appointment.personel_id);
      
      let operationResult;
      
      // Customer name for the description
      const customerName = appointment.musteri 
        ? `${appointment.musteri.first_name || ''} ${appointment.musteri.last_name || ''}`.trim() 
        : "Belirtilmemiş";
        
      if (existingOps && existingOps.length > 0) {
        // Update existing operation
        const { data, error } = await supabase
          .from('personel_islemleri')
          .update({
            tutar: tutar,
            puan: puan,
            prim_yuzdesi: primYuzdesi,
            odenen: odenenPrim,
            aciklama: `${service.islem_adi} hizmeti verildi - ${customerName} (Randevu #${appointment_id})`,
            notlar: appointment.notlar || ''
          })
          .eq('id', existingOps[0].id)
          .select();
          
        if (error) {
          console.error("Error updating operation:", error);
        } else {
          operationResult = data[0];
          operations.push(operationResult);
        }
      } else {
        // Create new operation
        const { data, error } = await supabase
          .from('personel_islemleri')
          .insert([{
            personel_id: appointment.personel_id,
            islem_id: service.id,
            tutar: tutar,
            puan: puan,
            prim_yuzdesi: primYuzdesi,
            odenen: odenenPrim,
            musteri_id: appointment.musteri_id,
            randevu_id: appointment_id,
            aciklama: `${service.islem_adi} hizmeti verildi - ${customerName} (Randevu #${appointment_id})`,
            notlar: appointment.notlar || ''
          }])
          .select();
          
        if (error) {
          console.error("Error creating operation:", error);
        } else if (data && data.length > 0) {
          operationResult = data[0];
          operations.push(operationResult);
        }
      }
    }
    
    // Force update shop statistics
    await supabase.rpc('update_shop_statistics');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Appointment completed successfully", 
        operations: operations 
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error processing appointment:", error);
    return new Response(
      JSON.stringify({ error: "Server error processing appointment", details: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
