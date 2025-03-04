
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { personelServisi, personelIslemleriServisi } from "@/lib/supabase";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BarChart, Calendar, ClipboardList } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

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

  const { data: personel, isLoading, error } = useQuery({
    queryKey: ["personel", personelId],
    queryFn: () => personelServisi.getirById(personelId),
    enabled: !!personelId && open
  });

  const { data: islemler = [], isLoading: islemleriYukluyor } = useQuery({
    queryKey: ["personel-islemleri", personelId],
    queryFn: () => personelIslemleriServisi.personelIslemleriGetir(personelId),
    enabled: !!personelId && open
  });

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex justify-center p-6">
            <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !personel) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <Alert variant="destructive">
            <AlertDescription>
              Personel bilgileri alınamadı. Lütfen tekrar deneyin.
            </AlertDescription>
          </Alert>
          <DialogFooter className="mt-4">
            <Button onClick={() => onOpenChange(false)}>Kapat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Personel Detayları</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {personel.ad_soyad.split(' ').map(name => name[0]).join('').substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{personel.ad_soyad}</h2>
              <p className="text-muted-foreground">{personel.personel_no}</p>
            </div>
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
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">PERSONEL NO</h3>
                      <p className="text-base">{personel.personel_no}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">E-POSTA</h3>
                      <p className="text-base">{personel.eposta}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">TELEFON</h3>
                      <p className="text-base">{personel.telefon}</p>
                    </div>
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
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">KAYIT TARİHİ</h3>
                      <p className="text-base">
                        {new Date(personel.created_at).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
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
                  {islemleriYukluyor ? (
                    <div className="flex justify-center p-4">
                      <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
                    </div>
                  ) : islemler.length === 0 ? (
                    <div className="text-center p-4 text-muted-foreground">
                      Bu personele ait işlem bulunmamaktadır.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="px-3 py-2 text-left">Tarih</th>
                            <th className="px-3 py-2 text-left">İşlem</th>
                            <th className="px-3 py-2 text-left">Tutar</th>
                            <th className="px-3 py-2 text-left">Prim</th>
                            <th className="px-3 py-2 text-left">Puan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {islemler.map((islem) => (
                            <tr key={islem.id} className="border-b hover:bg-gray-50">
                              <td className="px-3 py-2">
                                {new Date(islem.created_at).toLocaleDateString('tr-TR')}
                              </td>
                              <td className="px-3 py-2">{islem.islem?.islem_adi || islem.aciklama}</td>
                              <td className="px-3 py-2">{formatCurrency(islem.tutar)}</td>
                              <td className="px-3 py-2">{formatCurrency(islem.odenen)}</td>
                              <td className="px-3 py-2">{islem.puan}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
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
                        {formatCurrency(islemler.reduce((total, islem) => total + parseFloat(islem.tutar), 0))}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">Toplam Prim</h3>
                      <p className="text-3xl font-bold">
                        {formatCurrency(islemler.reduce((total, islem) => total + parseFloat(islem.odenen), 0))}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">Ortalama Puan</h3>
                      <p className="text-3xl font-bold">
                        {islemler.length > 0
                          ? (islemler.reduce((total, islem) => total + islem.puan, 0) / islemler.length).toFixed(1)
                          : '0'}
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
  );
}
