
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Personel } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { profilServisi } from "@/lib/supabase/services/profilServisi";
import { User } from "@supabase/supabase-js";

// Type definitions for clarity
type PersonelData = Omit<Personel, 'id' | 'created_at'>;
type AuthUserMetadata = {
  role: string;
  first_name: string;
  last_name: string;
};
type ProfileData = {
  first_name: string;
  last_name: string;
  role: string;
  phone: string;
};

/**
 * Creates a personnel record in the database
 */
async function createPersonelRecord(personelData: PersonelData): Promise<Personel> {
  console.log("Creating personnel record with data:", personelData);
  
  const { data, error } = await supabase
    .from('personel')
    .insert([personelData])
    .select()
    .single();

  if (error) {
    console.error("Personnel insert error:", error);
    throw error;
  }

  console.log("Personnel record created:", data);
  return data;
}

/**
 * Updates an existing user's metadata and profile
 */
async function updateExistingUser(userId: string, personelData: PersonelData): Promise<void> {
  try {
    console.log("Updating existing user:", userId);
    
    // Split name for metadata
    const nameParts = personelData.ad_soyad.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // Update user metadata
    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { 
        role: 'staff',
        first_name: firstName,
        last_name: lastName
      }
    });
    
    // Update profile
    await profilServisi.createOrUpdateProfile(userId, {
      first_name: firstName,
      last_name: lastName,
      role: 'staff',
      phone: personelData.telefon
    });
    
    console.log("Updated existing user profile");
  } catch (error) {
    console.error("Error updating profile for existing auth user:", error);
  }
}

/**
 * Tries to find an existing user with the given email
 */
async function findExistingUser(email: string): Promise<User | null> {
  try {
    console.log("Searching for existing user with email:", email);
    
    // First try simple sign in if the user exists
    const { data: signInResult, error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: "password123"
    });
    
    if (!signInError && signInResult?.user) {
      console.log("Found user via sign in:", signInResult.user.id);
      return signInResult.user;
    }
    
    // If sign in failed, try to find the user through admin API
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError || !usersData?.users) {
      console.error("Error listing users:", listError);
      return null;
    }
    
    // Type safety: explicitly check each user object
    const matchingUser = usersData.users.find(user => {
      if (user && typeof user === 'object' && 'email' in user) {
        return user.email === email;
      }
      return false;
    });
    
    if (matchingUser) {
      console.log("Found user via admin API:", matchingUser.id);
    } else {
      console.log("No existing user found with this email");
    }
    
    return matchingUser || null;
  } catch (error) {
    console.error("Error finding existing user:", error);
    return null;
  }
}

/**
 * Updates a personnel record with the given auth_id
 */
async function updatePersonelWithAuthId(personelId: number, authId: string): Promise<void> {
  try {
    await supabase
      .from('personel')
      .update({ auth_id: authId })
      .eq('id', personelId);
    
    console.log("Updated personnel record with auth_id:", authId);
  } catch (error) {
    console.error("Error updating personnel with auth_id:", error);
  }
}

/**
 * Creates a new auth user for the personnel
 */
async function createAuthUser(email: string, nameData: { firstName: string; lastName: string }): Promise<User | null> {
  try {
    console.log("Creating new auth user with email:", email);
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: "password123",
      email_confirm: true,
      user_metadata: {
        first_name: nameData.firstName,
        last_name: nameData.lastName,
        role: 'staff'
      }
    });

    if (authError) {
      console.error("Auth user creation error:", authError);
      return null;
    }

    if (authData && authData.user) {
      console.log("New auth user created:", authData.user.id);
      return authData.user;
    }
    
    return null;
  } catch (error) {
    console.error("Error creating auth user:", error);
    return null;
  }
}

/**
 * Connects a personnel record to an auth user and creates a profile
 */
async function connectPersonelToAuthUser(personelData: PersonelData, personelId: number): Promise<void> {
  try {
    const nameParts = personelData.ad_soyad.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // Find or create the auth user
    const existingUser = await findExistingUser(personelData.eposta);
    
    if (existingUser) {
      // Update the existing user
      await updateExistingUser(existingUser.id, personelData);
      
      // Update personnel record with auth_id
      await updatePersonelWithAuthId(personelId, existingUser.id);
      
      // Sign out after the operation
      await supabase.auth.signOut();
      return;
    }
    
    // Create new auth user
    const newUser = await createAuthUser(personelData.eposta, { firstName, lastName });
    
    if (newUser) {
      // Update personnel record with auth_id
      await updatePersonelWithAuthId(personelId, newUser.id);
        
      // Create profile
      await profilServisi.createOrUpdateProfile(newUser.id, {
        first_name: firstName,
        last_name: lastName,
        role: 'staff',
        phone: personelData.telefon
      });
    }
  } catch (error) {
    console.error("Error connecting personnel to auth user:", error);
    toast({
      title: "Hata",
      description: "Personel kaydedildi ancak giriş bilgileri oluşturulamadı"
    });
  }
}

export function usePersonnelMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (personelData: PersonelData) => {
      console.log("Personnel mutation started with data:", personelData);
      
      // Create personnel record
      const personelRecord = await createPersonelRecord(personelData);

      // If auth_id is already specified, just update that user's info
      if (personelData.auth_id) {
        await updateExistingUser(personelData.auth_id, personelData);
        return personelRecord;
      }

      // Connect to auth user (find existing or create new)
      await connectPersonelToAuthUser(personelData, personelRecord.id);

      return personelRecord;
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Personel başarıyla eklendi"
      });
      queryClient.invalidateQueries({ queryKey: ["personnel"] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error("Personel ekleme hatası:", error);
      toast({
        title: "Hata",
        description: "Personel eklenirken bir hata oluştu: " + error.message,
        variant: "destructive"
      });
    }
  });
}
