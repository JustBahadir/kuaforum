
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { customerId } = await req.json();
    
    if (!customerId) {
      return new Response(
        JSON.stringify({ message: "Missing customer ID" }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Attempting to recover operations for customer ID: ${customerId}`);
    
    // Call the database function to recover operations
    const { data, error } = await supabase.rpc('recover_operations_from_customer_appointments', { 
      p_customer_id: Number(customerId)
    });
    
    if (error) {
      console.error("Error recovering operations:", error);
      return new Response(
        JSON.stringify({ message: "İşlemler kurtarılırken bir hata oluştu", error }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "İşlemler başarıyla kurtarıldı", 
        data 
      }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error in recover_customer_operations function:", error);
    return new Response(
      JSON.stringify({ message: "Internal server error" }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})
