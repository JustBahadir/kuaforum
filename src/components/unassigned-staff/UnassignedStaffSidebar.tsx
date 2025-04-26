
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Briefcase, School, History, LogOut, User } from "lucide-react";

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
        <Button
          onClick={() => setActiveTab("personal")}
          variant="ghost"
          className={`w-full justify-start ${activeTab === "personal" ? "bg-purple-100 text-purple-700" : ""}`}
        >
          <User className="mr-2 h-4 w-4" />
          Kişisel Bilgiler
        </Button>

        <Button
          onClick={() => setActiveTab("education")}
          variant="ghost"
          className={`w-full justify-start ${activeTab === "education" ? "bg-purple-100 text-purple-700" : ""}`}
        >
          <School className="mr-2 h-4 w-4" />
          Eğitim Bilgileri
        </Button>

        <Button
          onClick={() => setActiveTab("history")}
          variant="ghost"
          className={`w-full justify-start ${activeTab === "history" ? "bg-purple-100 text-purple-700" : ""}`}
        >
          <History className="mr-2 h-4 w-4" />
          Geçmiş Bilgileri
        </Button>

        <Button
          onClick={onJoinToShop}
          variant="default"
          className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
        >
          <Briefcase className="mr-2 h-4 w-4" />
          İşletmeye Katıl
        </Button>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
        <Button
          onClick={onLogout}
          variant="destructive"
          className="w-full"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Oturumu Kapat
        </Button>
      </div>
    </div>
  );
}
