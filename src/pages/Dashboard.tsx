
import { useNavigate } from "react-router-dom";
import { Users, Calendar, Scissors, User } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Müşteriler",
    icon: Users,
    path: "/customers"
  },
  {
    title: "Randevular",
    icon: Calendar,
    path: "/appointments"
  },
  {
    title: "Personel",
    icon: User,
    path: "/personnel"
  },
  {
    title: "Hizmetler",
    icon: Scissors,
    path: "/services"
  }
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar>
          <SidebarHeader>
            <h2 className="text-xl font-bold px-6 py-4">Kuaför Pro</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Ana Menü</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton 
                        onClick={() => navigate(item.path)}
                        className="flex items-center gap-3 px-4 py-2 w-full"
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 text-sm text-gray-500">
            v1.0.0
          </SidebarFooter>
        </Sidebar>
        
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Hoş Geldiniz</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* İstatistik kartları buraya gelecek */}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
