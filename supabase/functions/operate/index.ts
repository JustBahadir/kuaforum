
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
    const { 
      personel_id,
      musteri_id,
      islem_id,
      tutar,
      puan,
      prim_yuzdesi,
      odenen,
      aciklama,
      notlar,
      photos
    } = await req.json();
    
    if (!personel_id || !musteri_id || !islem_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          } 
        }
      );
    }
    
    // Insert the operation record
    const { data, error } = await supabase
      .from("personel_islemleri")
      .insert([
        {
          personel_id,
          musteri_id,
          islem_id,
          tutar,
          puan,
          prim_yuzdesi,
          odenen,
          aciklama,
          notlar,
          photos: photos || []
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error inserting operation:", error);
      return new Response(
        JSON.stringify({ error: "Error inserting operation", details: error }),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          } 
        }
      );
    }
    
    // Update shop statistics
    await supabase.rpc("update_shop_statistics");
    
    return new Response(
      JSON.stringify({ success: true, data }),
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
