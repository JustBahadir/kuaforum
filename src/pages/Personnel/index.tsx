
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonnelList } from "./components/PersonnelList";
import { PersonnelDialog } from "./components/PersonnelDialog";
import { PersonnelDeleteDialog } from "./components/PersonnelDeleteDialog";
import { PersonnelPerformance } from "./components/PersonnelPerformance";
import PendingStaffRequests from "./PendingStaffRequests";
import { Personel } from "@/types/personnel";
import { usePersonnel } from "@/hooks/usePersonnel";

export default function Personnel() {
  const { data, isLoading, refetch } = usePersonnel();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personel | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const handleEditPersonnel = (personnel: Personel) => {
    setSelectedPersonnel(personnel);
    setDialogOpen(true);
  };

  const handleDeletePersonnel = (personnel: Personel) => {
    setSelectedPersonnel(personnel);
    setDeleteDialogOpen(true);
  };

  const handleAddNewPersonnel = () => {
    setSelectedPersonnel(null);
    setDialogOpen(true);
  };

  const filteredPersonnel = data ? data.filter((p) => {
    if (activeTab === "all") return true;
    // Add more filters as needed
    return true;
  }) : [];

  return (
    <div className="container px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Personel Yönetimi</h1>
        <Button onClick={handleAddNewPersonnel}>Yeni Personel Ekle</Button>
      </div>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="all">Tüm Personel</TabsTrigger>
          <TabsTrigger value="performance">Performans</TabsTrigger>
          <TabsTrigger value="requests">Başvurular</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Personel Listesi</CardTitle>
            </CardHeader>
            <CardContent>
              <PersonnelList
                personel={filteredPersonnel}
                onEdit={handleEditPersonnel}
                isLoading={isLoading}
                onRefresh={refetch}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Personel Performansı</CardTitle>
            </CardHeader>
            <CardContent>
              <PersonnelPerformance
                personel={filteredPersonnel}
                onEdit={handleEditPersonnel}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Personel Başvuruları</CardTitle>
            </CardHeader>
            <CardContent>
              <PendingStaffRequests />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedPersonnel && (
        <PersonnelDeleteDialog
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onSuccess={() => {
            setDeleteDialogOpen(false);
            refetch();
          }}
          personnel={selectedPersonnel}
        />
      )}

      <PersonnelDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={() => {
          setDialogOpen(false);
          refetch();
        }}
        personnel={selectedPersonnel || undefined}
        isEditMode={!!selectedPersonnel}
      />
    </div>
  );
}
