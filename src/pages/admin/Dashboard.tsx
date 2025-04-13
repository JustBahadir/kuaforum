
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dükkan Panel</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Randevular</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Dükkanınıza ait randevuları görüntüleyin ve yönetin.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Personel</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Personel bilgilerinizi görüntüleyin ve düzenleyin.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>İstatistikler</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Dükkanınıza ait istatistikleri görüntüleyin.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
