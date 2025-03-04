
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Users, 
  Calendar, 
  Settings, 
  Scissors, 
  BarChart2, 
  User, 
  Store, 
  LogOut
} from "lucide-react";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { buttonVariants } from "@/components/ui/button";

interface NavItemProps {
  href: string;
  title: string;
  icon: React.ReactNode;
  active?: boolean;
}

const NavItem = ({ href, title, icon, active }: NavItemProps) => {
  return (
    <Link
      to={href}
      className={cn(
        buttonVariants({ variant: "ghost" }),
        "w-full justify-start gap-2",
        active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
      )}
    >
      {icon}
      {title}
    </Link>
  );
};

export function StaffSidebar() {
  const location = useLocation();
  const { userRole, handleLogout } = useCustomerAuth();
  const path = location.pathname;

  const isAdmin = userRole === 'admin';

  const navItems = [
    { href: "/personnel", title: "Ana Sayfa", icon: <Home size={18} />, roles: ["admin", "staff"] },
    { href: "/personnel", title: "Personel İşlemleri", icon: <Users size={18} />, roles: ["admin"] },
    { href: "/appointments", title: "Randevular", icon: <Calendar size={18} />, roles: ["admin", "staff"] },
    { href: "/services", title: "Hizmet Yönetimi", icon: <Scissors size={18} />, roles: ["admin"] },
    { href: "/shop-settings", title: "Dükkan Ayarları", icon: <Store size={18} />, roles: ["admin"] },
    { href: "/shop-statistics", title: "Dükkan İstatistikleri", icon: <BarChart2 size={18} />, roles: ["admin", "staff"] },
    { href: "/staff-profile", title: "Profilim", icon: <User size={18} />, roles: ["admin", "staff"] },
    { href: "/settings", title: "Ayarlar", icon: <Settings size={18} />, roles: ["admin", "staff"] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole || ""));

  return (
    <aside className="hidden md:flex flex-col gap-2 w-64 border-r px-2 py-4 h-screen fixed">
      <div className="flex flex-col gap-4 p-2">
        <div className="text-xl font-bold text-center py-4 border-b">Kuaför Paneli</div>
        
        <nav className="flex flex-col gap-1">
          {filteredNavItems.map((item, index) => (
            <NavItem
              key={index}
              href={item.href}
              title={item.title}
              icon={item.icon}
              active={path === item.href}
            />
          ))}
        </nav>

        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "w-full justify-start gap-2 text-destructive"
            )}
          >
            <LogOut size={18} />
            Çıkış Yap
          </button>
        </div>
      </div>
    </aside>
  );
}
