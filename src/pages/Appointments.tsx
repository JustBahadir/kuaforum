
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarRange, Filter } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useAppointments } from "@/hooks/useAppointments";
import { personelServisi, isletmeServisi } from "@/lib/supabase";
import { Personel, RandevuDurum } from "@/lib/supabase/types";

export default function Appointments() {
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<"day" | "week" | "all">("day");
  const [personelListesi, setPersonelListesi] = useState<Personel[]>([]);
  const [selectedPersonelId, setSelectedPersonelId] = useState<string | "all">("all");
  
  // Use the appointment hook
  const {
    randevular,
    loading,
    filters,
    setFilters,
    yenile
  } = useAppointments({
    date: format(date, "yyyy-MM-dd")
  });

  // Fetch staff on mount
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        // Get current user's business
        const isletme = await isletmeServisi.kullaniciIsletmesiniGetir();
        if (isletme) {
          // Get staff for this business
          const personel = await personelServisi.isletmeyeGoreGetir(isletme.kimlik);
          setPersonelListesi(personel);
        }
      } catch (error) {
        console.error("Personel listesi alınamadı:", error);
      }
    };
    
    fetchStaff();
  }, []);

  // Handle date change
  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      yenile();
    }
  };
  
  // Render appointment status badges
  const renderStatusBadge = (status: RandevuDurum) => {
    switch (status) {
      case "planlandi":
        return <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">Planlandı</span>;
      case "tamamlandi":
        return <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Tamamlandı</span>;
      case "iptal":
        return <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">İptal</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Randevular</h2>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setDate(new Date())}>
            Bugün
          </Button>
          
          <div className="relative">
            <Button
              variant="outline"
              className="w-[240px] justify-start text-left font-normal"
            >
              <CalendarRange className="mr-2 h-4 w-4" />
              {format(date, "PPP", { locale: tr })}
            </Button>
            <div className="absolute top-full z-50 mt-2">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateChange}
                className="hidden rounded-md border bg-popover p-3 shadow-md"
              />
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="day" onValueChange={(v) => setView(v as "day" | "week" | "all")}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="day">Günlük</TabsTrigger>
            <TabsTrigger value="week">Haftalık</TabsTrigger>
            <TabsTrigger value="all">Tümü</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={selectedPersonelId}
              onValueChange={setSelectedPersonelId}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Personel Seç" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Personel</SelectItem>
                {personelListesi.map((personel) => (
                  <SelectItem key={personel.kimlik} value={personel.kimlik}>
                    {personel.kullanici_kimlik} {/* Actually should use ad_soyad */}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="day" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {format(date, "d MMMM yyyy, EEEE", { locale: tr })}
              </CardTitle>
              <CardDescription>
                Bu gün için planlanmış tüm randevular
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-r-transparent"></div>
                </div>
              ) : randevular.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Bu gün için randevu bulunamadı
                </div>
              ) : (
                <div className="space-y-4">
                  {randevular.map((randevu) => (
                    <div
                      key={randevu.kimlik}
                      className="flex justify-between items-center p-4 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium">{randevu.tarih} - {randevu.saat}</p>
                        <p className="text-sm text-muted-foreground">
                          Müşteri: {randevu.musteri_kimlik || "Belirtilmemiş"}
                        </p>
                        <div className="mt-2">
                          {renderStatusBadge(randevu.durum)}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          Detaylar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="week" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Haftalık Görünüm</CardTitle>
              <CardDescription>
                Bu hafta için planlanmış tüm randevular
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Weekly view implementation */}
              <div className="text-center py-8 text-muted-foreground">
                Haftalık görünüm yakında eklenecek
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="all" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Tüm Randevular</CardTitle>
              <CardDescription>
                Planlanmış tüm randevuları görüntüleyin
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-r-transparent"></div>
                </div>
              ) : randevular.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Henüz randevu bulunamadı
                </div>
              ) : (
                <div className="space-y-4">
                  {randevular.map((randevu) => (
                    <div
                      key={randevu.kimlik}
                      className="flex justify-between items-center p-4 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium">{randevu.tarih} - {randevu.saat}</p>
                        <p className="text-sm text-muted-foreground">
                          Müşteri: {randevu.musteri_kimlik || "Belirtilmemiş"}
                        </p>
                        <div className="mt-2">
                          {renderStatusBadge(randevu.durum)}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          Detaylar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
