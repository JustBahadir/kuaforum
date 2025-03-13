
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.32.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role to bypass RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration error. Missing environment variables." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get the user id from the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", details: userError?.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Try to directly get the user's role using a simple query without recursion
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("role, first_name, last_name, phone, iban")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      
      // Fall back to returning basic info from user metadata
      return new Response(
        JSON.stringify({ 
          role: user.user_metadata?.role || "customer",
          userId: user.id,
          first_name: user.user_metadata?.first_name || "",
          last_name: user.user_metadata?.last_name || "",
          iban: user.user_metadata?.iban || null
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    if (!profile) {
      // If no profile found, create one with basic role
      console.log("No profile found for user", user.id, "creating a new one");
      
      try {
        const { data: newProfile, error: insertError } = await supabaseClient
          .from("profiles")
          .insert({
            id: user.id,
            first_name: user.user_metadata?.first_name || "",
            last_name: user.user_metadata?.last_name || "",
            role: user.user_metadata?.role || "customer"
          })
          .select("role")
          .single();
          
        if (insertError) {
          console.error("Error creating profile:", insertError);
          throw insertError;
        }
        
        return new Response(
          JSON.stringify({ 
            role: newProfile.role || "customer",
            userId: user.id
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      } catch (createError) {
        console.error("Error in profile creation:", createError);
        
        return new Response(
          JSON.stringify({ 
            role: "customer", // Default fallback
            userId: user.id,
            error: "Failed to create profile"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
    }

    // Also get personnel information if available
    const { data: personnelData } = await supabaseClient
      .from("personel")
      .select("*")
      .eq("auth_id", user.id)
      .maybeSingle();

    return new Response(
      JSON.stringify({ 
        role: profile.role || "customer",
        userId: user.id,
        profile: {
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          iban: profile.iban
        },
        personnel: personnelData || null
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error in get_current_user_role function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
