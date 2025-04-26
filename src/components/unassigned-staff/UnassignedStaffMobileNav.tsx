
import React from "react";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface UnassignedStaffMobileNavProps {
  userProfile: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function UnassignedStaffMobileNav({
  userProfile,
  activeTab,
  setActiveTab,
}: UnassignedStaffMobileNavProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsOpen(false);
  };

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b p-4 z-50 flex justify-between items-center">
      <div className="font-semibold">Personel Profili</div>
      
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="top" className="pt-12">
          <div className="flex justify-end">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <nav className="flex flex-col gap-2 mt-4">
            <Button
              variant={activeTab === "personal" ? "default" : "ghost"}
              className="justify-start"
              onClick={() => handleTabChange("personal")}
            >
              Kişisel Bilgiler
            </Button>
            <Button
              variant={activeTab === "education" ? "default" : "ghost"}
              className="justify-start"
              onClick={() => handleTabChange("education")}
            >
              Eğitim Bilgileri
            </Button>
            <Button
              variant={activeTab === "history" ? "default" : "ghost"}
              className="justify-start"
              onClick={() => handleTabChange("history")}
            >
              Geçmiş Bilgileri
            </Button>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
