
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonnelPerformance } from "./PersonnelPerformance";
import { PersonnelOperationsTable } from "./PersonnelOperationsTable";

interface PersonnelDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personelId: number;
}

export function PersonnelDetailsDialog({
  open,
  onOpenChange,
  personelId,
}: PersonnelDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("bilgiler");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Personel Detayları</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" className="absolute right-4 top-4">
              X
            </Button>
          </DialogClose>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bilgiler">Bilgiler</TabsTrigger>
            <TabsTrigger value="islemler">İşlemler</TabsTrigger>
            <TabsTrigger value="performans">Performans</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bilgiler">
            <p className="text-center py-8 text-muted-foreground">
              Personel bilgileri burada görüntülenecektir.
            </p>
          </TabsContent>
          
          <TabsContent value="islemler" className="mt-4">
            <PersonnelOperationsTable personnelId={personelId} />
          </TabsContent>
          
          <TabsContent value="performans" className="mt-4">
            <PersonnelPerformance personnelId={personelId} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
