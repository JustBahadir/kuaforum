
import React, { useState, useEffect } from "react";
import { islemServisi } from "@/lib/supabase/services/islemServisi";
import { kategoriServisi } from "@/lib/supabase/services/kategoriServisi";
import { Islem, Kategori } from "@/lib/supabase/types";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { Calendar } from "lucide-react";

export default function CustomerServices() {
  const [kategoriler, setKategoriler] = useState<Kategori[]>([]);
  const [islemlerByKategori, setIslemlerByKategori] = useState<
    Record<number, Islem[]>
  >({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all categories
        const kategorilerData = await kategoriServisi.hepsiniGetir();
        
        // Sort categories by sira field
        kategorilerData.sort((a, b) => (a.sira || 0) - (b.sira || 0));
        
        // Fetch all services
        const islemlerData = await islemServisi.hepsiniGetir();
        
        // Group services by category
        const islemlerByKategoriData: Record<number, Islem[]> = {};
        
        kategorilerData.forEach(kategori => {
          islemlerByKategoriData[kategori.id] = islemlerData
            .filter(islem => islem.kategori_id === kategori.id)
            .sort((a, b) => (a.sira || 0) - (b.sira || 0));
        });
        
        setKategoriler(kategorilerData);
        setIslemlerByKategori(islemlerByKategoriData);
      } catch (error) {
        console.error("Error fetching services:", error);
        toast.error("Hizmetler yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format price with Turkish Lira symbol
  const formatPrice = (price: number) => {
    return `${price.toLocaleString('tr-TR')} ₺`;
  };
  
  // Navigate to appointments page with selected service
  const handleRandevuAl = (islemId: number) => {
    navigate(`/customer-dashboard/appointments?service=${islemId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Hizmetler yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold">Hizmetlerimiz</h1>
        <p className="text-gray-600 mt-1">
          Sunduğumuz hizmetler ve fiyatları
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kategori ve Hizmetler</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {kategoriler.length > 0 ? (
              kategoriler.map((kategori) => (
                <AccordionItem key={kategori.id} value={`kategori-${kategori.id}`} className="border rounded-lg overflow-hidden">
                  <AccordionTrigger className="px-4 py-3 bg-slate-50 hover:bg-slate-100 font-medium">
                    {kategori.kategori_adi}
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-2">
                    <div className="space-y-2 py-2">
                      {islemlerByKategori[kategori.id]?.length > 0 ? (
                        islemlerByKategori[kategori.id].map((islem, index) => (
                          <div key={islem.id}>
                            <div className="flex justify-between items-center py-3">
                              <div className="w-1/3">
                                <div className="font-medium">{islem.islem_adi}</div>
                              </div>
                              <div className="w-1/3 text-center">
                                <div className="text-sm text-gray-500">
                                  {islem.puan} puan | {formatPrice(islem.fiyat)}
                                </div>
                              </div>
                              <div className="w-1/3 flex justify-end">
                                <Button 
                                  onClick={() => handleRandevuAl(islem.id)}
                                  size="sm" 
                                  className="flex items-center gap-1"
                                >
                                  <Calendar className="h-4 w-4" />
                                  Randevu Al
                                </Button>
                              </div>
                            </div>
                            {index < islemlerByKategori[kategori.id].length - 1 && (
                              <Separator className="my-2" />
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="py-2 text-gray-500">Bu kategoride henüz hizmet bulunmuyor.</div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))
            ) : (
              <div className="py-8 text-center text-gray-500">Henüz hizmet kategorisi bulunmuyor.</div>
            )}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
