
// Oturum açma sonrası rolü normalize edip uygun sayfaya yönlendirme 

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function Auth() {
  const navigate = useNavigate();

  useEffect(() => {
    async function handleLoginRedirect() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        toast.error("Giriş başarısız");
        navigate("/login");
        return;
      }

      // Profil bilgilerini al
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        toast.error("Profil bilgisi alınamadı");
        navigate("/login");
        return;
      }

      // Role normalize
      let role = profile?.role || "customer";
      if (role === "isletmeci") {
        role = "admin";
      }

      toast.success("Giriş Başarılı");

      // Role göre yönlendirme
      if (role === "admin") {
        navigate("/shop-home");
      } else if (role === "staff") {
        navigate("/staff-profile");
      } else {
        navigate("/");
      }
    }

    handleLoginRedirect();
  }, [navigate]);

  return <div>Yükleniyor...</div>;
}

