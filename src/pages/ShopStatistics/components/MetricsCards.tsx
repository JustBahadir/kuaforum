
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MetricsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Toplam Ciro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₺12,100</div>
          <p className="text-xs text-muted-foreground">
            Geçen haftaya göre +20%
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Müşteri Sayısı
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">94</div>
          <p className="text-xs text-muted-foreground">
            Geçen haftaya göre +12%
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            İşlem Sayısı
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">147</div>
          <p className="text-xs text-muted-foreground">
            Geçen haftaya göre +8%
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Ortalama Harcama
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₺128.72</div>
          <p className="text-xs text-muted-foreground">
            Geçen haftaya göre +2%
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
