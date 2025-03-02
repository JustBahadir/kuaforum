
import React, { useState, useEffect } from "react";
import { islemServisi } from "@/lib/supabase/services/islemServisi";
import { Islem, Kategori } from "@/lib/supabase/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function CustomerServices() {
  const [kategoriler, setKategoriler] = useState<Kategori[]>([]);
  const [islemlerByKategori, setIslemlerByKategori] = useState<
    Record<number, Islem[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all services
        const islemlerData = await islemServisi.hepsiniGetir();
        
        // Extract unique categories from services
        const kategorilerSet = new Set<number>();
        const kategorilerData: Kategori[] = [];
        
        islemlerData.forEach(islem => {
          if (islem.kategori_id && !kategorilerSet.has(islem.kategori_id)) {
            kategorilerSet.add(islem.kategori_id);
            kategorilerData.push({
              id: islem.kategori_id,
              kategori_adi: islem.kategori?.kategori_adi || "Kategori",
              sira: islem.kategori?.sira || 0
            });
          }
        });
        
        // Sort by sira field
        kategorilerData.sort((a, b) => (a.sira || 0) - (b.sira || 0));
        
        // Group services by category
        const islemlerByKategoriData: Record<number, Islem[]> = {};
        
        islemlerData.forEach(islem => {
          if (islem.kategori_id) {
            if (!islemlerByKategoriData[islem.kategori_id]) {
              islemlerByKategoriData[islem.kategori_id] = [];
            }
            islemlerByKategoriData[islem.kategori_id].push(islem);
          }
        });
        
        // Sort each category's services by price
        Object.keys(islemlerByKategoriData).forEach(kategoriId => {
          islemlerByKategoriData[Number(kategoriId)].sort((a, b) => a.fiyat - b.fiyat);
        });
        
        setKategoriler(kategorilerData);
        setIslemlerByKategori(islemlerByKategoriData);
        
        if (kategorilerData.length > 0) {
          setActiveTab(String(kategorilerData[0].id));
        }
        
      } catch (error) {
        console.error("Error fetching services:", error);
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

      {kategoriler.length > 0 ? (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid md:grid-cols-4 grid-cols-2 h-auto">
            {kategoriler.map((kategori) => (
              <TabsTrigger
                key={kategori.id}
                value={String(kategori.id)}
                className="whitespace-normal text-center py-2"
              >
                {kategori.kategori_adi}
              </TabsTrigger>
            ))}
          </TabsList>

          {kategoriler.map((kategori) => (
            <TabsContent
              key={kategori.id}
              value={String(kategori.id)}
              className="space-y-4"
            >
              <Card>
                <CardHeader>
                  <CardTitle>{kategori.kategori_adi}</CardTitle>
                  <CardDescription>
                    {kategori.kategori_adi} kategorisindeki hizmetlerimiz
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {islemlerByKategori[kategori.id]?.map((islem, index) => (
                      <div key={islem.id}>
                        <div className="flex justify-between items-center py-2">
                          <div className="flex-grow">
                            <div className="font-medium">{islem.islem_adi}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <span className="mr-2">{islem.puan} puan</span>
                            </div>
                          </div>
                          <div className="font-semibold text-lg">
                            {formatPrice(islem.fiyat)}
                          </div>
                        </div>
                        {index < islemlerByKategori[kategori.id].length - 1 && (
                          <Separator className="my-2" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <Card>
          <CardContent className="flex justify-center items-center h-32">
            <p>Henüz hizmet kategorisi bulunmuyor.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
