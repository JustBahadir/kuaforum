
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ServicesList } from './ServicesList';
import { WorkingHours } from './WorkingHours';
import { ServiceCategoriesList } from './ServiceCategoriesList';
import { ServiceCategoryForm } from './ServiceCategoryForm';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function ServicesContent() {
  const { userId } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("services");
  const [loading, setLoading] = useState(false);
  const [isletmeId, setIsletmeId] = useState<string>("");

  // This is a placeholder - you would fetch the real isletmeId
  React.useEffect(() => {
    const fetchIsletmeId = async () => {
      setIsletmeId("placeholder-id");
    };
    
    fetchIsletmeId();
  }, [userId]);

  return (
    <div className="container mx-auto p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="services">Hizmetler</TabsTrigger>
          <TabsTrigger value="categories">Kategoriler</TabsTrigger>
          <TabsTrigger value="working-hours">Çalışma Saatleri</TabsTrigger>
        </TabsList>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>İşletme Hizmetleri</CardTitle>
            </CardHeader>
            <CardContent>
              <ServicesList />
            </CardContent>
            <CardFooter className="flex justify-end">
              {loading ? (
                <Button disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Yükleniyor
                </Button>
              ) : (
                <Button>Yeni Hizmet Ekle</Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Hizmet Kategorileri</CardTitle>
            </CardHeader>
            <CardContent>
              <ServiceCategoriesList />
            </CardContent>
            <CardFooter className="flex justify-end">
              <ServiceCategoryForm />
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="working-hours">
          <Card>
            <CardHeader>
              <CardTitle>Çalışma Saatleri</CardTitle>
            </CardHeader>
            <CardContent>
              {isletmeId && <WorkingHours isletmeId={isletmeId} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
