import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isletmeServisi } from "@/lib/supabase";
import { toast } from "sonner";
import { ServicesList } from "./ServicesList";
import { ServiceForm } from "./ServiceForm";
import { WorkingHours } from "./WorkingHours";
import { ServiceCategoriesList } from "./ServiceCategoriesList";
import { ServiceCategoryForm } from "./ServiceCategoryForm";

export function ServicesContent() {
  const [yukleniyor, setYukleniyor] = useState(false);
  
  // Demo için
  const handleSaatGuncelleClick = async () => {
    setYukleniyor(true);
    
    // Simüle edilmiş gecikme
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Çalışma saatleri güncellendi", {
      position: "bottom-right"
    });
    
    setYukleniyor(false);
  };
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Hizmet Ayarları</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Çalışma Saatleri</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  İşletmenizin çalışma saatlerini buradan düzenleyebilirsiniz.
                </p>
                <WorkingHours />
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={handleSaatGuncelleClick}
                  disabled={yukleniyor}
                >
                  {yukleniyor ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Güncelleniyor...
                    </>
                  ) : (
                    'Saatleri Güncelle'
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Hizmet Kategorileri</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Hizmet kategorilerinizi buradan düzenleyebilirsiniz.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline">
                  Kategorileri Düzenle
                </Button>
              </CardFooter>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
