
import { ReactNode } from "react";
import { SidebarNav } from "./sidebar-nav";
import { Home, Users, Calendar, Scissors, Settings } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const sidebarItems = [
    {
      title: "Ana Sayfa",
      href: "/dashboard",
      icon: <Home className="w-4 h-4" />
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
      title: "Hizmetler",
      href: "/operations",
      icon: <Scissors className="w-4 h-4" />
    },
    {
      title: "Randevular",
      href: "/appointments",
      icon: <Calendar className="w-4 h-4" />
    },
    {
      title: "Ayarlar",
      href: "/operations/staff",
      icon: <Settings className="w-4 h-4" />
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="fixed inset-y-0 left-0 z-10 w-64 border-r border-gray-200 bg-white shadow-sm">
        <div className="h-16 flex items-center border-b px-6">
          <h2 className="text-lg font-bold">Salon Yönetimi</h2>
        </div>
        <div className="py-4 px-4">
          <SidebarNav items={sidebarItems} />
        </div>
      </aside>
      <div className="pl-64 w-full">
        <main className="w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
