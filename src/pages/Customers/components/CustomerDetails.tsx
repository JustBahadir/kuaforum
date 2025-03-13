
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerOperationsTable } from "./CustomerOperationsTable";
import { CustomerPreferences } from "./CustomerPreferences";
import { Musteri } from "@/lib/supabase/types";
import { formatPhoneNumber } from "@/utils/phoneFormatter";
import { Button } from "@/components/ui/button";
import { Pencil, User, Calendar, Gift, Star } from "lucide-react";
import { CustomerPersonalInfo } from "./CustomerPersonalInfo";

interface CustomerDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Musteri | null;
}

export function CustomerDetails({ open, onOpenChange, customer }: CustomerDetailsProps) {
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("islemler");
  
  const toggleEditMode = () => {
    setEditMode(!editMode);
    if (!editMode) {
      setActiveTab("kisiBilgileri");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Müşteri Detayları</DialogTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleEditMode}
            className="flex items-center gap-1"
          >
            <Pencil className="h-4 w-4" />
            {editMode ? "Düzenlemeyi Bitir" : "Düzenle"}
          </Button>
        </DialogHeader>
        
        {customer && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">AD SOYAD</h3>
                <p className="mt-1 text-base">
                  {customer.first_name} {customer.last_name || ''} 
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">TELEFON</h3>
                <p className="mt-1 text-base">
                  {customer.phone && formatPhoneNumber(customer.phone) || '-'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">KAYIT TARİHİ</h3>
                <p className="mt-1 text-base">
                  {customer.created_at 
                    ? new Date(customer.created_at).toLocaleDateString('tr-TR') 
                    : '-'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">TOPLAM İŞLEM</h3>
                <p className="mt-1 text-base">{customer.total_services || 0}</p>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="islemler" className="flex-1 flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  İşlem Geçmişi
                </TabsTrigger>
                <TabsTrigger value="randevular" className="flex-1 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Randevu Geçmişi
                </TabsTrigger>
                <TabsTrigger value="tercihler" className="flex-1 flex items-center gap-1">
                  <Gift className="h-4 w-4" />
                  Kişisel Tercihler
                </TabsTrigger>
                <TabsTrigger value="kisiBilgileri" className="flex-1 flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Kişisel Bilgiler
                </TabsTrigger>
              </TabsList>
              <TabsContent value="islemler" className="border rounded-md mt-4">
                <CustomerOperationsTable customerId={String(customer.id)} />
              </TabsContent>
              <TabsContent value="randevular" className="border rounded-md p-4 mt-4">
                <div className="text-center py-4">Randevu geçmişi burada gösterilecek.</div>
              </TabsContent>
              <TabsContent value="tercihler" className="border rounded-md mt-4">
                <CustomerPreferences customerId={String(customer.id)} />
              </TabsContent>
              <TabsContent value="kisiBilgileri" className="border rounded-md mt-4">
                <CustomerPersonalInfo 
                  customerId={String(customer.id)} 
                  customer={customer} 
                  editMode={editMode}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
