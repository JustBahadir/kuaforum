
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export function useUnassignedStaffData() {
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [shop, setShop] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Get join requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('staff_join_requests')
        .select(`
          *,
          dukkanlar (
            id,
            ad,
            kod
          )
        `)
        .eq('personel_id', user.id);

      if (requestsError) throw requestsError;
      setJoinRequests(requestsData || []);

      // Check if user already has an assigned shop
      const { data: staffData, error: staffError } = await supabase
        .from('personel')
        .select(`
          *,
          dukkanlar (
            id,
            ad,
            kod
          )
        `)
        .eq('auth_id', user.id)
        .maybeSingle();

      if (staffError && staffError.code !== 'PGRST116') {
        throw staffError;
      }

      if (staffData && staffData.dukkan_id) {
        setShop(staffData.dukkanlar);
      } else {
        setShop(null);
      }
    } catch (error) {
      console.error('Error fetching unassigned staff data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    joinRequests,
    shop,
    isLoading,
    refreshData: fetchData
  };
}
