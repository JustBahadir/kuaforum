
// Profil güncelleme servisinde enum rolü uygun şekilde set ediyoruz

import { ProfileUpdateData } from "./profileTypes";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export async function updateProfile(data: ProfileUpdateData & { id?: string }) {
  try {
    // role alanını normalize et
    let role = data.role;
    if (role === "isletmeci") {
      role = "admin"; // veya uygun enum değeri
    }

    // Supabase update requires id, so check if id exists in data (optional)
    const idToUse = data.id;
    if (!idToUse) {
      throw new Error("Profile id is required for updateProfile");
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        gender: data.gender,
        shopname: (data as any).shopname, // shopname may not be part of ProfileUpdateData; cast to any
        role: role,
      })
      .eq("id", idToUse);

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
