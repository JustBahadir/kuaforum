
import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Settings, User, BookOpen, History, Briefcase } from "lucide-react";

interface UnassignedStaffSidebarProps {
  userProfile: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onJoinToShop: () => void;
}

export function UnassignedStaffSidebar({ 
  userProfile, 
  activeTab, 
  setActiveTab,
  onLogout,
  onJoinToShop
}: UnassignedStaffSidebarProps) {
  return (
    <div className="hidden md:flex flex-col fixed left-0 top-0 h-screen bg-gray-900 text-white w-64 p-6">
      {/* Profil Alanı */}
      <div className="flex flex-col items-center mb-8 text-center">
        <Avatar className="w-16 h-16 mb-2">
          {userProfile?.avatar_url ? (
            <AvatarImage src={userProfile.avatar_url} alt={userProfile?.first_name || 'User'} />
          ) : (
            <AvatarFallback className="text-2xl bg-purple-100 text-purple-700">
              {userProfile?.first_name?.[0] || 'P'}
            </AvatarFallback>
          )}
        </Avatar>
        <h2 className="font-semibold text-lg">{userProfile?.first_name} {userProfile?.last_name}</h2>
        <p className="text-purple-300 text-sm">Personel</p>
      </div>

      {/* Navigasyon Menüsü */}
      <nav className="flex-1">
        <ul className="space-y-2">
          <li>
            <Button 
              variant="ghost"
              className={`w-full justify-start ${activeTab === 'personal' ? 'bg-gray-800' : ''}`}
              onClick={() => setActiveTab('personal')}
            >
              <User size={18} className="mr-2" />
              Kişisel Bilgiler
            </Button>
          </li>
          <li>
            <Button 
              variant="ghost"
              className={`w-full justify-start ${activeTab === 'education' ? 'bg-gray-800' : ''}`}
              onClick={() => setActiveTab('education')}
            >
              <BookOpen size={18} className="mr-2" />
              Eğitim Bilgileri
            </Button>
          </li>
          <li>
            <Button 
              variant="ghost"
              className={`w-full justify-start ${activeTab === 'history' ? 'bg-gray-800' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <History size={18} className="mr-2" />
              Geçmiş Bilgileri
            </Button>
          </li>
        </ul>
      </nav>

      {/* Aksiyonlar */}
      <div className="mt-auto space-y-2">
        <Button 
          onClick={onJoinToShop}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          <Briefcase size={18} className="mr-2" />
          İşletmeye Katıl
        </Button>
        <Button 
          onClick={onLogout}
          variant="destructive"
          className="w-full"
        >
          <LogOut size={18} className="mr-2" />
          Oturumu Kapat
        </Button>
      </div>
    </div>
  );
}
