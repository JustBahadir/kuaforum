
import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  created_at: string;
  read: boolean;
}

export function NotificationsMenu() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { userId, userRole } = useCustomerAuth();

  const fetchNotifications = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Set up realtime subscription for new notifications
    const channel = supabase
      .channel('notifications_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const handleNotificationClick = async (notification: Notification) => {
    // Mark notification as read
    if (!notification.read) {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notification.id);
        
      if (error) {
        console.error('Error marking notification as read:', error);
      } else {
        // Update local state
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );
      }
    }

    // Handle different notification types
    if (notification.type === 'staff_join_request') {
      navigate('/personnel/pending-requests');
    } else {
      // For other notification types
      navigate('/notifications');
    }
    
    setIsOpen(false);
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM, HH:mm', { locale: tr });
    } catch (error) {
      return dateString;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative p-2" aria-label="Bildirimler">
          <Bell size={20} />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[1.25rem] h-5">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="px-4 py-3 font-medium border-b">
          Bildirimler
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              Bildiriminiz bulunmamaktadır.
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id}
                className={`flex flex-col items-start p-3 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="font-medium">{notification.title}</div>
                <div className="text-sm text-muted-foreground mt-1">{notification.message}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatDate(notification.created_at)}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
        <div className="p-2 border-t">
          <Button 
            variant="outline" 
            className="w-full text-sm"
            onClick={() => {
              navigate('/notifications');
              setIsOpen(false);
            }}
          >
            Tüm Bildirimleri Gör
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
