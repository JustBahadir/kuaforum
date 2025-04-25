
import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, School, History } from "lucide-react";

interface UnassignedStaffMobileNavProps {
  userProfile: any;
  activeTab: string;
  setActiveTab: (v: string) => void;
}

export function UnassignedStaffMobileNav({
  userProfile,
  activeTab,
  setActiveTab,
}: UnassignedStaffMobileNavProps) {
  return (
    <div className="md:hidden">
      <div className="p-4 flex items-center justify-between border-b">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarFallback className="bg-purple-100 text-purple-700">
              {userProfile?.first_name?.[0] || 'P'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{userProfile?.first_name} {userProfile?.last_name}</h3>
            <p className="text-xs text-gray-500">Personel</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-4">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="personal" className="flex items-center">
            <User size={16} className="mr-2" /> Kişisel
          </TabsTrigger>
          <TabsTrigger value="education" className="flex items-center">
            <School size={16} className="mr-2" /> Eğitim
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center">
            <History size={16} className="mr-2" /> Geçmiş
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
