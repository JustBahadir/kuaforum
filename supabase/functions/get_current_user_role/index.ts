
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.32.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // CORS desteği
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Supabase istemcisini servis rolüyle başlat (RLS'yi bypass eder)
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Sunucu yapılandırma hatası. Eksik ortam değişkenleri." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Kullanıcı kimliğini doğrula
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Yetkilendirme başlığı bulunamadı" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Yetkisiz erişim", details: userError?.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // RLS politikalarını tamamen atlamak için kullanıcı metadata bilgisini kullan
    const userMetadata = user.user_metadata || {};
    let userRole = userMetadata.role || "customer";
    
    // Direkt sorgu ile (daha güvenli)
    try {
      const { data: profileData, error: profileError } = await supabaseClient
        .from("profiles")
        .select("role, first_name, last_name, phone, iban, gender")
        .eq("id", user.id)
        .maybeSingle();
      
      // Eğer profil veritabanında bulunduysa ve role bilgisi varsa, bunu kullan
      if (!profileError && profileData && profileData.role) {
        userRole = profileData.role;
        console.log("Profil veritabanından rol bilgisi alındı:", userRole);
      }
      
      // Personel bilgisini al (staff ve işletme sahibi için)
      const { data: personnelData, error: personnelError } = await supabaseClient
        .from("personel")
        .select("*, dukkanlar(*)")
        .eq("auth_id", user.id)
        .maybeSingle();
        
      // Profil bulunamadı, yeni oluştur
      if ((!profileData || profileError) && profileError?.code !== 'PGRST116') {
        console.log("Profil bulunamadı, yeni oluşturuluyor:", user.id);
        
        try {
          // auth.updateUser ile metadata güncelleme
          await supabaseClient.auth.admin.updateUserById(user.id, {
            user_metadata: {
              ...userMetadata,
              role: userRole,
              first_name: userMetadata.first_name || "",
              last_name: userMetadata.last_name || ""
            }
          });
          
          // Profil oluşturma
          const { data: newProfileData, error: insertError } = await supabaseClient
            .from("profiles")
            .insert({
              id: user.id,
              first_name: userMetadata.first_name || "",
              last_name: userMetadata.last_name || "",
              role: userRole
            })
            .select()
            .maybeSingle();
            
          if (insertError) {
            console.error("Profil oluşturma hatası:", insertError);
          }
          
          return new Response(
            JSON.stringify({
              role: userRole,
              userId: user.id,
              profile: {
                first_name: userMetadata.first_name || "",
                last_name: userMetadata.last_name || "",
                phone: userMetadata.phone || "",
                gender: userMetadata.gender || null
              },
              personnel: personnelData || null
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
          );
          
        } catch (createError) {
          console.error("Profil oluşturma hatası:", createError);
          
          // Fallback yanıt döndür
          return new Response(
            JSON.stringify({
              role: userRole,
              userId: user.id,
              error: "Profil oluşturulamadı",
              personnel: personnelData || null
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
          );
        }
      }
      
      // Başarılı yanıt
      return new Response(
        JSON.stringify({
          role: userRole,
          userId: user.id,
          profile: profileData || {
            first_name: userMetadata.first_name || "",
            last_name: userMetadata.last_name || "",
            phone: userMetadata.phone || "",
            gender: userMetadata.gender || null
          },
          personnel: personnelData || null,
          dukkan: personnelData?.dukkanlar || null
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
      
    } catch (error) {
      console.error("get_current_user_role işleminde hata:", error);
      
      // Metadata'ya dayalı fallback yanıt
      return new Response(
        JSON.stringify({
          role: userRole,
          userId: user.id,
          profile: {
            first_name: userMetadata.first_name || "",
            last_name: userMetadata.last_name || "",
            phone: userMetadata.phone || "",
            gender: userMetadata.gender || null
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
  } catch (error) {
    console.error("get_current_user_role işlevinde genel hata:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Bilinmeyen hata" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
