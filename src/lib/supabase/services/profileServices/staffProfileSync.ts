
import { supabase } from "../../client";
import { Profil } from "../../types";

export const syncStaffProfileWithPersonel = async (
  userId: string,
  personelId: number
): Promise<boolean> => {
  try {
    // Get the personnel data
    const { data: personelData, error: personelError } = await supabase
      .from("personel")
      .select("*")
      .eq("id", personelId)
      .maybeSingle();

    if (personelError || !personelData) {
      console.error("Error fetching personel data:", personelError);
      return false;
    }

    // Update the profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        first_name: personelData.ad_soyad.split(" ")[0],
        last_name: personelData.ad_soyad.split(" ").slice(1).join(" "),
        phone: personelData.telefon,
        address: personelData.adres,
        role: "staff",
        dukkan_id: personelData.dukkan_id
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating profile:", updateError);
      return false;
    }

    // Link the personnel to the auth user
    const { error: linkError } = await supabase
      .from("personel")
      .update({ auth_id: userId })
      .eq("id", personelId);

    if (linkError) {
      console.error("Error linking personel to auth user:", linkError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error syncing staff profile with personel:", error);
    return false;
  }
};
