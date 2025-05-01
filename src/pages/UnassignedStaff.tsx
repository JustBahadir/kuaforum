
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useUnassignedStaffData } from "@/hooks/useUnassignedStaffData";
import { UnassignedStaffMain } from "@/components/unassigned-staff/UnassignedStaffMain";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function UnassignedStaff() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { joinRequests, shop, isLoading, refreshData } = useUnassignedStaffData();

  useEffect(() => {
    // Check if user has a shop already
    const checkUserShop = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }
        
        const userRole = user.user_metadata?.role;
        
        // If user is admin, they should be redirected to admin dashboard
        if (userRole === 'admin') {
          navigate('/admin/dashboard');
          return;
        }
        
        // Check if this staff is already assigned to a shop
        const { data: staffData } = await supabase
          .from('personel')
          .select('dukkan_id')
          .eq('auth_id', user.id)
          .maybeSingle();
          
        if (staffData && staffData.dukkan_id) {
          navigate('/staff/dashboard');
        }
      } catch (error) {
        console.error('Error checking user shop:', error);
      }
    };
    
    checkUserShop();
  }, [navigate]);

  const logout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login');
    } catch (error) {
      toast.error('Çıkış yaparken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background px-4 py-3 shadow-sm">
        <div className="container flex items-center justify-between">
          <h1 className="text-xl font-semibold">Kuaför Yönetim Sistemi</h1>
          <Button variant="outline" onClick={logout} disabled={loading}>
            {loading ? "Çıkış Yapılıyor..." : "Çıkış Yap"}
          </Button>
        </div>
      </header>

      <UnassignedStaffMain 
        joinRequests={joinRequests} 
        shop={shop}
        onRefresh={refreshData}
      />
    </div>
  );
}
