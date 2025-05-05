
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarCheck2, User } from "lucide-react";
import CustomerProfile from "./CustomerDashboard/CustomerProfile";
import CustomerAppointments from "./CustomerDashboard/CustomerAppointments";
import { useAuth } from "@/contexts/AuthContext";

export default function CustomerDashboard() {
  const { userName } = useAuth();
  const [activeTab, setActiveTab] = useState("appointments");

  return (
    <div className="container py-8 px-4 mx-auto max-w-7xl">
      <h1 className="text-3xl font-bold mb-2">
        Merhaba, {userName || "Değerli Müşterimiz"}
      </h1>
      <p className="text-muted-foreground mb-8">
        Randevularınızı ve profil bilgilerinizi buradan yönetebilirsiniz.
      </p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="appointments" className="flex items-center">
            <CalendarCheck2 className="mr-2 h-4 w-4" />
            Randevularım
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            Profilim
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="appointments">
          <CustomerAppointments />
        </TabsContent>
        
        <TabsContent value="profile">
          <CustomerProfile />
        </TabsContent>
      </Tabs>
    </div>
  );
}
