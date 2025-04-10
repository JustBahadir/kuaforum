
import { useState } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServicesContent } from "@/components/operations/ServicesContent";
import { ServiceCostManagement } from "@/components/operations/ServiceCostManagement";

export default function Services() {
  const [activeTab, setActiveTab] = useState("services");

  return (
    <StaffLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Hizmet Yönetimi</h1>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="services">Hizmetler</TabsTrigger>
            <TabsTrigger value="costs">Maliyet</TabsTrigger>
          </TabsList>
          
          <TabsContent value="services">
            <ServicesContent />
          </TabsContent>
          
          <TabsContent value="costs">
            <ServiceCostManagement />
          </TabsContent>
        </Tabs>
      </div>
    </StaffLayout>
  );
}
