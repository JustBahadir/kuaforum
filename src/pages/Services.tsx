
import { useState, useEffect } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { kategorilerServisi, islemServisi } from "@/lib/supabase";
import { KategoriDto, IslemDto } from "@/lib/supabase/types";
import { useShopData } from "@/hooks/useShopData";
import { toast } from "sonner";
import { ServiceItem } from "@/components/operations/ServiceItem";
import { ServiceForm } from "@/components/operations/ServiceForm";
import { CategoryForm } from "@/components/operations/CategoryForm";
import { CategoryCard } from "@/components/operations/CategoryCard";

export default function Services() {
  const [activeTab, setActiveTab] = useState("services");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingService, setIsAddingService] = useState(false);
  const [kategoriAdi, setKategoriAdi] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<KategoriDto | null>(null);
  const { isletmeData } = useShopData();
  const dukkanId = isletmeData?.id || 0;

  // Fetch categories
  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    refetch: refetchCategories,
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
    refetch: refetchServices,
  } = useQuery({
    queryKey: ["services", dukkanId],
    queryFn: () => islemServisi.hepsiniGetir(dukkanId),
    enabled: !!dukkanId,
  });

  // Initialize selected category when categories load
  useEffect(() => {
    if (categories && categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  // Get services for selected category
  const filteredServices = selectedCategory
    ? services.filter((service) => service.kategori_id === selectedCategory.id)
    : [];

  // Handle adding a new category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!kategoriAdi.trim()) {
      toast.error("Kategori adı boş olamaz");
      return;
    }

    try {
      await kategorilerServisi.ekle({
        kategori_adi: kategoriAdi,
        sira: categories.length,
        dukkan_id: dukkanId,
      });
      
      setKategoriAdi("");
      setIsAddingCategory(false);
      await refetchCategories();
      toast.success("Kategori başarıyla eklendi");
    } catch (error: any) {
      console.error("Kategori eklenirken hata:", error);
      toast.error(`Kategori eklenirken hata oluştu: ${error.message}`);
    }
  };

  // Handle selecting a category
  const handleCategorySelect = (category: KategoriDto) => {
    setSelectedCategory(category);
  };

  return (
    <StaffLayout>
      <div className="container p-4 mx-auto">
        <h1 className="text-2xl font-bold mb-6">Hizmet Yönetimi</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="services">Hizmetler</TabsTrigger>
            <TabsTrigger value="products">Ürünler</TabsTrigger>
          </TabsList>
          
          <TabsContent value="services" className="space-y-4">
            {isCategoriesLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-32" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-24 rounded-lg" />
                  ))}
                </div>
              </div>
            ) : categories.length > 0 ? (
              <>
                {/* Categories Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Kategoriler</h2>
                    <Button variant="outline" onClick={() => setIsAddingCategory(true)}>
                      Kategori Ekle
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {categories.map((category) => (
                      <CategoryCard
                        key={category.id}
                        category={category}
                        isSelected={selectedCategory?.id === category.id}
                        onClick={() => handleCategorySelect(category)}
                        onUpdate={refetchCategories}
                        onDelete={refetchCategories}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Services Section */}
                <div className="space-y-4 mt-8">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">
                      {selectedCategory ? `${selectedCategory.kategori_adi} Hizmetleri` : "Hizmetler"}
                    </h2>
                    <Button variant="outline" onClick={() => setIsAddingService(true)}>
                      Hizmet Ekle
                    </Button>
                  </div>
                  
                  {isServicesLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 rounded-lg" />
                      ))}
                    </div>
                  ) : filteredServices.length > 0 ? (
                    <div className="space-y-4">
                      {filteredServices.map((service) => (
                        <ServiceItem
                          key={service.id}
                          service={service}
                          onUpdate={refetchServices}
                          onDelete={refetchServices}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">
                          Bu kategoride henüz hizmet bulunmuyor. Yeni bir hizmet ekleyin.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground mb-4">
                    Henüz kategori bulunmuyor. İlk kategoriyi ekleyin.
                  </p>
                  <Button onClick={() => setIsAddingCategory(true)}>Kategori Ekle</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Ürün Yönetimi</CardTitle>
                <CardDescription>
                  İşletmenizde satılan ürünleri buradan yönetebilirsiniz.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Ürün yönetimi özelliği yakında eklenecektir.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Add Category Modal */}
      <CategoryForm
        isOpen={isAddingCategory}
        onOpenChange={setIsAddingCategory}
        kategoriAdi={kategoriAdi}
        setKategoriAdi={setKategoriAdi}
        onSubmit={handleAddCategory}
      />
      
      {/* Add Service Modal */}
      <ServiceForm 
        isOpen={isAddingService}
        onOpenChange={setIsAddingService}
        categories={categories}
        selectedCategoryId={selectedCategory?.id}
        onSubmit={async (data) => {
          try {
            await islemServisi.ekle({
              ...data,
              dukkan_id: dukkanId,
            });
            setIsAddingService(false);
            await refetchServices();
            toast.success("Hizmet başarıyla eklendi");
          } catch (error: any) {
            console.error("Hizmet eklenirken hata:", error);
            toast.error(`Hizmet eklenirken hata oluştu: ${error.message}`);
          }
        }}
      />
    </StaffLayout>
  );
}
