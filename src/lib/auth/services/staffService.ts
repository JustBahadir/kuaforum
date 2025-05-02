
import { supabase } from "@/lib/supabase/client";
import { authService } from "@/lib/auth/authService";
import { profileService } from "@/lib/auth/profileService";

class StaffService {
  async getStaffData() {
    try {
      // Get current user
      const user = await authService.getCurrentUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Get user's staff record
      const { data: staffData, error: staffError } = await supabase
        .from('personel')
        .select('*')
        .eq('auth_id', user.id)
        .single();
      
      if (staffError) {
        throw staffError;
      }
      
      // Return staff data
      return staffData;
    } catch (error) {
      console.error("Error getting staff data:", error);
      throw error;
    }
  }
  
  async getEducationData(personelId: number) {
    try {
      const { data, error } = await supabase
        .from('staff_education')
        .select('*')
        .eq('personel_id', personelId)
        .single();
      
      if (error) {
        // If no record found, create a default one
        if (error.code === 'PGRST116') {
          return {
            personel_id: personelId,
            ortaokuldurumu: '',
            lisedurumu: '',
            liseturu: '',
            universitedurumu: '',
            universitebolum: '',
            meslekibrans: ''
          };
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Error getting education data:", error);
      return {
        personel_id: personelId,
        ortaokuldurumu: '',
        lisedurumu: '',
        liseturu: '',
        universitedurumu: '',
        universitebolum: '',
        meslekibrans: ''
      };
    }
  }
  
  async getHistoryData(personelId: number) {
    try {
      const { data, error } = await supabase
        .from('staff_history')
        .select('*')
        .eq('personel_id', personelId)
        .single();
      
      if (error) {
        // If no record found, create a default one
        if (error.code === 'PGRST116') {
          return {
            personel_id: personelId,
            isyerleri: '',
            gorevpozisyon: '',
            belgeler: '',
            yarismalar: '',
            cv: ''
          };
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Error getting history data:", error);
      return {
        personel_id: personelId,
        isyerleri: '',
        gorevpozisyon: '',
        belgeler: '',
        yarismalar: '',
        cv: ''
      };
    }
  }
  
  async saveEducationData(personelId: number, data: any) {
    try {
      // Check if education record exists
      const { data: existing, error: checkError } = await supabase
        .from('staff_education')
        .select('personel_id')
        .eq('personel_id', personelId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      // Update or insert based on existence
      if (existing) {
        const { error } = await supabase
          .from('staff_education')
          .update(data)
          .eq('personel_id', personelId);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('staff_education')
          .insert({ ...data, personel_id: personelId });
          
        if (error) throw error;
      }
      
      return true;
    } catch (error) {
      console.error("Error saving education data:", error);
      throw error;
    }
  }
  
  async saveHistoryData(personelId: number, data: any) {
    try {
      // Check if history record exists
      const { data: existing, error: checkError } = await supabase
        .from('staff_history')
        .select('personel_id')
        .eq('personel_id', personelId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      // Update or insert based on existence
      if (existing) {
        const { error } = await supabase
          .from('staff_history')
          .update(data)
          .eq('personel_id', personelId);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('staff_history')
          .insert({ ...data, personel_id: personelId });
          
        if (error) throw error;
      }
      
      return true;
    } catch (error) {
      console.error("Error saving history data:", error);
      throw error;
    }
  }
}

export const staffService = new StaffService();
