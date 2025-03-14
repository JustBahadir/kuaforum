import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { personelServisi } from "@/lib/supabase";
import { personelIslemleriServisi } from "@/lib/supabase/services/personelIslemleriServisi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ClipboardList, Calendar, BarChart, Edit, Copy } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { formatPhoneNumber } from "@/utils/phoneFormatter";
import { toast } from "sonner";
import { PersonnelEditDialog } from "./PersonnelEditDialog";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { PersonnelOperationsTable } from "./PersonnelOperationsTable";

interface PersonnelDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personelId: number;
}

export function PersonnelDetailsDialog({
  open,
  onOpenChange,
  personelId
}: PersonnelDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("bilgiler");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { userRole } = useCustomerAuth();
  const isAdmin = userRole === 'admin';

  console.log("PersonnelDetailsDialog: Opening for personnel ID:", personelId);

  const { data: personel, isLoading, error } = useQuery({
    queryKey: ["personel", personelId],
    queryFn: () => {
      console.log("Fetching personnel with ID:", personelId);
      if (!personelId || personelId <= 0) {
        console.error("Invalid personel ID:", personelId);
        return Promise.reject(new Error("Geçersiz personel ID"));
      }
      return personelServisi.getirById(personelId);
    },
    enabled: !!personelId && open && personelId > 0,
    retry: 5,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    staleTime: 30000
  });

  const { data: islemler = [], isLoading: islemleriYukluyor } = useQuery({
    queryKey: ["personel-islemleri", personelId],
    queryFn: () => personelIslemleriServisi.personelIslemleriGetir(personelId),
    enabled: !!personelId && open && personelId > 0 && !!personel
  });

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("IBAN kopyalandı");
  };

  const handleEditComplete = () => {
    setEditDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ["personel", personelId] });
  };

  console.log("PersonnelDetailsDialog state:", { isLoading, error, personel });
  console.log("Personnel operations:", islemler);

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Personel Detayları</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-6">
            <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !personel) {
    console.error("Personnel details error:", error);
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Personel Detayları</DialogTitle>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertDescription>
              Personel bilgileri alınamadı. Lütfen tekrar deneyin.
              {error instanceof Error && ` Hata: ${error.message}`}
            </AlertDescription>
          </Alert>
          <DialogFooter className="mt-4">
            <Button onClick={() => onOpenChange(false)}>Kapat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const totalRevenue = islemler.reduce((sum, islem) => sum + (islem.tutar || 0), 0);
  const totalCommission = islemler.reduce((sum, islem) => sum + (islem.odenen || 0), 0);
  const totalPoints = islemler.reduce((sum, islem) => sum + (islem.puan || 0), 0);
  const averagePoints = islemler.length > 0 ? totalPoints / islemler.length : 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Personel Detayları</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={personel.avatar_url} />
                  <AvatarFallback className="text-lg">
                    {personel.ad_soyad.split(' ').map(name => name[0]).join('').substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{personel.ad_soyad}</h2>
                  {isAdmin && (
                    <p className="text-muted-foreground">{personel.personel_no}</p>
                  )}
                </div>
              </div>
              {isAdmin && (
                <Button 
                  onClick={() => setEditDialogOpen(true)} 
                  variant="outline" 
                  className="flex gap-2 items-center"
                >
                  <Edit className="h-4 w-4" /> 
                  Düzenle
                </Button>
              )}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full mb-4">
                <TabsTrigger value="bilgiler" className="flex-1">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Bilgiler
                </TabsTrigger>
                <TabsTrigger value="islemler" className="flex-1">
                  <Calendar className="mr-2 h-4 w-4" />
                  İşlemler
                </TabsTrigger>
                <TabsTrigger value="performans" className="flex-1">
                  <BarChart className="mr-2 h-4 w-4" />
                  Performans
                </TabsTrigger>
              </TabsList>

              <TabsContent value="bilgiler">
                <Card>
                  <CardHeader>
                    <CardTitle>Personel Bilgileri</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">AD SOYAD</h3>
                        <p className="text-base">{personel.ad_soyad}</p>
                      </div>
                      
                      {isAdmin && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">PERSONEL NO</h3>
                          <p className="text-base">{personel.personel_no}</p>
                        </div>
                      )}
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">E-POSTA</h3>
                        <p className="text-base">{personel.eposta}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">TELEFON</h3>
                        <p className="text-base">{formatPhoneNumber(personel.telefon)}</p>
                      </div>
                      
                      {isAdmin && (
                        <>
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">ADRES</h3>
                            <p className="text-base">{personel.adres || "Belirtilmemiş"}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">ÇALIŞMA SİSTEMİ</h3>
                            <p className="text-base">{personel.calisma_sistemi === 'haftalik' ? 'Haftalık' : 'Aylık'}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">MAAŞ</h3>
                            <p className="text-base">{formatCurrency(personel.maas)}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">PRİM YÜZDESİ</h3>
                            <p className="text-base">%{personel.prim_yuzdesi}</p>
                          </div>
                          <div className="col-span-2">
                            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                              IBAN
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 p-0"
                                onClick={() => copyToClipboard(personel.iban)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </h3>
                            <p className="text-base">{personel.iban || "Belirtilmemiş"}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">KAYIT TARİHİ</h3>
                            <p className="text-base">
                              {new Date(personel.created_at).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="islemler">
                <Card>
                  <CardHeader>
                    <CardTitle>Personel İşlemleri</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PersonnelOperationsTable personnelId={personelId} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performans">
                <Card>
                  <CardHeader>
                    <CardTitle>Personel Performans</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-800 mb-2">Toplam İşlem</h3>
                        <p className="text-3xl font-bold">{islemler.length}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-800 mb-2">Toplam Ciro</h3>
                        <p className="text-3xl font-bold">
                          {formatCurrency(totalRevenue)}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-800 mb-2">Toplam Prim</h3>
                        <p className="text-3xl font-bold">
                          {formatCurrency(totalCommission)}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-800 mb-2">Ortalama Puan</h3>
                        <p className="text-3xl font-bold">
                          {averagePoints.toFixed(1)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Kapat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {personelId && isAdmin && (
        <PersonnelEditDialog 
          open={editDialogOpen} 
          onOpenChange={setEditDialogOpen}
          personelId={personelId}
          onEditComplete={handleEditComplete}
        />
      )}
    </>
  );
}
