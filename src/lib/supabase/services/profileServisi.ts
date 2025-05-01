
import { supabase } from "../client";

export const profileServisi = {
  async getir(userId: string) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Profil getirme hatası:", error);
      throw error;
    }
  },

  async guncelle(userId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Profil güncelleme hatası:", error);
      throw error;
    }
  },

  async mevcut() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error("Kullanıcı oturumu bulunamadı");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Mevcut profil getirme hatası:", error);
      throw error;
    }
  },

  async profilResmiYukle(userId: string, file: File) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

      // Update profile with avatar URL
      await this.guncelle(userId, { avatar_url: data.publicUrl });

      return data.publicUrl;
    } catch (error) {
      console.error("Profil resmi yükleme hatası:", error);
      throw error;
    }
  }
};
