
import { ReactNode } from "react";
import { SidebarNav } from "./sidebar-nav";
import { Home, Users, Calendar, Scissors, Settings, LogOut, UserCircle, Bell } from "lucide-react";
import { Button } from "./button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { NotificationsMenu } from "@/components/notifications/NotificationsMenu";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";

interface StaffLayoutProps {
  children: ReactNode;
}

export function StaffLayout({ children }: StaffLayoutProps) {
  const navigate = useNavigate();
  const { userRole } = useCustomerAuth();
  
  // Define sidebar items
  const sidebarItems = [
    {
      title: "Ana Sayfa",
      href: "/shop-home",
      icon: <Home className="w-4 h-4" />
    },
    {
      title: "Randevular",
      href: "/appointments",
      icon: <Calendar className="w-4 h-4" />
    },
    {
      title: "Müşteriler",
      href: "/customers",
      icon: <Users className="w-4 h-4" />
    },
    {
      title: "Personel",
      href: "/personnel",
      icon: <Users className="w-4 h-4" />
    },
    {
      title: "Personel Talepleri",
      href: "/personnel/pending-requests",
      icon: <Users className="w-4 h-4" />,
      role: "admin"
    },
    {
      title: "İşlemler",
      href: "/operations/staff",
      icon: <Scissors className="w-4 h-4" />
    },
    {
      title: "Profil",
      href: "/profile",
      icon: <UserCircle className="w-4 h-4" />
    },
    {
      title: "Ayarlar",
      href: "/settings",
      icon: <Settings className="w-4 h-4" />,
      role: "admin"
    }
  ];

  const filteredItems = userRole === "admin" 
    ? sidebarItems 
    : sidebarItems.filter(item => item.role !== "admin");

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Başarıyla çıkış yapıldı");
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Çıkış yapılırken bir hata oluştu");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="fixed inset-y-0 left-0 z-10 w-64 border-r border-gray-200 bg-white shadow-sm">
        <div className="h-16 flex items-center justify-between border-b px-6">
          <h2 className="text-lg font-bold">Salon Yönetimi</h2>
        </div>
        <div className="py-4 px-4">
          <SidebarNav items={filteredItems} />
          
          <div className="mt-8">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış Yap
            </Button>
          </div>
        </div>
      </aside>
      <div className="pl-64 w-full">
        {/* Add header with notifications */}
        <header className="h-16 border-b bg-white flex items-center justify-end px-6 sticky top-0 z-10">
          <NotificationsMenu />
        </header>
        <main className="w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
