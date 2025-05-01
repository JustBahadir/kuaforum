
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HistoryTabProps {
  personel: any;
  onRefresh?: () => void;
  onClose: () => void;
}

export function HistoryTab({ personel, onRefresh, onClose }: HistoryTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">İş Geçmişi</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Personelin iş geçmişi bilgileri burada görüntülenecek.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Eğitim Belgesi</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Eğitim belgeleri burada listelenecek.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Yarışmalar</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Katıldığı yarışmalar ve ödüller burada listelenecek.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Kapat
        </Button>
      </div>
    </div>
  );
}
