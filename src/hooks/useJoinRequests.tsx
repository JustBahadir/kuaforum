
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useJoinRequests() {
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { user } = useAuth();

  const fetchJoinRequests = async () => {
    if (!user) {
      setJoinRequests([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('personel_basvurulari')
        .select(`
          *,
          isletmeler:isletme_kodu (isletme_adi)
        `)
        .eq('kullanici_kimlik', user.id)
        .order('tarih', { ascending: false });
      
      if (error) throw error;
      
      setJoinRequests(data || []);
    } catch (err) {
      console.error('Error fetching join requests:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const approveRequest = async () => {
    toast.error('Bu işlem sadece işletme sahipleri tarafından yapılabilir.');
  };

  const rejectRequest = async () => {
    toast.error('Bu işlem sadece işletme sahipleri tarafından yapılabilir.');
  };

  useEffect(() => {
    fetchJoinRequests();
  }, [user]);

  return {
    joinRequests,
    isLoading,
    error,
    refetch: fetchJoinRequests,
    approveRequest,
    rejectRequest
  };
}
