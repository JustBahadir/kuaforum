
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

// CORS headers for the function
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create a Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  
  try {
    const { customer_id } = await req.json();
    
    if (!customer_id) {
      return new Response(
        JSON.stringify({ error: "Customer ID is required" }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          } 
        }
      );
    }
    
    console.log(`Processing operations recovery for customer ID: ${customer_id}`);
    
    // First, get all completed appointments for this customer
    const { data: appointments, error: appointmentError } = await supabase
      .from('randevular')
      .select('id, tarih, saat, personel_id, islemler, notlar')
      .eq('musteri_id', customer_id)
      .eq('durum', 'tamamlandi');
      
    if (appointmentError) {
      console.error("Error fetching appointments:", appointmentError);
      return new Response(
        JSON.stringify({ error: "Error fetching customer appointments", details: appointmentError }),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          } 
        }
      );
    }
    
    if (!appointments || appointments.length === 0) {
      return new Response(
        JSON.stringify({ success: true, count: 0, message: "No completed appointments found" }),
        { 
          status: 200, 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          } 
        }
      );
    }
    
    console.log(`Found ${appointments.length} completed appointments`);
    
    // Process each appointment
    const operations = [];
    
    for (const appointment of appointments) {
      try {
        // Call the process_completed_appointment function for each appointment
        const { data, error } = await supabase
          .rpc('process_completed_appointment', { appointment_id: appointment.id });
          
        if (error) {
          console.error(`Error processing appointment ${appointment.id}:`, error);
        } else if (data) {
          operations.push(...data);
        }
      } catch (error) {
        console.error(`Error processing appointment ${appointment.id}:`, error);
      }
    }
    
    // Force update shop statistics
    await supabase.rpc('update_shop_statistics');
    
    return new Response(
      JSON.stringify({
        success: true,
        count: operations.length,
        message: `Successfully processed ${operations.length} operations`
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
    
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Server error", details: String(error) }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});
