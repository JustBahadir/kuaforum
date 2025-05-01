
export async function getirById(id: number) {
  try {
    const { data, error } = await supabase
      .from('dukkanlar')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Dükkan getirme hatası:', error);
    throw error;
  }
}
