
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BusinessReports } from "@/components/dashboard/BusinessReports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { randevuServisi, personelServisi, islemServisi } from "@/lib/supabase";
import { UserMenu } from "@/components/ui/UserMenu";

export default function Dashboard() {
  const { data: randevular = [] } = useQuery({
    queryKey: ['randevular'],
    queryFn: randevuServisi.hepsiniGetir
  });

  const { data: personeller = [] } = useQuery({
    queryKey: ['personeller'],
    queryFn: personelServisi.hepsiniGetir
  });

  const { data: islemler = [] } = useQuery({
    queryKey: ['islemler'],
    queryFn: islemServisi.hepsiniGetir
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Panel</h1>
        <UserMenu />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="reports">Raporlar</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Toplam Randevu</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{randevular.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Aktif Personel</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{personeller.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hizmet Sayısı</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{islemler.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bekleyen Randevular</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {randevular.filter(r => r.durum === 'beklemede').length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tamamlanan Randevular</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {randevular.filter(r => r.durum === 'tamamlandi').length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>İptal Edilen Randevular</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {randevular.filter(r => r.durum === 'iptal_edildi').length}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <BusinessReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}
