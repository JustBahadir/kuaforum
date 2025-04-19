import { supabase } from "../../client";
import { Profil } from "../../types";

export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  avatar_url?: string;
  birthdate?: string;
  iban?: string;
  gender?: string;
  role?: 'admin' | 'staff' | 'customer';
}

export interface ProfileCreationParams {
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: 'admin' | 'staff' | 'customer';
  address?: string;
  avatar_url?: string;
  birthdate?: string;
  iban?: string;
  gender?: string;
}

export class ProfileServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProfileServiceError';
  }
}

/**
 * Updates a user's profile
 * Temizlenmiş ve recursion riskini kaldıran versiyon
 */
export async function updateProfile(data: ProfileUpdateData): Promise<Profil | null> {
  try {
    // Temizleme: nested profile veya profiles key varsa sil
    if ('profiles' in data) {
      delete (data as any).profiles;
    }
    
    if ('profile' in data) {
      delete (data as any).profile;
    }

    console.log("Profil güncelleniyor, temizlenmiş veri:", data);

    // Oturumdan kullanıcı ID'si alınır
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Kullanıcı bilgisi alınamadı:", userError);
      throw {
        message: "Kullanıcı bilgisi alınamadı: " + (userError?.message || "Bilinmeyen hata"),
        original: userError,
      };
    }

    const userId = user.id;

    // Kullanıcı metadata güncellenir (opsiyonel, başarısız olsa da profile güncelleme devam eder)
    try {
      const { error: userUpdateError } = await supabase.auth.updateUser({
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          gender: data.gender || null,
          birthdate: data.birthdate,
          role: data.role,
          avatar_url: data.avatar_url,
          address: data.address,
          iban: data.iban,
        },
      });

      if (userUpdateError) {
        console.error("Kullanıcı metadata güncellenirken hata:", userUpdateError);
      } else {
        console.log("Kullanıcı metadata başarıyla güncellendi");
      }
    } catch (err) {
      console.error("Kullanıcı metadata güncellenirken istisna:", err);
    }

    const updateData: Record<string, any> = {};
    if (data.first_name !== undefined) updateData.first_name = data.first_name;
    if (data.last_name !== undefined) updateData.last_name = data.last_name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.gender !== undefined) updateData.gender = data.gender || null;
    if (data.birthdate !== undefined) updateData.birthdate = data.birthdate;
    if (data.avatar_url !== undefined) updateData.avatar_url = data.avatar_url;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.iban !== undefined) updateData.iban = data.iban;

    // Profil var mı diye kontrol et
    const { data: existingProfile, error: fetchProfileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (fetchProfileError) {
      console.error("Profil kontrolü sırasında hata:", fetchProfileError);
    }

    if (!existingProfile) {
      // Yoksa oluşturmayı dener
      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          ...updateData,
        })
        .select("*")
        .maybeSingle();

      if (insertError) {
        console.error("Profil oluşturulurken hata:", insertError);
        return {
          id: userId,
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone: data.phone || "",
          gender: data.gender || null,
          birthdate: data.birthdate || null,
          avatar_url: data.avatar_url || "",
          address: data.address || "",
          iban: data.iban || "",
          role: data.role || "customer",
          created_at: new Date().toISOString(),
        };
      }

      return newProfile;
    }

    // Profil varsa güncelle
    const { data: profile, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", userId)
      .select("*")
      .maybeSingle();

    if (error) {
      console.error("Profil güncellenirken hata:", error);
      if (error.code === "42P17") {
        console.warn("Özyineleme hatası tespit edildi, fallback yapı dönülüyor");
        return {
          id: userId,
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone: data.phone || "",
          gender: data.gender || null,
          birthdate: data.birthdate || null,
          avatar_url: data.avatar_url || "",
          address: data.address || "",
          iban: data.iban || "",
          role: data.role || "customer",
          created_at: new Date().toISOString(),
        };
      }
      throw error;
    }

    console.log("Profil başarıyla güncellendi:", profile);
    return profile;
  } catch (error) {
    console.error("updateProfile fonksiyonunda hata detayları:", error);
    throw error;
  }
}

