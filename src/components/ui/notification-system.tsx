
import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StaffJoinRequestDetails } from "@/components/staff/StaffJoinRequestDetails";

interface Notification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  type: string;
  created_at: string;
  related_staff_id?: number;
}

export function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [viewingDetails, setViewingDetails] = useState(false);
  const { userId } = useCustomerAuth();

  const fetchNotifications = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);
      
      // Update local state
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark the notification as read
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // Handle different notification types
    if (notification.type === "staff_request" && notification.related_staff_id) {
      setSelectedNotification(notification);
      setViewingDetails(true);
    }
  };

  const handleBackToNotifications = () => {
    setViewingDetails(false);
    setSelectedNotification(null);
  };

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, userId]);

  // Setup realtime subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          // Add the new notification to the list
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        {viewingDetails && selectedNotification ? (
          <>
            <div className="px-4 py-3 flex items-center justify-between bg-muted/50">
              <h3 className="font-medium">Başvuru İnceleme</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBackToNotifications}
              >
                Geri
              </Button>
            </div>
            <Separator />
            <div className="p-4">
              <StaffJoinRequestDetails 
                staffId={selectedNotification.related_staff_id} 
                onClose={() => {
                  setViewingDetails(false);
                  setOpen(false);
                  fetchNotifications();
                }}
              />
            </div>
          </>
        ) : (
          <>
            <div className="px-4 py-3 font-medium bg-muted/50">
              Bildirimler
            </div>
            <Separator />
            <ScrollArea className="h-[300px]">
              {loading ? (
                <div className="flex items-center justify-center h-24">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  Bildirim bulunmamaktadır
                </div>
              ) : (
                <div className="py-1">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex flex-col gap-1 ${
                        !notification.read ? "bg-blue-50" : ""
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm">
                          {notification.title}
                        </span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {notification.message}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
