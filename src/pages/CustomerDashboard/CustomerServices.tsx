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
  const [activeTab, setActiveTab] = useState("haircut");
  const { isletmeData } = useShopData();
  const dukkanId = isletmeData?.id;

  // Fetch categories
  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useQuery({
    queryKey: ["categories", dukkanId],
    queryFn: () => kategorilerServisi.hepsiniGetir(dukkanId),
    enabled: !!dukkanId,
  });

  // Fetch services
  const {
    data: services = [],
    isLoading: isServicesLoading,
    isError: isServicesError,
  } = useQuery({
    queryKey: ["services", dukkanId],
    queryFn: () => islemServisi.hepsiniGetir(dukkanId),
    enabled: !!dukkanId,
  });

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
          <TabsList>
            {isCategoriesLoading ? (
              <>
                <Skeleton className="h-10 w-[100px]" />
                <Skeleton className="h-10 w-[100px]" />
                <Skeleton className="h-10 w-[100px]" />
              </>
            ) : isCategoriesError ? (
              <div>Kategoriler yüklenirken bir hata oluştu.</div>
            ) : (
              categories.map((category) => (
                <TabsTrigger value={category.kategori_adi} key={category.id}>
                  {category.kategori_adi}
                </TabsTrigger>
              ))
            )}
          </TabsList>
          {isCategoriesLoading ? (
            <>
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </>
          ) : isCategoriesError ? (
            <div>Hizmetler yüklenirken bir hata oluştu.</div>
          ) : (
            categories.map((category) => (
              <TabsContent value={category.kategori_adi} key={category.id}>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {filteredServices(category.id).map((service) => (
                    <Card key={service.id}>
                      <CardContent>
                        <CardTitle>{service.islem_adi}</CardTitle>
                        <div>Fiyat: {service.fiyat} TL</div>
                        <div>Puan: {service.puan}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}

