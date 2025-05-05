
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarRange, CreditCard, User, History } from "lucide-react";
import { toast } from "sonner";
import { musteriServisi, randevuServisi, personelIslemleriServisi } from "@/lib/supabase";
import { Musteri } from "@/lib/supabase/types";
import CustomerAppointmentsTable from "./CustomerAppointmentsTable";
import { PersonelIslemi } from "@/lib/supabase/temporaryTypes";

interface CustomerDetailsProps {
  musteriId: string;
}

export function CustomerDetails({ musteriId }: CustomerDetailsProps) {
  const [musteri, setMusteri] = useState<Musteri | null>(null);
  const [randevular, setRandevular] = useState<any[]>([]);
  const [islemler, setIslemler] = useState<PersonelIslemi[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");

  // Load customer details
  useEffect(() => {
    const loadCustomerDetails = async () => {
      if (!musteriId) return;
      
      try {
        setLoading(true);
        
        // Get customer profile
        const musteriVerisi = await musteriServisi.getir(musteriId);
        if (musteriVerisi) {
          setMusteri(musteriVerisi);
        }
        
        // Get appointments
        const randevuVerileri = await randevuServisi.musteriyeGoreGetir(musteriId);
        setRandevular(randevuVerileri);
        
        // Get operations
        const islemVerileri = await personelIslemleriServisi.musteriyeGoreGetir(musteriId);
        setIslemler(islemVerileri);
        
      } catch (error) {
        console.error("Müşteri detayları yüklenirken hata:", error);
        toast.error("Müşteri bilgileri yüklenemedi");
      } finally {
        setLoading(false);
      }
    };
    
    loadCustomerDetails();
  }, [musteriId]);

  // Refresh data
  const handleRefresh = () => {
    if (musteriId) {
      const loadCustomerDetails = async () => {
        try {
          // Get appointments
          const randevuVerileri = await randevuServisi.musteriyeGoreGetir(musteriId);
          setRandevular(randevuVerileri);
          
          // Get operations
          const islemVerileri = await personelIslemleriServisi.musteriyeGoreGetir(musteriId);
          setIslemler(islemVerileri);
          
          toast.success("Veriler yenilendi");
        } catch (error) {
          console.error("Veriler yenilenirken hata:", error);
          toast.error("Veriler yenilenemedi");
        }
      };
      
      loadCustomerDetails();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-r-transparent"></div>
      </div>
    );
  }

  if (!musteri) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Müşteri bilgisi bulunamadı
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold">
              {musteri.ad} {musteri.soyad}
            </CardTitle>
            <CardDescription>
              {musteri.telefon ? `Telefon: ${musteri.telefon}` : "Telefon bilgisi yok"}
            </CardDescription>
          </div>
          
          <Button
            variant="outline"
            onClick={handleRefresh}
          >
            Yenile
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="info" className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Bilgiler
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center">
              <CalendarRange className="h-4 w-4 mr-2" />
              Randevular
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center">
              <History className="h-4 w-4 mr-2" />
              İşlem Geçmişi
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Ödemeler
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="info">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Kişisel Bilgiler</h3>
                  <div className="rounded-md border p-4 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm text-muted-foreground">Ad:</div>
                      <div className="text-sm font-medium">{musteri.ad || "-"}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm text-muted-foreground">Soyad:</div>
                      <div className="text-sm font-medium">{musteri.soyad || "-"}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm text-muted-foreground">Telefon:</div>
                      <div className="text-sm font-medium">{musteri.telefon || "-"}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm text-muted-foreground">Doğum Tarihi:</div>
                      <div className="text-sm font-medium">{musteri.dogum_tarihi || "-"}</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Müşteri Bilgileri</h3>
                  <div className="rounded-md border p-4 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm text-muted-foreground">Toplam Randevu:</div>
                      <div className="text-sm font-medium">{randevular.length}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm text-muted-foreground">Toplam İşlem:</div>
                      <div className="text-sm font-medium">{islemler.length}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm text-muted-foreground">İlk Ziyaret:</div>
                      <div className="text-sm font-medium">
                        {musteri.created_at ? new Date(musteri.created_at).toLocaleDateString() : "-"}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm text-muted-foreground">Son İşlem:</div>
                      <div className="text-sm font-medium">
                        {islemler.length > 0
                          ? new Date(islemler[0].created_at).toLocaleDateString()
                          : "-"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="appointments">
            <CustomerAppointmentsTable musteriId={musteriId} onRefresh={handleRefresh} />
          </TabsContent>
          
          <TabsContent value="history">
            <div className="rounded-md border">
              {islemler.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  Bu müşteri için işlem kaydı bulunmuyor
                </div>
              ) : (
                <div className="p-4">
                  <h3 className="font-medium mb-4">İşlem Geçmişi</h3>
                  <div className="space-y-4">
                    {islemler.map((islem) => (
                      <div key={islem.id} className="flex justify-between p-4 rounded-md border">
                        <div>
                          <p className="font-medium">{islem.aciklama}</p>
                          <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                            <span>Tutar: {islem.tutar} ₺</span>
                            <span>Tarih: {new Date(islem.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="payments">
            <div className="text-center py-8 text-muted-foreground">
              Ödeme bilgileri şu anda kullanılamıyor
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default CustomerDetails;
