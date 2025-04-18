
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get the request body
    const requestData = await req.json();
    const { action, email } = requestData;

    // Process different actions
    switch (action) {
      case "getUserRole": {
        if (!email) {
          return new Response(
            JSON.stringify({ error: "Email is required" }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400,
            }
          );
        }

        // Get user by email
        const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserByEmail(email);

        if (userError || !userData?.user) {
          return new Response(
            JSON.stringify({ error: "User not found", details: userError }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 404,
            }
          );
        }

        // Extract role from user metadata
        const role = userData.user.user_metadata?.role || "customer";

        return new Response(
          JSON.stringify({ role, user: userData.user }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      case "createProfile": {
        const { userId, firstName, lastName, phone, gender, role } = requestData;

        if (!userId || !firstName || !lastName || !role) {
          return new Response(
            JSON.stringify({ error: "Missing required fields" }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400,
            }
          );
        }

        // First update user metadata
        const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
          userId,
          {
            user_metadata: {
              first_name: firstName,
              last_name: lastName,
              phone,
              gender,
              role
            }
          }
        );

        if (updateError) {
          return new Response(
            JSON.stringify({ error: "Failed to update user metadata", details: updateError }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 500,
            }
          );
        }

        // Create or update profile record
        const { data: profileData, error: profileError } = await supabaseClient
          .from('profiles')
          .upsert({
            id: userId,
            first_name: firstName,
            last_name: lastName,
            phone,
            gender,
            role
          })
          .select();

        if (profileError) {
          return new Response(
            JSON.stringify({ error: "Failed to create profile", details: profileError }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 500,
            }
          );
        }

        return new Response(
          JSON.stringify({ success: true, profile: profileData[0] }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
