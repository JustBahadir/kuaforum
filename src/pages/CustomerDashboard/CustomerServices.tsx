
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CustomerServices() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Hizmetlerimiz</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Mevcut Hizmetler</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Bu bölüm yakında hizmetinize sunulacaktır. Burada işletmenizin sunduğu tüm hizmetleri görüntüleyebileceksiniz.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
