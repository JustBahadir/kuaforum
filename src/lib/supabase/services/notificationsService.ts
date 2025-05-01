
import { supabase } from '../client';

export const notificationsService = {
  async getNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  },
  
  async markAsRead(notificationId: number) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .select();
      
    if (error) throw error;
    return data;
  },
  
  async markAllAsRead(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .select();
      
    if (error) throw error;
    return data;
  },
  
  async deleteNotification(notificationId: number) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);
      
    if (error) throw error;
    return true;
  }
};

// For backward compatibility
export const notificationServisi = notificationsService;
