
import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { 
  Home, 
  Store, 
  Calendar, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  UserCircle
} from "lucide-react";

interface StaffLayoutProps {
  children: ReactNode;
}

export function StaffLayout({ children }: StaffLayoutProps) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  const checkAuthStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate('/staff-login');
      return;
    }
    
    setUser(user);
    
    // Check user role
    const role = user.user_metadata?.role;
    if (role !== 'staff' && role !== 'admin') {
      toast.error("Bu sayfaya erişim yetkiniz bulunmuyor");
      navigate('/login');
    }
  };
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/staff-login');
  };
  
  const getFirstName = () => {
    return user?.user_metadata?.first_name || 'Personel';
  };

  return (
    <div className="flex h-screen">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed z-50 top-4 left-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>
      
      {/* Sidebar - mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="p-5 border-b">
            <h2 className="text-xl font-semibold">Kuaför Paneli</h2>
            {user && (
              <p className="text-sm text-muted-foreground">Hoş geldin, {getFirstName()}</p>
            )}
          </div>
          
          <nav className="flex-1 p-5 space-y-1">
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => {
                navigate('/shop-home');
                setSidebarOpen(false);
              }}
            >
              <Home className="mr-2 h-4 w-4" />
              Ana Sayfa
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => {
                navigate('/admin/appointments');
                setSidebarOpen(false);
              }}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Randevular
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => {
                navigate('/shop-personnel');
                setSidebarOpen(false);
              }}
            >
              <Users className="mr-2 h-4 w-4" />
              Personel
            </Button>

            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => {
                navigate('/shop-requests');
                setSidebarOpen(false);
              }}
            >
              <Store className="mr-2 h-4 w-4" />
              Katılım İstekleri
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => {
                navigate('/staff-profile');
                setSidebarOpen(false);
              }}
            >
              <UserCircle className="mr-2 h-4 w-4" />
              Profilim
            </Button>
          </nav>
          
          <div className="p-5 border-t mt-auto">
            <Button 
              variant="outline" 
              className="w-full justify-start text-red-500" 
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Çıkış Yap
            </Button>
          </div>
        </div>
      </aside>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 pt-16 lg:pt-6">
          {children}
        </div>
      </div>
    </div>
  );
}
