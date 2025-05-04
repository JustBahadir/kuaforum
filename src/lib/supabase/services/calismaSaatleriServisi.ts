
import { supabase } from '../client';
import { CalismaSaati } from '@/lib/supabase/temporaryTypes';
// Import only the function that exists or create a temporary one
import { sortWorkingHours } from '@/components/operations/utils/workingHoursUtils';
import { authService } from '@/lib/auth/authService';

// Create our own default working hours function since the import is broken
const getDefaultWorkingHours = (dukkanId: string): CalismaSaati[] => {
  const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
  return days.map((day, index) => ({
    id: `temp-${index}`,
    dukkan_id: dukkanId,
    gun: day,
    acilis: '09:00',
    kapanis: '18:00',
    kapali: index >= 5 // Weekend days are closed by default
  }));
};

export const calismaSaatleriServisi = {
  async getCalismaSaatleri(dukkanId: string) {
    const { data, error } = await supabase
      .from('calisma_saatleri')
      .select('*')
      .eq('dukkan_id', dukkanId);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return getDefaultWorkingHours(dukkanId);
    }
    
    return sortWorkingHours(data as CalismaSaati[]);
  },
  
  async updateCalismaSaatleri(calismaSaatleri: CalismaSaati[]) {
    // First get current user
    const user = await authService.getCurrentUser();
    if (!user) throw new Error("Kullanıcı oturum açmamış");
    
    // User must be admin to update working hours
    const userRole = user.user_metadata?.role;
    if (userRole !== 'admin') throw new Error("Bu işlem için yetkiniz yok");
    
    // Group hours by dukkan_id
    const dukkanId = calismaSaatleri[0]?.dukkan_id;
    if (!dukkanId) throw new Error("Dükkan ID'si bulunamadı");
    
    // Delete existing hours for this dukkan
    const { error: deleteError } = await supabase
      .from('calisma_saatleri')
      .delete()
      .eq('dukkan_id', dukkanId);
    
    if (deleteError) throw deleteError;
    
    // Insert new hours
    const { data, error } = await supabase
      .from('calisma_saatleri')
      .insert(calismaSaatleri);
    
    if (error) throw error;
    
    return data;
  }
};
