
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ShopServicesCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Sunulan Hizmetler</CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.location.href = "/services"}
        >
          Tüm Hizmetleri Gör
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-center py-6">
          <p className="text-gray-500 mb-4">
            Saç kesimi, boya, bakım ve daha fazlası için randevu alın.
          </p>
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => window.location.href = "/appointments"}
          >
            Hemen Randevu Al
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
