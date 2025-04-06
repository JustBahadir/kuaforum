
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
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { operationId, photoUrl } = await req.json();
    
    if (!operationId || !photoUrl) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get the current operation to check if it has existing photos
    const { data: currentOperation, error: fetchError } = await supabase
      .from("personel_islemleri")
      .select("photos")
      .eq("id", operationId)
      .single();
      
    if (fetchError) {
      console.error("Error fetching operation:", fetchError);
      return new Response(
        JSON.stringify({ message: "İşlem bilgisi alınırken bir hata oluştu", error: fetchError }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Prepare the updated photos array
    const existingPhotos = currentOperation?.photos || [];
    
    // Check if we already have 2 photos
    if (existingPhotos.length >= 2) {
      return new Response(
        JSON.stringify({ message: "En fazla 2 fotoğraf eklenebilir" }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const updatedPhotos = [...existingPhotos, photoUrl];
    
    // Update the operation with the new photo
    const { data, error: updateError } = await supabase
      .from("personel_islemleri")
      .update({ photos: updatedPhotos })
      .eq("id", operationId)
      .select()
      .single();
      
    if (updateError) {
      console.error("Error adding operation photo:", updateError);
      return new Response(
        JSON.stringify({ message: "Fotoğraf eklenirken bir hata oluştu", error: updateError }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify(data), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error in add-operation-photo function:", error);
    return new Response(
      JSON.stringify({ message: "Internal server error" }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})
