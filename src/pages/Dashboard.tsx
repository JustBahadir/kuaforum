
import React from 'react';
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, CircleDollarSign, Users, Activity, Clock } from 'lucide-react';
import { ProfitAnalysis } from '@/components/dashboard/ProfitAnalysis';
import { Link } from 'react-router-dom';
import { BusinessReports } from '@/components/dashboard/BusinessReports';
import { MainMenuOptions } from '@/pages/Dashboard/components/MainMenuOptions';
import { PersonnelMenu } from '@/pages/Dashboard/components/PersonnelMenu';
import { CustomerMenu } from '@/pages/Dashboard/components/CustomerMenu';
import { TestDataButton } from '@/pages/Dashboard/components/TestDataButton';
import { useAuth } from '@/hooks/useAuth';

export default function Dashboard() {
  const [activeTab, setActiveTab] = React.useState('main');
  const { user } = useAuth();

  // Dummy data for dashboard
  const stats = [
    {
      title: "Bugünkü Randevular",
      value: "6",
      description: "2 randevu beklemede",
      icon: <Clock className="h-6 w-6 text-blue-500" />,
      link: "/appointments"
    },
    {
      title: "Toplam Müşteriler",
      value: "247",
      description: "3 yeni müşteri",
      icon: <Users className="h-6 w-6 text-green-500" />,
      link: "/customers"
    },
    {
      title: "Bu Ayki Gelir",
      value: "₺12,450",
      description: "Geçen aya göre %8 artış",
      icon: <CircleDollarSign className="h-6 w-6 text-purple-500" />,
      link: "/shop-statistics"
    },
    {
      title: "Bu Haftaki İşlemler",
      value: "42",
      description: "Önceki haftaya göre %5 artış",
      icon: <Activity className="h-6 w-6 text-orange-500" />,
      link: "/operations-history"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
            <CardFooter className="p-2">
              <Link to={stat.link} className="text-xs text-blue-500 hover:underline">
                Detayları Görüntüle
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Hızlı Erişim Menüsü</CardTitle>
          <CardDescription>Sık kullanılan işlevlere kolayca erişin</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="main">Ana İşlemler</TabsTrigger>
              <TabsTrigger value="personnel">Personel</TabsTrigger>
              <TabsTrigger value="customers">Müşteriler</TabsTrigger>
            </TabsList>
            <TabsContent value="main">
              <MainMenuOptions />
            </TabsContent>
            <TabsContent value="personnel">
              <PersonnelMenu />
            </TabsContent>
            <TabsContent value="customers">
              <CustomerMenu />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Bugünün Randevuları</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Appointment placeholders */}
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Müşteri {i + 1}</p>
                    <p className="text-sm text-muted-foreground">{10 + i}:00 - Saç Kesimi</p>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-auto">Detay</Button>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link to="/appointments">Tüm Randevuları Görüntüle</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>İşletme Raporları</CardTitle>
          </CardHeader>
          <CardContent>
            <BusinessReports />
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Gelir Analizi</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ProfitAnalysis />
          </CardContent>
        </Card>
      </div>

      <TestDataButton />
    </div>
  );
}
