
import { supabase } from '../../client';
import { Profile } from '../../types';

/**
 * Syncs a staff profile with the personel table
 */
export async function handleStaffRecordSync(userId: string, profile: Profile): Promise<void> {
  try {
    // Check if there's already a personel record with this auth_id
    const { data: existingPersonel } = await supabase
      .from('personel')
      .select('*')
      .eq('auth_id', userId)
      .maybeSingle();
        
    // Get user email
    let userEmail = '';
    try {
      // Use auth.getUser API
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.id === userId) {
        userEmail = userData.user.email || '';
      }
    } catch (error) {
      console.error("Error getting user email:", error);
    }
        
    if (!existingPersonel) {
      // Create a new personel record
      const fullName = `${profile.first_name} ${profile.last_name}`.trim() || 'Personel';
        
      const { error: insertError } = await supabase
        .from('personel')
        .insert({
          auth_id: userId,
          ad_soyad: fullName,
          telefon: profile.phone || '',
          eposta: userEmail || '',
          adres: '',
          personel_no: `S${Math.floor(Math.random() * 9000) + 1000}`,
          maas: 0,
          calisma_sistemi: 'aylik',
          prim_yuzdesi: 0
        });
          
      if (insertError) {
        console.error("Error creating personnel record:", insertError);
      }
    } else {
      // Update the existing personel record with the latest name and phone
      const fullName = `${profile.first_name} ${profile.last_name}`.trim();
        
      if (fullName) {
        const { error: updateError } = await supabase
          .from('personel')
          .update({
            ad_soyad: fullName,
            telefon: profile.phone || '',
            eposta: userEmail || existingPersonel.eposta
          })
          .eq('auth_id', userId);
            
        if (updateError) {
          console.error("Error updating personnel record:", updateError);
        }
      }
    }
  } catch (staffErr) {
    console.error("Error handling staff record:", staffErr);
  }
}
