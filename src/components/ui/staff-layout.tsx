
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Users, Calendar, UserCog, Scissors, Home, LogOut, Store } from "lucide-react";
import { authService } from "@/lib/auth/authService";
import { toast } from "sonner";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";

interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> {
  items: {
    href: string;
    title: string;
    icon: React.ReactNode;
  }[];
}

export function StaffLayoutSidebar({ className, items, ...props }: SidebarNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { dukkanAdi } = useCustomerAuth();

  const handleLogout = async () => {
    try {
      await authService.signOut();
      navigate('/');
      toast.success("Başarıyla çıkış yapıldı");
    } catch (error) {
      console.error("Çıkış yapılırken hata:", error);
      toast.error("Çıkış yapılırken bir hata oluştu");
    }
  };

  return (
    <div className="h-screen w-[250px] border-r bg-gray-50 flex flex-col">
      <div className="py-6 px-5 border-b">
        <h2 className="text-xl font-bold text-purple-800">Kuaför Pro</h2>
        {dukkanAdi && (
          <div className="flex items-center mt-2 text-sm text-gray-600">
            <Store className="h-4 w-4 mr-1" />
            <span className="truncate">{dukkanAdi}</span>
          </div>
        )}
      </div>
      
      <div className="py-4 px-3">
        <h3 className="mb-2 px-2 text-sm font-medium text-gray-500">Ana Menü</h3>
        <nav className="space-y-1">
          {items.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                location.pathname === item.href
                  ? "bg-purple-100 text-purple-900"
                  : "text-gray-700 hover:bg-purple-50 hover:text-purple-900"
              )}
            >
              {item.icon}
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
      
      {/* Çıkış butonu */}
      <div className="py-4 px-3 mt-auto">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-700"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Çıkış Yap
        </Button>
      </div>
      
      <div className="p-4 text-xs text-gray-500 border-t">
        v1.0.0
      </div>
    </div>
  );
}

interface StaffLayoutProps {
  children: React.ReactNode;
}

export function StaffLayout({ children }: StaffLayoutProps) {
  const sidebarItems = [
    {
      title: "Ana Sayfa",
      href: "/dashboard",
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: "Müşteriler",
      href: "/customers",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Randevular",
      href: "/appointments",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      title: "Personel",
      href: "/personnel",
      icon: <UserCog className="h-5 w-5" />,
    },
    {
      title: "Hizmetler",
      href: "/services",
      icon: <Scissors className="h-5 w-5" />,
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <StaffLayoutSidebar items={sidebarItems} />
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  );
}
