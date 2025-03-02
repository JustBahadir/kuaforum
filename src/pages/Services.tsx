
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServicesContent } from "@/components/operations/ServicesContent";
import { StaffLayout } from "@/components/ui/staff-layout";

export default function Services() {
  return (
    <StaffLayout>
      <div className="container mx-auto py-6">
        <Tabs defaultValue="services" className="space-y-4">
          <TabsList>
            <TabsTrigger value="services">Hizmetler</TabsTrigger>
            <TabsTrigger value="categories">Kategoriler</TabsTrigger>
            <TabsTrigger value="working-hours">Çalışma Saatleri</TabsTrigger>
          </TabsList>

          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Hizmetler</CardTitle>
              </CardHeader>
              <CardContent>
                <ServicesContent />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Kategoriler</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Kategori içeriği burada olacak */}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="working-hours">
            <Card>
              <CardHeader>
                <CardTitle>Çalışma Saatleri</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Çalışma saatleri içeriği burada olacak */}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StaffLayout>
  );
}
