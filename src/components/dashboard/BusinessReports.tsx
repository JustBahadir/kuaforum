
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { islemServisi, personelServisi } from "@/lib/supabase";
import { formatCurrency } from "@/utils/currencyFormatter";
import { Skeleton } from "@/components/ui/skeleton";

export function BusinessReports() {
  // Get all operations
  const {
    data: islemler = [],
    isLoading: islemlerLoading
  } = useQuery({
    queryKey: ["islemler"],
    queryFn: async () => {
      try {
        return await islemServisi.hepsiniGetir();
      } catch (error) {
        console.error("Error fetching operations:", error);
        return [];
      }
    }
  });

  // Get all personnel
  const {
    data: personeller = [],
    isLoading: personellerLoading
  } = useQuery({
    queryKey: ["personeller"],
    queryFn: async () => {
      try {
        return await personelServisi.hepsiniGetir();
      } catch (error) {
        console.error("Error fetching personnel:", error);
        return [];
      }
    }
  });

  // Calculate stats
  const toplamHizmet = islemler.length;
  const toplamPersonel = personeller.length;
  const toplamCiro = islemler.reduce((total, islem) => total + (islem.fiyat || 0), 0);

  const isLoading = islemlerLoading || personellerLoading;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Toplam Hizmet</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-6 w-16" />
          ) : (
            <div className="text-2xl font-bold">{toplamHizmet}</div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Toplam Personel</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-6 w-16" />
          ) : (
            <div className="text-2xl font-bold">{toplamPersonel}</div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Toplam Ciro</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-6 w-24" />
          ) : (
            <div className="text-2xl font-bold">{formatCurrency(toplamCiro)}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
