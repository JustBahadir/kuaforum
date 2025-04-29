
import { supabase } from "../../client";
import { toast } from "sonner";
import { ProfileUpdateData } from "./profileTypes";

export async function updateProfile(data: ProfileUpdateData) {
  try {
    let role = data.role as string | undefined;

    if (role === "isletmeci") {
      role = "admin"; // or map to appropriate enum
    }

    // Supabase update requires id, so check if id exists in data
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
        shopname: data.shopname,
        role: role,
        birthdate: data.birthdate,
        avatar_url: data.avatar_url,
        address: data.address,
        iban: data.iban
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
