
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Home, 
  User, 
  Calendar, 
  Settings, 
  LogOut, 
  Scissors,
  Menu,
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface MobileNavProps {
  activeTab: string;
  userName: string;
  onLogout: () => Promise<void>;
}

export function MobileNav({ activeTab, userName, onLogout }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleNavigation = () => {
    setIsOpen(false);
  };
  
  const handleLogout = async () => {
    await onLogout();
    setIsOpen(false);
  };
  
  return (
    <div className="md:hidden fixed top-0 inset-x-0 z-30 bg-white border-b shadow-sm">
      <div className="flex justify-between items-center p-4">
        <h2 className="text-lg font-bold text-purple-700">Kuaför Randevu</h2>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menüyü Aç</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[260px] p-0">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-bold text-purple-700">Kuaför Randevu</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                  <span className="sr-only">Kapat</span>
                </Button>
              </div>
              
              <div className="p-4 border-b">
                <p className="font-medium text-center">Hoş Geldiniz</p>
                <p className="text-sm text-gray-600 text-center">{userName}</p>
              </div>
              
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <Link to="/customer-dashboard" onClick={handleNavigation}>
                  <Button 
                    variant={activeTab === "home" ? "default" : "ghost"} 
                    className="w-full justify-start" 
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Ana Sayfa
                  </Button>
                </Link>
                <Link to="/customer-dashboard/profile" onClick={handleNavigation}>
                  <Button 
                    variant={activeTab === "profile" ? "default" : "ghost"} 
                    className="w-full justify-start" 
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profil Bilgilerim
                  </Button>
                </Link>
                <Link to="/customer-dashboard/appointments" onClick={handleNavigation}>
                  <Button 
                    variant={activeTab === "appointments" ? "default" : "ghost"} 
                    className="w-full justify-start" 
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Randevularım
                  </Button>
                </Link>
                <Link to="/customer-dashboard/services" onClick={handleNavigation}>
                  <Button 
                    variant={activeTab === "services" ? "default" : "ghost"} 
                    className="w-full justify-start" 
                  >
                    <Scissors className="mr-2 h-4 w-4" />
                    Hizmetlerimiz
                  </Button>
                </Link>
                <Link to="/customer-dashboard/settings" onClick={handleNavigation}>
                  <Button 
                    variant={activeTab === "settings" ? "default" : "ghost"} 
                    className="w-full justify-start" 
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Ayarlar
                  </Button>
                </Link>
              </nav>
              
              <div className="p-4 border-t">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50" 
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Çıkış Yap
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Bottom Navigation for quick access */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t flex justify-around py-2 z-30">
        <Link to="/customer-dashboard">
          <Button 
            variant={activeTab === "home" ? "default" : "ghost"} 
            size="icon"
            className="flex flex-col items-center justify-center h-14 w-14 rounded-full"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Ana Sayfa</span>
          </Button>
        </Link>
        <Link to="/customer-dashboard/appointments">
          <Button 
            variant={activeTab === "appointments" ? "default" : "ghost"} 
            size="icon"
            className="flex flex-col items-center justify-center h-14 w-14 rounded-full"
          >
            <Calendar className="h-5 w-5" />
            <span className="text-xs mt-1">Randevu</span>
          </Button>
        </Link>
        <Link to="/customer-dashboard/services">
          <Button 
            variant={activeTab === "services" ? "default" : "ghost"} 
            size="icon"
            className="flex flex-col items-center justify-center h-14 w-14 rounded-full"
          >
            <Scissors className="h-5 w-5" />
            <span className="text-xs mt-1">Hizmetler</span>
          </Button>
        </Link>
        <Link to="/customer-dashboard/profile">
          <Button 
            variant={activeTab === "profile" ? "default" : "ghost"} 
            size="icon"
            className="flex flex-col items-center justify-center h-14 w-14 rounded-full"
          >
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Profil</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
