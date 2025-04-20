
// Fix type comparison issue and add runtime checking for "isletmeci" role from possibly unknown input
import { ProfileUpdateData } from "./profileTypes";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export async function updateProfile(data: ProfileUpdateData & { id?: string }) {
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
        shopname: (data as any).shopname, // cast since shopname might not be in ProfileUpdateData
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
