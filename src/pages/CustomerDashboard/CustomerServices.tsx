
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { kategorilerServisi } from "@/lib/supabase/services/kategoriServisi";
import { islemServisi } from "@/lib/supabase/services/islemServisi";
import { useShopData } from "@/hooks/useShopData";

interface CustomerServicesProps {
  // Define any props here
}

export function CustomerServices({}: CustomerServicesProps) {
  const [activeTab, setActiveTab] = useState("");
  const { isletmeData } = useShopData(null);
  const dukkanId = isletmeData?.id;

  // Fetch categories
  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useQuery({
    queryKey: ["categories", dukkanId],
    queryFn: () => kategorilerServisi.hepsiniGetir(),
    enabled: !!dukkanId,
  });

  // Fetch services
  const {
    data: services = [],
    isLoading: isServicesLoading,
    isError: isServicesError,
  } = useQuery({
    queryKey: ["services", dukkanId],
    queryFn: () => islemServisi.hepsiniGetir(),
    enabled: !!dukkanId,
  });
  
  // Set default active tab when categories are loaded
  useEffect(() => {
    if (categories && categories.length > 0 && !activeTab) {
      setActiveTab(categories[0].kategori_adi);
    }
  }, [categories, activeTab]);

  // Filter services based on the selected category
  const filteredServices = (categoryId: number) =>
    services.filter((service) => service.kategori_id === categoryId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hizmetlerimiz</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 overflow-auto flex-nowrap">
            {isCategoriesLoading ? (
              <>
                <Skeleton className="h-10 w-[100px]" />
                <Skeleton className="h-10 w-[100px]" />
                <Skeleton className="h-10 w-[100px]" />
              </>
            ) : isCategoriesError ? (
              <div>Kategoriler yüklenirken bir hata oluştu.</div>
            ) : categories.length > 0 ? (
              categories.map((category) => (
                <TabsTrigger value={category.kategori_adi} key={category.id}>
                  {category.kategori_adi}
                </TabsTrigger>
              ))
            ) : (
              <div className="p-2 text-sm text-muted-foreground">Henüz hizmet kategorisi bulunmamaktadır.</div>
            )}
          </TabsList>
          
          {isCategoriesLoading || isServicesLoading ? (
            <>
              <Skeleton className="h-20 w-full mb-4" />
              <Skeleton className="h-20 w-full mb-4" />
              <Skeleton className="h-20 w-full" />
            </>
          ) : isCategoriesError || isServicesError ? (
            <div className="p-4 bg-red-50 text-red-800 rounded-md">
              Hizmetler yüklenirken bir hata oluştu.
            </div>
          ) : categories.length > 0 ? (
            categories.map((category) => (
              <TabsContent value={category.kategori_adi} key={category.id}>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {filteredServices(category.id).length > 0 ? (
                    filteredServices(category.id).map((service) => (
                      <Card key={service.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium">{service.islem_adi}</h3>
                            <div className="text-right">
                              <p className="font-bold">{service.fiyat} ₺</p>
                              {service.puan > 0 && <p className="text-xs text-green-600">{service.puan} puan</p>}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full p-4 text-center text-muted-foreground">
                      Bu kategoride henüz hizmet bulunmamaktadır.
                    </div>
                  )}
                </div>
              </TabsContent>
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              Henüz hizmet kategorisi bulunmamaktadır.
            </div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
