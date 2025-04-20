
// Profil güncelleme servisinde enum rolü uygun şekilde set ediyoruz

import { supabase } from "@/lib/supabase/client";
import { ProfileUpdateData } from "../types";
import { toast } from "sonner";

export async function updateProfile(data: ProfileUpdateData) {
  try {
    // role alanını normalize et
    let role = data.role;
    if (role === "isletmeci") {
      role = "admin"; // veya uygun enum değeri
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        gender: data.gender,
        shopname: data.shopname,
        role: role,
      })
      .eq("id", data.id);

    if (error) {
      console.error("Profil güncelleme hatası:", error);
      toast.error("Profil güncellenirken bir hata oluştu");
      throw error;
    }

    toast.success("Profil başarıyla kaydedildi");
    return true;
  } catch (error) {
    toast.error("Profil kaydedilirken bir hata oluştu");
    throw error;
  }
}

