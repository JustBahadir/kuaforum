
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Activity, Award } from "lucide-react";
import { supabase, personelIslemleriServisi } from "@/lib/supabase";
import { format, startOfDay, subDays, subMonths, subYears, startOfWeek, startOfMonth, startOfYear } from "date-fns";
import { tr } from "date-fns/locale";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyPerformance() {
  const { userId, userRole, dukkanId } = useCustomerAuth();
  const [personelId, setPersonelId] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "year">("day");
  const [totalPoints, setTotalPoints] = useState(0);
  
  const today = new Date();
  
  // Calculate date ranges
  const getDateRange = () => {
    const endDate = format(today, "yyyy-MM-dd");
    let startDate;
    
    switch (timeRange) {
      case "day":
        startDate = format(startOfDay(today), "yyyy-MM-dd");
        break;
      case "week":
        startDate = format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
        break;
      case "month":
        startDate = format(startOfMonth(today), "yyyy-MM-dd");
        break;
      case "year":
        startDate = format(startOfYear(today), "yyyy-MM-dd");
        break;
      default:
        startDate = format(subDays(today, 7), "yyyy-MM-dd");
    }
    
    return { startDate, endDate };
  };
  
  // Fetch personel_id for the current user
  const { data: personelData, isLoading: isLoadingPersonel } = useQuery({
    queryKey: ['personel', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('personel')
        .select('id, ad, soyad')
        .eq('auth_id', userId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!userId && userRole === "staff"
  });
  
  // Set personel ID when data is loaded
  useEffect(() => {
    if (personelData?.id) {
      setPersonelId(personelData.id);
    }
  }, [personelData]);
  
  // Get date range for the query
  const { startDate, endDate } = getDateRange();
  
  // Fetch operations for the current user in the selected time range
  const { data: operations = [], isLoading: isLoadingOperations } = useQuery({
    queryKey: ['personel-operations', personelId, timeRange, startDate, endDate],
    queryFn: () => {
      if (!personelId) return [];
      return personelIslemleriServisi.tarihAraliginaGoreGetir(personelId, startDate, endDate);
    },
    enabled: !!personelId
  });
  
  // Calculate total points from operations
  useEffect(() => {
    if (operations.length > 0) {
      const points = operations.reduce((total, op) => {
        return total + (op.islem?.puan || 0);
      }, 0);
      setTotalPoints(points);
    } else {
      setTotalPoints(0);
    }
  }, [operations]);
  
  // Format date based on selected time range
  const formatOperationDate = (date: string) => {
    try {
      const dateObj = new Date(date);
      
      switch (timeRange) {
        case "day":
          return format(dateObj, "HH:mm", { locale: tr });
        case "week":
        case "month":
          return format(dateObj, "d MMMM", { locale: tr });
        case "year":
          return format(dateObj, "MMMM yyyy", { locale: tr });
        default:
          return format(dateObj, "d MMMM yyyy", { locale: tr });
      }
    } catch (e) {
      return date;
    }
  };
  
  // Loading states
  if (isLoadingPersonel) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Performansım</h1>
          <Skeleton className="h-8 w-24" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48 mb-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // No staff ID found
  if (!isLoadingPersonel && !personelId) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center h-64">
          <h1 className="text-2xl font-semibold text-gray-700 mb-4">Personel bilgisi bulunamadı</h1>
          <p className="text-muted-foreground">
            Bu sayfayı görüntülemek için personel olarak kayıtlı olmanız gerekmektedir.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Performansım</h1>
        <Badge variant="outline" className="px-3 py-2 text-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
          <Award className="w-5 h-5 mr-2 text-purple-500" /> 
          <span>Toplam Puan: <strong className="text-purple-700">{totalPoints}</strong></span>
        </Badge>
      </div>
      
      <Tabs defaultValue="day" value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
        <TabsList className="mb-6 grid grid-cols-4 w-full md:w-1/2">
          <TabsTrigger value="day">Günlük</TabsTrigger>
          <TabsTrigger value="week">Haftalık</TabsTrigger>
          <TabsTrigger value="month">Aylık</TabsTrigger>
          <TabsTrigger value="year">Yıllık</TabsTrigger>
        </TabsList>
        
        {/* All tab contents share the same view */}
        {["day", "week", "month", "year"].map((period) => (
          <TabsContent key={period} value={period}>
            <Card>
              <CardHeader>
                <CardTitle>
                  {period === "day" && "Bugünkü İşlemlerim"}
                  {period === "week" && "Bu Haftaki İşlemlerim"}
                  {period === "month" && "Bu Ayki İşlemlerim"}
                  {period === "year" && "Bu Yılki İşlemlerim"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingOperations ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : operations.length > 0 ? (
                  <div className="space-y-4">
                    {operations.map((operation) => (
                      <div 
                        key={operation.id} 
                        className="border rounded-lg p-4 flex items-start justify-between gap-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-lg">{operation.islem?.ad || "İşlem"}</div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatOperationDate(operation.created_at)}
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {operation.personel?.ad} {operation.personel?.soyad}
                            </div>
                            {operation.notlar && (
                              <div className="flex items-center gap-1">
                                <span className="text-gray-500">Not:</span> {operation.notlar}
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                          <Activity className="w-3 h-3 mr-1" /> 
                          {operation.islem?.puan || 0} Puan
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                    <Activity className="w-12 h-12 mb-4 text-gray-300" />
                    <p>Bu zaman aralığında işlem kaydı bulunmamaktadır.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
