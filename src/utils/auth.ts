
import { supabase } from "@/lib/supabase";

export const getUserRole = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return data?.role || null;
};

export const isStaffOrAdmin = async () => {
  const role = await getUserRole();
  return role === 'staff' || role === 'admin';
};
