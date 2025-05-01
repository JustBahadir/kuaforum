
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export const useProfileManagement = (authId: string) => {
  const [educationData, setEducationData] = useState({
    ortaokuldurumu: "",
    lisedurumu: "",
    liseturu: "",
    universitedurumu: "",
    universitebolum: "",
    meslekibrans: ""
  });
  
  const [historyData, setHistoryData] = useState({
    isyerleri: "",
    gorevpozisyon: "",
    yarismalar: "",
    belgeler: "",
    cv: ""
  });

  const [loading, setLoading] = useState(true);
  const [personelId, setPersonelId] = useState<number>(0);
  const [userId, setUserId] = useState<string>("");
  
  // Load initial data
  useEffect(() => {
    if (!authId) return;
    
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Get personel ID from auth ID
        const { data: personelData, error: personelError } = await supabase
          .from('personel')
          .select('id')
          .eq('auth_id', authId)
          .single();
          
        if (personelError) {
          console.error('Error fetching personel data:', personelError);
          return;
        }
        
        if (personelData) {
          // Hard type conversion to ensure number
          setPersonelId(Number(personelData.id));
          
          // Set user ID
          setUserId(authId);
          
          // Get education data
          const { data: educData, error: educError } = await supabase
            .from('staff_education')
            .select('*')
            .eq('personel_id', personelData.id)
            .maybeSingle();
            
          if (educData) {
            setEducationData({
              ortaokuldurumu: educData.ortaokuldurumu || '',
              lisedurumu: educData.lisedurumu || '',
              liseturu: educData.liseturu || '',
              universitedurumu: educData.universitedurumu || '',
              universitebolum: educData.universitebolum || '',
              meslekibrans: educData.meslekibrans || ''
            });
          } else if (educError && educError.code !== 'PGRST116') {
            console.error('Error fetching education data:', educError);
          }
          
          // Get history data
          const { data: histData, error: histError } = await supabase
            .from('staff_history')
            .select('*')
            .eq('personel_id', personelData.id)
            .maybeSingle();
            
          if (histData) {
            setHistoryData({
              isyerleri: histData.isyerleri || '',
              gorevpozisyon: histData.gorevpozisyon || '',
              yarismalar: histData.yarismalar || '',
              belgeler: histData.belgeler || '',
              cv: histData.cv || ''
            });
          } else if (histError && histError.code !== 'PGRST116') {
            console.error('Error fetching history data:', histError);
          }
        }
      } catch (error) {
        console.error('Error in loading profile data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [authId]);
  
  // Save education data
  const saveEducation = useCallback(async () => {
    if (!personelId) {
      toast.error('Personel bilgisi bulunamadı', {
        position: 'bottom-right'
      });
      return;
    }
    
    try {
      // Check if education data exists
      const { data: existingData, error: checkError } = await supabase
        .from('staff_education')
        .select('personel_id')
        .eq('personel_id', personelId)
        .maybeSingle();
        
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking education data:', checkError);
        throw checkError;
      }
      
      let result;
      
      if (existingData) {
        // Update existing record
        const { data, error } = await supabase
          .from('staff_education')
          .update(educationData)
          .eq('personel_id', personelId)
          .select();
          
        if (error) throw error;
        result = data;
        
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('staff_education')
          .insert({
            ...educationData,
            personel_id: personelId
          })
          .select();
          
        if (error) throw error;
        result = data;
      }
      
      toast.success('Eğitim bilgileri kaydedildi', {
        position: 'bottom-right'
      });
      
      return result;
    } catch (error: any) {
      console.error('Error saving education data:', error);
      toast.error(`Eğitim bilgileri kaydedilemedi: ${error.message}`, {
        position: 'bottom-right'
      });
      throw error;
    }
  }, [personelId, educationData]);
  
  // Save history data
  const saveHistory = useCallback(async () => {
    if (!personelId) {
      toast.error('Personel bilgisi bulunamadı', {
        position: 'bottom-right'
      });
      return;
    }
    
    try {
      // Check if history data exists
      const { data: existingData, error: checkError } = await supabase
        .from('staff_history')
        .select('personel_id')
        .eq('personel_id', personelId)
        .maybeSingle();
        
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking history data:', checkError);
        throw checkError;
      }
      
      let result;
      
      if (existingData) {
        // Update existing record
        const { data, error } = await supabase
          .from('staff_history')
          .update(historyData)
          .eq('personel_id', personelId)
          .select();
          
        if (error) throw error;
        result = data;
        
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('staff_history')
          .insert({
            ...historyData,
            personel_id: personelId
          })
          .select();
          
        if (error) throw error;
        result = data;
      }
      
      toast.success('Çalışma geçmişi kaydedildi', {
        position: 'bottom-right'
      });
      
      return result;
    } catch (error: any) {
      console.error('Error saving history data:', error);
      toast.error(`Çalışma geçmişi kaydedilemedi: ${error.message}`, {
        position: 'bottom-right'
      });
      throw error;
    }
  }, [personelId, historyData]);

  return {
    educationData,
    setEducationData,
    historyData,
    setHistoryData,
    loading,
    personelId,
    userId,
    saveEducation,
    saveHistory
  };
};
