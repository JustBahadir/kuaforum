
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  LogOut,
  School,
  History,
  Store
} from "lucide-react";
import { JoinShopModal } from "./JoinShopModal";
import { formatNameWithTitle, getUserRoleText } from "@/utils/userNameFormatter";

interface TabItem {
  id: string;
  label: string;
  icon: JSX.Element;
}

const tabItems: TabItem[] = [
  {
    id: "personal",
    label: "Kişisel Bilgiler",
    icon: <User className="h-5 w-5" />
  },
  {
    id: "education",
    label: "Eğitim Bilgileri",
    icon: <School className="h-5 w-5" />
  },
  {
    id: "history",
    label: "Geçmiş Bilgileri",
    icon: <History className="h-5 w-5" />
  }
];

interface UnassignedStaffSidebarProps {
  userProfile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    gender: "erkek" | "kadın" | null;
    avatarUrl?: string;
  };
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onJoinToShop: () => void;
  personelId: number | null;
}

export const UnassignedStaffSidebar: React.FC<UnassignedStaffSidebarProps> = ({
  userProfile,
  activeTab,
  setActiveTab,
  onLogout,
  onJoinToShop,
  personelId
}) => {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const initials = (userProfile.firstName?.[0] || '') + (userProfile.lastName?.[0] || '');
  const fullName = formatNameWithTitle(userProfile.firstName || '', userProfile.lastName || '', userProfile.gender);
  const userRole = getUserRoleText('staff');

  return (
    <>
      <aside className="fixed inset-y-0 left-0 bg-white shadow-md z-30 w-64 overflow-y-auto hidden md:block">
        <div className="p-6 flex flex-col items-center space-y-2 border-b border-gray-200">
          <Avatar className="w-20 h-20">
            {userProfile.avatarUrl ? (
              <AvatarImage 
                src={userProfile.avatarUrl} 
                alt={fullName} 
                className="object-cover"
              />
            ) : (
              <AvatarFallback className="text-2xl bg-purple-100 text-purple-700">
                {initials || 'U'}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="text-center">
            <p className="text-gray-500 text-sm">Hoşgeldiniz</p>
            <h3 className="font-medium text-lg mt-1">{fullName}</h3>
            <p className="text-purple-600 text-sm mt-1">{userRole}</p>
          </div>
          <Button
            className="w-full bg-purple-600 text-white hover:bg-purple-700 mt-2"
            onClick={() => setIsJoinModalOpen(true)}
          >
            <Store className="mr-2 h-4 w-4" /> İşletmeye Katıl
          </Button>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {tabItems.map((item) => (
              <li key={item.id}>
                <Button
                  variant={activeTab === item.id ? "secondary" : "ghost"}
                  className={`w-full justify-start ${
                    activeTab === item.id
                      ? "bg-purple-50 text-purple-700 hover:text-purple-700"
                      : "text-gray-600 hover:text-purple-700 hover:bg-purple-50"
                  }`}
                  onClick={() => setActiveTab(item.id)}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </Button>
              </li>
            ))}
          </ul>
          <div className="pt-4 mt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600 hover:text-red-700 hover:bg-red-50"
              onClick={onLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Çıkış Yap
            </Button>
          </div>
        </nav>
      </aside>

      <JoinShopModal 
        open={isJoinModalOpen} 
        onOpenChange={setIsJoinModalOpen}
        personelId={personelId}
      />
    </>
  );
}
