
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

// CORS headers
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
    const { islemId, personelId, customerId, tutar, puan, notlar } = await req.json();

    if (!islemId || !personelId || !customerId) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          } 
        }
      );
    }

    // Get the service information
    const { data: islemData } = await supabase
      .from("islemler")
      .select("islem_adi, fiyat, puan")
      .eq("id", islemId)
      .single();

    if (!islemData) {
      return new Response(
        JSON.stringify({ message: "İşlem bulunamadı" }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          } 
        }
      );
    }

    // Calculate commission percentage based on personnel info
    const { data: personelData } = await supabase
      .from("personel")
      .select("prim_yuzdesi")
      .eq("id", personelId)
      .single();

    if (!personelData) {
      return new Response(
        JSON.stringify({ message: "Personel bulunamadı" }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          } 
        }
      );
    }

    // Calculate commission
    const primYuzdesi = personelData.prim_yuzdesi || 0;
    const odenen = (tutar * primYuzdesi) / 100;

    // Insert the operation record
    const { data, error } = await supabase
      .from("personel_islemleri")
      .insert([
        {
          personel_id: personelId,
          musteri_id: customerId,
          islem_id: islemId,
          tutar: tutar,
          puan: puan,
          prim_yuzdesi: primYuzdesi,
          odenen: odenen,
          aciklama: islemData.islem_adi,
          notlar: notlar || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error adding operation:", error);
      return new Response(
        JSON.stringify({ message: "İşlem eklenirken bir hata oluştu", error }),
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
      JSON.stringify(data),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error) {
    console.error("Error in add-operation API:", error);
    return new Response(
      JSON.stringify({ message: "Internal server error" }),
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
