
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Briefcase, History, LogOut, School, User } from "lucide-react";

interface UnassignedStaffSidebarProps {
  userProfile: any;
  activeTab: string;
  setActiveTab: (v: string) => void;
  onLogout: () => void;
  onJoinToShop: () => void;
}

export function UnassignedStaffSidebar({
  userProfile,
  activeTab,
  setActiveTab,
  onLogout,
  onJoinToShop,
}: UnassignedStaffSidebarProps) {
  return (
    <div className="w-64 bg-white border-r h-screen fixed left-0 top-0 overflow-y-auto hidden md:block">
      <div className="flex flex-col items-center p-6 border-b">
        <Avatar className="w-24 h-24">
          {userProfile?.avatar_url ? (
            <AvatarImage src={userProfile.avatar_url} alt={userProfile?.first_name || 'User'} />
          ) : (
            <AvatarFallback className="text-2xl bg-purple-100 text-purple-700">
              {userProfile?.first_name?.[0] || 'P'}
            </AvatarFallback>
          )}
        </Avatar>
        <h3 className="mt-4 font-semibold text-xl">{userProfile?.first_name} {userProfile?.last_name}</h3>
        <p className="text-sm text-gray-500">Personel</p>
      </div>

      <nav className="p-4 space-y-2">
        <button
          onClick={() => setActiveTab("personal")}
          className={`flex items-center w-full px-4 py-2 text-left rounded-md ${activeTab === "personal" ? "bg-purple-100 text-purple-700" : "text-gray-600 hover:bg-gray-100"}`}
        >
          <User size={18} className="mr-3" />
          Kişisel Bilgiler
        </button>

        <button
          onClick={() => setActiveTab("education")}
          className={`flex items-center w-full px-4 py-2 text-left rounded-md ${activeTab === "education" ? "bg-purple-100 text-purple-700" : "text-gray-600 hover:bg-gray-100"}`}
        >
          <School size={18} className="mr-3" />
          Eğitim Bilgileri
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center w-full px-4 py-2 text-left rounded-md ${activeTab === "history" ? "bg-purple-100 text-purple-700" : "text-gray-600 hover:bg-gray-100"}`}
        >
          <History size={18} className="mr-3" />
          Geçmiş Bilgileri
        </button>

        <button
          onClick={onJoinToShop}
          className={`flex items-center w-full px-4 py-2 text-left rounded-md text-gray-600 hover:bg-gray-100`}
        >
          <Briefcase size={18} className="mr-3" />
          İşletmeye Katıl
        </button>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
        <Button
          onClick={onLogout}
          variant="destructive"
          className="w-full flex items-center justify-center"
        >
          <LogOut size={18} className="mr-2" />
          Oturumu Kapat
        </Button>
      </div>
    </div>
  );
}
