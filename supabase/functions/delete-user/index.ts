
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Sadece POST isteklerini kabul et
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Sadece POST istekleri kabul edilir' }), { 
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    // Service role key ile admin yetkilerine sahip bir Supabase client oluştur
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Request body'den email al
    const { email } = await req.json();
    
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email parametresi gereklidir' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`${email} adresli kullanıcı siliniyor...`);
    
    // Önce kullanıcıyı bul
    const { data: users, error: findError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (findError) {
      console.error("Kullanıcı listesi alınamadı:", findError);
      return new Response(JSON.stringify({ error: 'Kullanıcı listesi alınamadı' }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Email ile eşleşen kullanıcıyı bul
    const targetUser = users.users.find(user => user.email?.toLowerCase() === email.toLowerCase());
    
    if (!targetUser) {
      return new Response(JSON.stringify({ error: 'Belirtilen email ile kullanıcı bulunamadı' }), { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // İlişkili profil kaydını sil (profil tablosu varsa)
    try {
      const { error: profileDeleteError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', targetUser.id);
        
      if (profileDeleteError) {
        console.warn("Profil silinirken uyarı:", profileDeleteError);
      }
    } catch (profileError) {
      console.warn("Profil silme işlemi başarısız olabilir:", profileError);
    }
    
    // İlişkili personel kaydını sil (auth_id ile ilişkili kayıt varsa)
    try {
      const { error: personelDeleteError } = await supabaseAdmin
        .from('personel')
        .delete()
        .eq('auth_id', targetUser.id);
        
      if (personelDeleteError) {
        console.warn("Personel silinirken uyarı:", personelDeleteError);
      }
    } catch (personelError) {
      console.warn("Personel silme işlemi başarısız olabilir:", personelError);
    }
    
    // Kullanıcıyı auth tablosundan sil
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(targetUser.id);
    
    if (deleteError) {
      console.error("Kullanıcı silme hatası:", deleteError);
      return new Response(JSON.stringify({ error: `Kullanıcı silinemedi: ${deleteError.message}` }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`${email} adresli kullanıcı başarıyla silindi`);
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: `${email} adresli kullanıcı başarıyla silindi`
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error("İşlem hatası:", error.message);
    return new Response(JSON.stringify({ error: `İşlem hatası: ${error.message}` }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