/**
 * Creates or updates a user profile, recursion-safe
 */
export async function createOrUpdateProfile(
  userId: string,
  profileData: ProfileCreationParams
): Promise<Profil | null> {
  try {
    console.log("Kullanıcı için profil oluşturuluyor veya güncelleniyor:", userId, "veri:", profileData);

    // Kullanıcı metadata güncelleme
    try {
      const { error: userUpdateError } = await supabase.auth.updateUser({
        data: {
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          role: profileData.role,
          phone: profileData.phone,
          gender: profileData.gender || null,
          birthdate: profileData.birthdate,
          avatar_url: profileData.avatar_url,
          address: profileData.address,
          iban: profileData.iban,
        },
      });

      if (userUpdateError) {
        console.error("Kullanıcı metadata güncellenirken hata:", userUpdateError);
      } else {
        console.log("Kullanıcı metadata başarıyla güncellendi");
      }
    } catch (error) {
      console.error("Kullanıcı metadata güncellenirken hata:", error);
    }

    // Profil var mı diye kontrol et
    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Profil alınırken hata:", fetchError);
    }

    let profile: Profil | null = null;

    if (existingProfile) {
      // Varsa güncelle
      console.log("Mevcut profil güncelleniyor:", existingProfile.id);
      const updateData: Record<string, any> = {};
      if (profileData.first_name !== undefined) updateData.first_name = profileData.first_name;
      if (profileData.last_name !== undefined) updateData.last_name = profileData.last_name;
      if (profileData.role !== undefined) updateData.role = profileData.role;
      if (profileData.phone !== undefined) updateData.phone = profileData.phone;
      if (profileData.gender !== undefined) updateData.gender = profileData.gender || null;
      if (profileData.birthdate !== undefined) updateData.birthdate = profileData.birthdate;
      if (profileData.avatar_url !== undefined) updateData.avatar_url = profileData.avatar_url;
      if (profileData.address !== undefined) updateData.address = profileData.address;
      if (profileData.iban !== undefined) updateData.iban = profileData.iban;

      const { data: updatedProfile, error: updateError } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", userId)
        .select("*")
        .maybeSingle();

      if (updateError) {
        console.error("Profil güncellenirken hata:", updateError);
        return {
          id: userId,
          first_name: profileData.first_name || "",
          last_name: profileData.last_name || "",
          role: profileData.role || "customer",
          phone: profileData.phone || "",
          gender: profileData.gender || null,
          birthdate: profileData.birthdate || null,
          avatar_url: profileData.avatar_url || "",
          address: profileData.address || "",
          iban: profileData.iban || "",
          created_at: new Date().toISOString(),
        };
      }

      profile = updatedProfile;
      console.log("Profil başarıyla güncellendi:", profile);
    } else {
      // Profil yoksa oluştur
      console.log("Kullanıcı için yeni profil oluşturuluyor:", userId);

      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          first_name: profileData.first_name || "",
          last_name: profileData.last_name || "",
          role: profileData.role || "customer",
          phone: profileData.phone || "",
          gender: profileData.gender || null,
          birthdate: profileData.birthdate || null,
          avatar_url: profileData.avatar_url || "",
          address: profileData.address || "",
          iban: profileData.iban || "",
        })
        .select("*")
        .maybeSingle();

      if (insertError) {
        console.error("Profil eklenirken hata:", insertError);
        return {
          id: userId,
          first_name: profileData.first_name || "",
          last_name: profileData.last_name || "",
          role: profileData.role || "customer",
          phone: profileData.phone || "",
          gender: profileData.gender || null,
          birthdate: profileData.birthdate || null,
          avatar_url: profileData.avatar_url || "",
          address: profileData.address || "",
          iban: profileData.iban || "",
          created_at: new Date().toISOString(),
        };
      }

      profile = newProfile;
      console.log("Profil başarıyla oluşturuldu:", profile);
    }

    return profile;
  } catch (error) {
    console.error("createOrUpdateProfile fonksiyonunda hata:", error);
    throw {
      message: "Profil oluşturulurken veya güncellenirken bir hata oluştu",
      original: error,
    };
  }
}
