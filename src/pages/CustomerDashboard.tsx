
import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase/client"; 
import { toast } from "sonner";
import { 
  Calendar, 
  User, 
  Settings, 
  LogOut, 
  Scissors, 
  Clock, 
  Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import CustomerAppointments from "./CustomerDashboard/CustomerAppointments";
import CustomerProfile from "./CustomerDashboard/CustomerProfile";
import CustomerSettings from "./CustomerDashboard/CustomerSettings";
import CustomerServices from "./CustomerDashboard/CustomerServices";
import CustomerHome from "./CustomerDashboard/CustomerHome";

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        navigate("/");
        return;
      }

      try {
        // Get user profile info
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', data.session.user.id)
          .single();
          
        if (profile && (profile.first_name || profile.last_name)) {
          setUserName(`${profile.first_name || ''} ${profile.last_name || ''}`.trim());
        } else {
          setUserName("Değerli Müşterimiz");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Başarıyla çıkış yapıldı");
      navigate("/");
    } catch (error) {
      console.error("Çıkış yapılırken hata:", error);
      toast.error("Çıkış yapılırken bir hata oluştu");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-white border-r shadow-sm">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-center text-purple-700">Kuaför Randevu</h2>
          <div className="mt-4 text-center">
            <p className="font-medium">Hoş Geldiniz</p>
            <p className="text-sm text-gray-600">{userName}</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <Link to="/customer-dashboard">
            <Button 
              variant={activeTab === "home" ? "default" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => setActiveTab("home")}
            >
              <Home className="mr-2 h-4 w-4" />
              Ana Sayfa
            </Button>
          </Link>
          <Link to="/customer-dashboard/profile">
            <Button 
              variant={activeTab === "profile" ? "default" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => setActiveTab("profile")}
            >
              <User className="mr-2 h-4 w-4" />
              Profil Bilgilerim
            </Button>
          </Link>
          <Link to="/customer-dashboard/appointments">
            <Button 
              variant={activeTab === "appointments" ? "default" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => setActiveTab("appointments")}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Randevularım
            </Button>
          </Link>
          <Link to="/customer-dashboard/services">
            <Button 
              variant={activeTab === "services" ? "default" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => setActiveTab("services")}
            >
              <Scissors className="mr-2 h-4 w-4" />
              Hizmetlerimiz
            </Button>
          </Link>
          <Link to="/customer-dashboard/settings">
            <Button 
              variant={activeTab === "settings" ? "default" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => setActiveTab("settings")}
            >
              <Settings className="mr-2 h-4 w-4" />
              Ayarlar
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50" 
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Çıkış Yap
          </Button>
        </nav>
      </div>

      {/* Mobile top navigation */}
      <div className="md:hidden fixed top-0 inset-x-0 z-10 bg-white border-b shadow-sm p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-purple-700">Kuaför Randevu</h2>
          <Button variant="outline" size="sm" onClick={() => document.getElementById('mobileMenu')?.classList.toggle('hidden')}>
            Menü
          </Button>
        </div>
        
        <div id="mobileMenu" className="hidden mt-4 space-y-2">
          <Link to="/customer-dashboard">
            <Button 
              variant={activeTab === "home" ? "default" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => {
                setActiveTab("home");
                document.getElementById('mobileMenu')?.classList.add('hidden');
              }}
            >
              <Home className="mr-2 h-4 w-4" />
              Ana Sayfa
            </Button>
          </Link>
          <Link to="/customer-dashboard/profile">
            <Button 
              variant={activeTab === "profile" ? "default" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => {
                setActiveTab("profile");
                document.getElementById('mobileMenu')?.classList.add('hidden');
              }}
            >
              <User className="mr-2 h-4 w-4" />
              Profil Bilgilerim
            </Button>
          </Link>
          <Link to="/customer-dashboard/appointments">
            <Button 
              variant={activeTab === "appointments" ? "default" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => {
                setActiveTab("appointments");
                document.getElementById('mobileMenu')?.classList.add('hidden');
              }}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Randevularım
            </Button>
          </Link>
          <Link to="/customer-dashboard/services">
            <Button 
              variant={activeTab === "services" ? "default" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => {
                setActiveTab("services");
                document.getElementById('mobileMenu')?.classList.add('hidden');
              }}
            >
              <Scissors className="mr-2 h-4 w-4" />
              Hizmetlerimiz
            </Button>
          </Link>
          <Link to="/customer-dashboard/settings">
            <Button 
              variant={activeTab === "settings" ? "default" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => {
                setActiveTab("settings");
                document.getElementById('mobileMenu')?.classList.add('hidden');
              }}
            >
              <Settings className="mr-2 h-4 w-4" />
              Ayarlar
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50" 
            onClick={() => {
              handleLogout();
              document.getElementById('mobileMenu')?.classList.add('hidden');
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Çıkış Yap
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 md:p-8 p-4 mt-16 md:mt-0">
        <Routes>
          <Route path="/" element={<CustomerHome />} />
          <Route path="/profile" element={<CustomerProfile />} />
          <Route path="/appointments" element={<CustomerAppointments />} />
          <Route path="/services" element={<CustomerServices />} />
          <Route path="/settings" element={<CustomerSettings />} />
          <Route path="*" element={<Navigate to="/customer-dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
}
