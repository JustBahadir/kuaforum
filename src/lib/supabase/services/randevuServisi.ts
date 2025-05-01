
// Add this function to retrieve appointments by customer ID
export async function getirByMusteriId(musteriId: number) {
  try {
    const { data, error } = await supabase
      .from('randevular')
      .select('*, personel:personel_id(ad_soyad)')
      .eq('musteri_id', musteriId)
      .order('tarih', { ascending: false })
      .order('saat', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Müşteri randevuları getirme hatası:', error);
    throw error;
  }
}
