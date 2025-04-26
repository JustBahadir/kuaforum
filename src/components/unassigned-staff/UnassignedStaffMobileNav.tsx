
import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatNameWithTitle } from "@/utils/userNameFormatter";

interface UnassignedStaffMobileNavProps {
  userProfile: {
    firstName: string;
    lastName: string;
    gender: "erkek" | "kadın" | null;
    avatarUrl?: string;
  };
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const UnassignedStaffMobileNav: React.FC<UnassignedStaffMobileNavProps> = ({
  userProfile,
  activeTab,
  setActiveTab,
}) => {
  const [open, setOpen] = useState(false);

  const initials = (userProfile.firstName?.[0] || "") + (userProfile.lastName?.[0] || "");
  const fullName = formatNameWithTitle(userProfile.firstName || '', userProfile.lastName || '', userProfile.gender);

  const tabs = [
    { id: "personal", label: "Kişisel Bilgiler" },
    { id: "education", label: "Eğitim Bilgileri" },
    { id: "history", label: "Geçmiş Bilgileri" }
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setOpen(false);
  };

  return (
    <div className="sticky top-0 z-30 w-full bg-white border-b border-gray-200 md:hidden">
      <div className="flex justify-between items-center h-16 px-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="p-6 flex flex-col items-center space-y-2 border-b border-gray-200">
              <Avatar className="w-16 h-16">
                {userProfile.avatarUrl ? (
                  <AvatarImage src={userProfile.avatarUrl} alt={fullName} />
                ) : (
                  <AvatarFallback className="text-xl bg-purple-100 text-purple-700">
                    {initials || "U"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="text-center">
                <p className="text-gray-500 text-sm">Hoşgeldiniz</p>
                <h3 className="font-medium mt-1">{fullName}</h3>
                <p className="text-purple-600 text-sm mt-1">Personel</p>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "secondary" : "ghost"}
                    className={`w-full justify-start ${
                      activeTab === tab.id
                        ? "bg-purple-50 text-purple-700"
                        : "text-gray-600"
                    }`}
                    onClick={() => handleTabChange(tab.id)}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <h1 className="text-lg font-semibold">
          {tabs.find((tab) => tab.id === activeTab)?.label || "Profil"}
        </h1>
        <Avatar className="w-8 h-8">
          {userProfile.avatarUrl ? (
            <AvatarImage src={userProfile.avatarUrl} alt={fullName} />
          ) : (
            <AvatarFallback className="text-sm bg-purple-100 text-purple-700">
              {initials || "U"}
            </AvatarFallback>
          )}
        </Avatar>
      </div>
    </div>
  );
};
