
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { PersonnelList } from "./components/PersonnelList";
import { PersonnelDialog } from "./components/PersonnelDialog";
import { usePersonnel } from "@/hooks/usePersonnel";
import { useAuth } from "@/hooks/useAuth";
import { PendingStaffRequests } from "./PendingStaffRequests";
import { Personel } from "@/types/personnel";

export default function Personnel() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personel | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const { isletmeId } = useAuth();
  const { personel, loading, yenile } = usePersonnel();

  // Handle opening the dialog for adding new personnel
  const handleAddPersonnel = () => {
    setSelectedPersonnel(null);
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  // Handle opening the dialog for editing personnel
  const handleEditPersonnel = (personnel: Personel) => {
    setSelectedPersonnel(personnel);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Handle the dialog being closed
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedPersonnel(null);
  };

  // Handle the dialog submission being successful
  const handleDialogSuccess = () => {
    yenile();
    setIsDialogOpen(false);
    setSelectedPersonnel(null);
  };

  // Function to filter personnel based on active tab
  const filteredPersonnel = () => {
    if (!personel) return [];
    
    if (activeTab === "all") return personel;
    if (activeTab === "active") return personel.filter(p => p.durum !== "pasif");
    if (activeTab === "inactive") return personel.filter(p => p.durum === "pasif");
    
    return personel;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Personel Yönetimi</h1>
        <Button onClick={handleAddPersonnel} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          Yeni Personel Ekle
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full md:w-auto grid-cols-3 md:flex">
          <TabsTrigger value="all">Tüm Personel</TabsTrigger>
          <TabsTrigger value="active">Aktif</TabsTrigger>
          <TabsTrigger value="inactive">Pasif</TabsTrigger>
          <TabsTrigger value="requests">Katılım İstekleri</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="pt-4">
          <PersonnelList 
            personnel={filteredPersonnel() as any[]} 
            onEdit={handleEditPersonnel}
            isLoading={loading}
          />
        </TabsContent>

        <TabsContent value="active" className="pt-4">
          <PersonnelList 
            personnel={filteredPersonnel() as any[]}
            onEdit={handleEditPersonnel}
            isLoading={loading}
          />
        </TabsContent>

        <TabsContent value="inactive" className="pt-4">
          <PersonnelList 
            personnel={filteredPersonnel() as any[]}
            onEdit={handleEditPersonnel}
            isLoading={loading}
          />
        </TabsContent>

        <TabsContent value="requests" className="pt-4">
          <PendingStaffRequests 
            dukkanId={isletmeId || ""} 
            onRequestAccepted={yenile}
          />
        </TabsContent>
      </Tabs>

      {isDialogOpen && (
        <PersonnelDialog
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          onSuccess={handleDialogSuccess}
          personnel={selectedPersonnel}
          isEditMode={isEditMode}
        />
      )}
    </div>
  );
}
