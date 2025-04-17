
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, supabaseAdmin } from "@/lib/supabase/client";
import { Personel } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { profilServisi } from "@/lib/supabase/services/profilServisi";
import { User } from "@supabase/supabase-js";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";

// Type definitions for clarity
type PersonelData = Omit<Personel, 'id' | 'created_at'>;
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
    
    try {
      // Update user metadata - using admin client
      const { error: metadataError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { 
          role: 'staff',
          first_name: firstName,
          last_name: lastName
        }
      });
      
      if (metadataError) {
        console.error("Error updating user metadata:", metadataError);
      } else {
        console.log("Updated user metadata successfully");
      }
    } catch (metadataError) {
      console.error("Failed to update user metadata:", metadataError);
    }
    
    // Update profile using service_role key via profile service
    try {
      await profilServisi.createOrUpdateProfile(userId, {
        first_name: firstName,
        last_name: lastName,
        role: 'staff',
        phone: personelData.telefon
      });
      console.log("Updated existing user profile");
    } catch (profileError) {
      console.error("Error updating profile:", profileError);
    }
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
    
    // Use admin api with service_role key to list users
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError || !usersData?.users) {
      console.error("Error listing users:", listError);
      return null;
    }
    
    // Type assertion to ensure proper type checking
    const users = usersData.users as User[];
    
    // Find user with matching email using explicit type checking
    const matchingUser = users.find(user => {
      if (!user) return false;
      
      // Since we've asserted the type above, User should have email property
      return typeof user.email === 'string' && 
             user.email.toLowerCase() === email.toLowerCase();
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
async function createAuthUser(email: string, nameData: { firstName: string; lastName: string }, dukkanId: number | null): Promise<User | null> {
  try {
    console.log("Creating new auth user with email:", email);
    
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: "password123",
      email_confirm: true,
      user_metadata: {
        first_name: nameData.firstName,
        last_name: nameData.lastName,
        role: 'staff',
        dukkan_id: dukkanId
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
      
      return;
    }
    
    // Create new auth user
    const newUser = await createAuthUser(personelData.eposta, { firstName, lastName }, personelData.dukkan_id || null);
    
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
  const { dukkanId } = useCustomerAuth();

  return useMutation({
    mutationFn: async (personelData: PersonelData) => {
      console.log("Personnel mutation started with data:", personelData);
      
      // Ensure personnel is associated with the current shop
      const dataWithShop = {
        ...personelData,
        dukkan_id: dukkanId || personelData.dukkan_id
      };
      
      if (!dataWithShop.dukkan_id) {
        throw new Error("Personel kaydı için dükkan ID gereklidir.");
      }
      
      // Create personnel record
      const personelRecord = await createPersonelRecord(dataWithShop);

      // If auth_id is already specified, just update that user's info
      if (personelData.auth_id) {
        await updateExistingUser(personelData.auth_id, dataWithShop);
        return personelRecord;
      }

      // Connect to auth user (find existing or create new)
      await connectPersonelToAuthUser(dataWithShop, personelRecord.id);

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
