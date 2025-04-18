
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
  LogOut,
  FileText,
  UserCircle,
  Menu,
  X
} from "lucide-react";
import { useState, useEffect } from "react";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface NavItemProps {
  href: string;
  title: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

const NavItem = ({ href, title, icon, active, onClick }: NavItemProps) => {
  return (
    <Link
      to={href}
      onClick={onClick}
      className={cn(
        buttonVariants({ variant: "ghost" }),
        "w-full justify-start gap-2",
        active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
      )}
    >
      {icon}
      <span className="truncate">{title}</span>
    </Link>
  );
};

export function StaffSidebar() {
  const location = useLocation();
  const { userRole, userName, handleLogout } = useCustomerAuth();
  const path = location.pathname;
  const [isOpen, setIsOpen] = useState(false);

  // admin = işletme sahibi veya business_owner
  const isAdmin = userRole === 'admin' || userRole === 'business_owner';

  const navItems = [
    { href: "/shop-home", title: "Ana Sayfa", icon: <Home size={18} />, roles: ["admin", "business_owner", "staff"] },
    { href: "/personnel", title: "Personel İşlemleri", icon: <Users size={18} />, roles: ["admin", "business_owner"] },
    { href: "/appointments", title: "Randevular", icon: <Calendar size={18} />, roles: ["admin", "business_owner", "staff"] },
    { href: "/admin/operations", title: "Hizmet Yönetimi", icon: <Scissors size={18} />, roles: ["admin", "business_owner"] },
    { href: "/customers", title: "Müşteriler", icon: <UserCircle size={18} />, roles: ["admin", "business_owner", "staff"] },
    { href: "/shop-settings", title: "Dükkan Ayarları", icon: <Store size={18} />, roles: ["admin", "business_owner"] },
    { href: "/shop-statistics", title: "Dükkan İstatistikleri", icon: <BarChart2 size={18} />, roles: ["admin", "business_owner"] },
    { href: "/operations-history", title: "İşlem Geçmişi", icon: <FileText size={18} />, roles: ["admin", "business_owner", "staff"] },
    { href: "/staff-profile", title: "Profilim", icon: <User size={18} />, roles: ["admin", "business_owner", "staff"] },
    { href: "/settings", title: "Ayarlar", icon: <Settings size={18} />, roles: ["admin", "business_owner", "staff"] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole || ""));

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [path]);

  return (
    <>
      {/* Mobile Hamburger Menu Button */}
      <div className="md:hidden fixed top-0 left-0 z-30 w-full flex items-center justify-between p-4 bg-white border-b">
        <div className="text-lg font-bold">Kuaför Paneli</div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button className="p-2">
              <Menu size={24} />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[265px] p-0">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="text-lg font-bold">Kuaför Paneli</div>
                <button onClick={() => setIsOpen(false)} className="p-1">
                  <X size={18} />
                </button>
              </div>
              
              <div className="text-center py-3 border-b">
                <p className="text-sm text-muted-foreground">Hoşgeldiniz</p>
                <p className="font-medium">{userName || "Kullanıcı"}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {userRole === 'admin' || userRole === 'business_owner' ? 'Dükkan Sahibi' : 'Personel'}
                </p>
              </div>

              <div className="flex-1 overflow-auto py-2 px-2">
                <nav className="flex flex-col gap-1">
                  {filteredNavItems.map((item, index) => (
                    <NavItem
                      key={index}
                      href={item.href}
                      title={item.title}
                      icon={item.icon}
                      active={path === item.href}
                      onClick={() => setIsOpen(false)}
                    />
                  ))}
                </nav>
              </div>

              <div className="p-2 border-t">
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
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col gap-2 w-64 border-r px-2 py-4 h-screen fixed bg-white">
        <div className="flex flex-col gap-4 p-2">
          <div className="text-xl font-bold text-center py-4 border-b">Kuaför Paneli</div>
          
          <div className="text-center py-2 mb-2">
            <p className="text-sm text-muted-foreground">Hoşgeldiniz</p>
            <p className="font-medium">{userName || "Kullanıcı"}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {userRole === 'admin' || userRole === 'business_owner' ? 'Dükkan Sahibi' : 'Personel'}
            </p>
          </div>
          
          <nav className="flex flex-col gap-1 overflow-y-auto">
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
    </>
  );
}
