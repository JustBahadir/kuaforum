
// Add this function to retrieve a staff member by auth ID
export async function getirByAuthId(authId: string) {
  try {
    const { data, error } = await supabase
      .from('personel')
      .select('*')
      .eq('auth_id', authId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Personel auth ID bilgisi getirme hatası:', error);
    throw error;
  }
}
