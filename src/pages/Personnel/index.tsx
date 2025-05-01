
import { useState } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { personelServisi } from "@/lib/supabase";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./components/columns";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

export default function Personnel() {
  const [activeTab, setActiveTab] = useState("allStaff");
  const navigate = useNavigate();
  const { dukkanId } = useCustomerAuth();
  
  // Fix the queryFn to use the proper function signature
  const { data: personnel = [], isLoading } = useQuery({
    queryKey: ['personnel'],
    queryFn: async () => {
      if (dukkanId) {
        return await personelServisi.hepsiniGetir(dukkanId);
      }
      return [];
    },
    enabled: !!dukkanId
  });
  
  return (
    <StaffLayout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Personel Yönetimi</h1>
          <Button onClick={() => navigate('/personnel/new')} className="flex items-center gap-2">
            <Plus size={16} />
            Yeni Personel
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="allStaff">Tüm Personel</TabsTrigger>
            <TabsTrigger value="pending-requests">Bekleyen Başvurular</TabsTrigger>
          </TabsList>
          
          <TabsContent value="allStaff">
            <Card>
              <CardHeader>
                <CardTitle>Personel Listesi</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <DataTable columns={columns} data={personnel} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="pending-requests">
            <Card>
              <CardContent>
                <Button onClick={() => navigate('/personnel/pending-requests')}>
                  Bekleyen Başvuruları Görüntüle
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StaffLayout>
  );
}
