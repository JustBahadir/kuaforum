import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IslemKategori } from "@/lib/supabase/types"; // Use IslemKategori instead of Kategori
import { kategoriServisi } from "@/lib/supabase/services/kategoriServisi";
import { islemServisi } from "@/lib/supabase/services/islemServisi";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function CustomerServices() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<IslemKategori[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<IslemKategori | null>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(false);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await kategoriServisi.hepsiniGetir();
        setCategories(data);
        
        // Select first category by default
        if (data.length > 0) {
          setSelectedCategory(data[0]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Kategoriler yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  useEffect(() => {
    const fetchServices = async () => {
      if (!selectedCategory) return;
      
      try {
        setServicesLoading(true);
        const data = await islemServisi.kategoriIslemleriGetir(selectedCategory.id);
        setServices(data);
      } catch (error) {
        console.error("Error fetching services:", error);
        toast.error("Hizmetler yüklenirken bir hata oluştu");
      } finally {
        setServicesLoading(false);
      }
    };
    
    fetchServices();
  }, [selectedCategory]);
  
  const handleCategorySelect = (category: IslemKategori) => {
    setSelectedCategory(category);
  };
  
  const handleBookService = (serviceId: number) => {
    navigate(`/customer/appointments?service=${serviceId}`);
  };
  
  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold">Hizmetlerimiz</h1>
        <p className="text-gray-600 mt-1">Sunduğumuz hizmetleri keşfedin ve randevu alın</p>
      </div>
      
      <div className="grid md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Kategoriler</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : categories.length > 0 ? (
                <div className="space-y-1">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory?.id === category.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => handleCategorySelect(category)}
                    >
                      {category.kategori_adi}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-gray-500">Kategori bulunamadı</p>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>{selectedCategory?.kategori_adi || "Hizmetler"}</CardTitle>
              <CardDescription>
                {selectedCategory 
                  ? `${selectedCategory.kategori_adi} kategorisindeki hizmetler` 
                  : "Lütfen bir kategori seçin"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {servicesLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : services.length > 0 ? (
                <div className="space-y-4">
                  {services.map((service) => (
                    <Card key={service.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold">{service.islem_adi}</h3>
                            <p className="text-sm text-gray-500">
                              {service.puan} Puan
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{service.fiyat} TL</p>
                            <Button 
                              size="sm" 
                              onClick={() => handleBookService(service.id)}
                              className="mt-2"
                            >
                              Randevu Al
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-gray-500">
                  {selectedCategory 
                    ? "Bu kategoride hizmet bulunamadı" 
                    : "Lütfen bir kategori seçin"}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
