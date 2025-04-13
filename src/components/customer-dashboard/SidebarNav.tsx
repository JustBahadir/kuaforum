
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

interface SidebarNavProps {
  activeTab: string;
  userName: string;
  onLogout: () => Promise<void>;
}

export function SidebarNav({ activeTab, userName, onLogout }: SidebarNavProps) {
  return (
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
          >
            <Home className="mr-2 h-4 w-4" />
            Ana Sayfa
          </Button>
        </Link>
        <Link to="/customer-dashboard/profile">
          <Button 
            variant={activeTab === "profile" ? "default" : "ghost"} 
            className="w-full justify-start" 
          >
            <User className="mr-2 h-4 w-4" />
            Profil Bilgilerim
          </Button>
        </Link>
        <Link to="/customer-dashboard/appointments">
          <Button 
            variant={activeTab === "appointments" ? "default" : "ghost"} 
            className="w-full justify-start" 
          >
            <Calendar className="mr-2 h-4 w-4" />
            Randevularım
          </Button>
        </Link>
        <Link to="/customer-dashboard/services">
          <Button 
            variant={activeTab === "services" ? "default" : "ghost"} 
            className="w-full justify-start" 
          >
            <Scissors className="mr-2 h-4 w-4" />
            Hizmetlerimiz
          </Button>
        </Link>
        <Link to="/customer-dashboard/settings">
          <Button 
            variant={activeTab === "settings" ? "default" : "ghost"} 
            className="w-full justify-start" 
          >
            <Settings className="mr-2 h-4 w-4" />
            Ayarlar
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50" 
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Çıkış Yap
        </Button>
      </nav>
    </div>
  );
}
