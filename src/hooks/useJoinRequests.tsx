
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface JoinRequest {
  id: string | number;
  kullanici_kimlik: string;
  isletme_id?: string;
  isletme_kodu?: string;
  durum: string;
  tarih: string;
  onay_tarihi?: string;
  ret_tarihi?: string;
  ret_nedeni?: string;
  created_at?: string;
  email?: string;
  user_name?: string;
}

export function useJoinRequests() {
  const { user } = useAuth();
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchJoinRequests = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Get the user's isletme_id
      const { data: profileData, error: profileError } = await supabase
        .from('kullanicilar')
        .select('isletme_id')
        .eq('kimlik', user.id)
        .single();

      if (profileError) {
        console.error('Profil bilgisi alınamadı:', profileError);
        setError(profileError);
        return;
      }

      const isletmeId = profileData?.isletme_id;

      if (!isletmeId) {
        console.error('Kullanıcı bir işletmeye sahip değil');
        setError(new Error('Kullanıcı bir işletmeye sahip değil'));
        return;
      }

      // Get join requests for this isletme
      const { data, error: requestsError } = await supabase
        .from('personel_basvuru')
        .select(`
          *,
          kullanicilar (ad, soyad, eposta)
        `)
        .eq('isletme_id', isletmeId)
        .eq('durum', 'beklemede')
        .order('tarih', { ascending: false });

      if (requestsError) {
        console.error('Katılım istekleri alınamadı:', requestsError);
        setError(requestsError);
        return;
      }

      // Format the data
      const formattedRequests = data.map(req => ({
        ...req,
        email: req.kullanicilar?.eposta,
        user_name: req.kullanicilar ? `${req.kullanicilar.ad} ${req.kullanicilar.soyad}` : null
      }));

      setJoinRequests(formattedRequests);
    } catch (err) {
      console.error('Katılım istekleri alınırken hata:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchJoinRequests();
    }
  }, [user]);

  const approveRequest = async (requestId: string | number) => {
    try {
      // Get the request details
      const { data: requestData, error: requestError } = await supabase
        .from('personel_basvuru')
        .select('*')
        .eq('id', requestId)
        .single();

      if (requestError) {
        toast.error('İstek bulunamadı');
        throw requestError;
      }

      // Update the request status
      const { error: updateError } = await supabase
        .from('personel_basvuru')
        .update({
          durum: 'onaylandi',
          onay_tarihi: new Date().toISOString()
        })
        .eq('id', requestId);

      if (updateError) {
        toast.error('İstek onaylanırken bir hata oluştu');
        throw updateError;
      }

      // Add the user as personnel to the isletme
      const { error: personelError } = await supabase
        .from('personel')
        .insert({
          kullanici_kimlik: requestData.kullanici_kimlik,
          isletme_id: requestData.isletme_id,
          durum: 'aktif',
          ise_baslama_tarihi: new Date().toISOString()
        });

      if (personelError) {
        toast.error('Personel kaydı oluşturulurken bir hata oluştu');
        throw personelError;
      }

      // Update the user's isletme_id in kullanicilar table
      const { error: userUpdateError } = await supabase
        .from('kullanicilar')
        .update({
          isletme_id: requestData.isletme_id,
          rol: 'personel'
        })
        .eq('kimlik', requestData.kullanici_kimlik);

      if (userUpdateError) {
        toast.error('Kullanıcı bilgileri güncellenirken bir hata oluştu');
        throw userUpdateError;
      }

      toast.success('İstek başarıyla onaylandı');
      fetchJoinRequests();
    } catch (err) {
      console.error('İstek onaylanırken hata:', err);
      toast.error('İşlem sırasında bir hata oluştu');
    }
  };

  const rejectRequest = async (requestId: string | number) => {
    try {
      // Update the request status
      const { error } = await supabase
        .from('personel_basvuru')
        .update({
          durum: 'reddedildi',
          ret_tarihi: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) {
        toast.error('İstek reddedilirken bir hata oluştu');
        throw error;
      }

      toast.success('İstek reddedildi');
      fetchJoinRequests();
    } catch (err) {
      console.error('İstek reddedilirken hata:', err);
      toast.error('İşlem sırasında bir hata oluştu');
    }
  };

  return {
    joinRequests,
    isLoading,
    error,
    refetch: fetchJoinRequests,
    approveRequest,
    rejectRequest
  };
}
