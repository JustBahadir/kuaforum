
import { supabase } from '../client';
import { toast } from 'sonner';

export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  birthdate?: string | null;
  phone?: string | null;
  gender?: string | null;
  address?: string | null;
  iban?: string | null;
}

export const profileService = {
  async getCurrentProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Kullanıcı bulunamadı');
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Profil bilgisi getirilemedi:', error);
      return null;
    }
  },
  
  async updateProfile(profileData: ProfileUpdateData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Kullanıcı bulunamadı');
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Profil güncellenirken hata:', error);
      throw error;
    }
  },
  
  async uploadAvatar(file: File) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Kullanıcı bulunamadı');
      }
      
      // Check if the avatars bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      if (!buckets?.find(bucket => bucket.name === 'avatars')) {
        // Create the avatars bucket if it doesn't exist
        const { error: bucketError } = await supabase.storage.createBucket('avatars', {
          public: true
        });
        
        if (bucketError) {
          console.error('Avatar bucket oluşturulamadı:', bucketError);
          throw bucketError;
        }
      }
      
      // Generate a unique file path
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Date.now()}.${fileExt}`;
      
      // Upload the avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      // Update the profile with the avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      return publicUrl;
    } catch (error) {
      console.error('Avatar yükleme hatası:', error);
      throw error;
    }
  },

  async uploadCv(file: File) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Kullanıcı bulunamadı');
      }
      
      // Check if the documents bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      if (!buckets?.find(bucket => bucket.name === 'documents')) {
        // Create the documents bucket if it doesn't exist
        const { error: bucketError } = await supabase.storage.createBucket('documents', {
          public: true
        });
        
        if (bucketError) {
          console.error('Documents bucket oluşturulamadı:', bucketError);
          throw bucketError;
        }
      }
      
      // Generate a unique file path
      const fileExt = file.name.split('.').pop();
      const filePath = `cv-${user.id}-${Date.now()}.${fileExt}`;
      
      // Upload the CV
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);
      
      // Get the staff ID for the current user
      const { data: personelData, error: personelError } = await supabase
        .from('personel')
        .select('id')
        .eq('auth_id', user.id)
        .single();
      
      if (personelError) throw personelError;
      
      // Update or insert the staff_history record with the CV URL
      const { error: updateError } = await supabase
        .from('staff_history')
        .upsert({
          personel_id: personelData.id,
          cv: publicUrl,
          updated_at: new Date().toISOString()
        }, { onConflict: 'personel_id' });
      
      if (updateError) throw updateError;
      
      return publicUrl;
    } catch (error) {
      console.error('CV yükleme hatası:', error);
      throw error;
    }
  }
};
