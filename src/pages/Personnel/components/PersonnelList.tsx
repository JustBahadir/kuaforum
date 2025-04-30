
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, MessageSquare, Phone, Trash } from "lucide-react";
import { PersonnelCard } from "./PersonnelCard";
import { PersonnelDialog } from "./PersonnelDialog";
import { PersonnelDetailsDialog } from "./PersonnelDetailsDialog";
import { PersonnelDeleteDialog } from "./PersonnelDeleteDialog";
import { useCustomerAuth } from '@/hooks/useCustomerAuth';

interface PersonnelListProps {
  personel: any[];
  onRefresh: () => void;
  isLoading?: boolean;
  onPersonnelSelect?: (id: number) => void;
}

export function PersonnelList({ personel, onRefresh, isLoading = false, onPersonnelSelect }: PersonnelListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPersonel, setSelectedPersonel] = useState<any | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { userRole } = useCustomerAuth();

  const handleViewDetails = (personel: any) => {
    setSelectedPersonel(personel);
    if (onPersonnelSelect) {
      onPersonnelSelect(personel.id);
    }
  };

  const handleCloseDetails = () => {
    setSelectedPersonel(null);
  };

  const handleDeletePersonel = (personel: any) => {
    setSelectedPersonel(personel);
    setIsDeleteDialogOpen(true);
  };

  const handleAddClick = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    onRefresh();
  };

  const handleDeleteSuccess = () => {
    setIsDeleteDialogOpen(false);
    setSelectedPersonel(null);
    onRefresh();
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="p-4 animate-pulse h-48">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="mt-4 flex justify-end">
              <div className="h-8 w-8 bg-gray-200 rounded-full mr-2"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {personel.map((p) => (
          <PersonnelCard
            key={p.id}
            personnel={p}
            actions={[
              <Button
                key="view"
                size="icon"
                variant="ghost"
                onClick={() => handleViewDetails(p)}
              >
                <Eye className="w-4 h-4" />
              </Button>,
              <Button
                key="message"
                size="icon"
                variant="ghost"
                onClick={() => { /* Handle messaging functionality */ }}
              >
                <MessageSquare className="w-4 h-4" />
              </Button>,
              <Button
                key="call"
                size="icon"
                variant="ghost"
                onClick={() => { /* Handle call functionality */ }}
              >
                <Phone className="w-4 h-4" />
              </Button>,
              ...(userRole === 'admin' ? [
                <Button
                  key="delete"
                  size="icon"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDeletePersonel(p)}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              ] : [])
            ]}
          />
        ))}
      </div>

      {personel.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          Kayıtlı personel bulunmamaktadır.
          {userRole === 'admin' && (
            <div className="mt-4">
              <Button onClick={handleAddClick}>Personel Ekle</Button>
            </div>
          )}
        </div>
      )}

      <PersonnelDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
      />

      {selectedPersonel && (
        <PersonnelDetailsDialog
          personnel={selectedPersonel}
          open={!!selectedPersonel}
          onOpenChange={handleCloseDetails}
          onRefresh={onRefresh}
        />
      )}

      <PersonnelDeleteDialog
        personnel={selectedPersonel}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}
