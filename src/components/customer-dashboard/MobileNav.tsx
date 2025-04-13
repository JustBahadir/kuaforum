
import React from "react";
import { Link } from "react-router-dom";
import { 
  Home, 
  User, 
  Calendar, 
  Settings, 
  LogOut, 
  Scissors 
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileNavProps {
  activeTab: string;
  onLogout: () => Promise<void>;
}

export function MobileNav({ activeTab, onLogout }: MobileNavProps) {
  return (
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
            onLogout();
            document.getElementById('mobileMenu')?.classList.add('hidden');
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Çıkış Yap
        </Button>
      </div>
    </div>
  );
}
