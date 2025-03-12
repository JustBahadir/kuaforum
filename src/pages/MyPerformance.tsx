
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { personelIslemleriServisi, personelServisi } from "@/lib/supabase";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { tr } from "date-fns/locale";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, Clock, BarChart2, TrendingUp } from "lucide-react";

export default function MyPerformance() {
  const { userId } = useCustomerAuth();
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly" | "yearly">("daily");
  
  // Get personnel ID from auth ID
  const { data: personelData, isLoading: isLoadingPersonel } = useQuery({
    queryKey: ['personel', 'auth', userId],
    queryFn: () => personelServisi.getirByAuthId(userId),
    enabled: !!userId,
  });
  
  // Calculate date range based on timeframe
  const getDateRange = () => {
    const now = new Date();
    
    switch (timeframe) {
      case "daily":
        return { 
          start: format(now, "yyyy-MM-dd"), 
          end: format(now, "yyyy-MM-dd"),
          label: "Bugün" 
        };
      case "weekly":
        return { 
          start: format(startOfWeek(now, { locale: tr, weekStartsOn: 1 }), "yyyy-MM-dd"), 
          end: format(endOfWeek(now, { locale: tr, weekStartsOn: 1 }), "yyyy-MM-dd"),
          label: "Bu Hafta" 
        };
      case "monthly":
        return { 
          start: format(startOfMonth(now), "yyyy-MM-dd"), 
          end: format(endOfMonth(now), "yyyy-MM-dd"),
          label: "Bu Ay" 
        };
      case "yearly":
        return { 
          start: format(startOfYear(now), "yyyy-MM-dd"), 
          end: format(endOfYear(now), "yyyy-MM-dd"),
          label: "Bu Yıl" 
        };
    }
  };
  
  const dateRange = getDateRange();
  
  // Get personnel operations based on the timeframe
  const { data: operations, isLoading: isLoadingOperations } = useQuery({
    queryKey: ['personel-operations', personelData?.id, timeframe],
    queryFn: () => personelIslemleriServisi.tarihAraliginaGoreGetir(
      personelData?.id || 0,
      dateRange.start,
      dateRange.end
    ),
    enabled: !!personelData?.id,
  });
  
  // Calculate total stats
  const totalEarnings = operations?.reduce((sum, op) => sum + Number(op.tutar), 0) || 0;
  const totalPoints = operations?.reduce((sum, op) => sum + Number(op.puan), 0) || 0;
  const totalOperations = operations?.length || 0;
  
  return (
    <StaffLayout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Performansım</h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1 py-1 px-3">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>Toplam Puan: {totalPoints}</span>
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-500" />
                İşlem Sayısı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{isLoadingOperations ? <Skeleton className="h-8 w-16" /> : totalOperations}</p>
              <p className="text-sm text-muted-foreground">{dateRange.label}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Toplam Ciro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {isLoadingOperations ? <Skeleton className="h-8 w-24" /> : `₺${totalEarnings.toFixed(2)}`}
              </p>
              <p className="text-sm text-muted-foreground">{dateRange.label}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                Toplam Puan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{isLoadingOperations ? <Skeleton className="h-8 w-16" /> : totalPoints}</p>
              <p className="text-sm text-muted-foreground">{dateRange.label}</p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>İşlem Geçmişi</CardTitle>
              <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as any)}>
                <TabsList>
                  <TabsTrigger value="daily" className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> Günlük
                  </TabsTrigger>
                  <TabsTrigger value="weekly" className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> Haftalık
                  </TabsTrigger>
                  <TabsTrigger value="monthly" className="flex items-center gap-1">
                    <BarChart2 className="w-4 h-4" /> Aylık
                  </TabsTrigger>
                  <TabsTrigger value="yearly" className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" /> Yıllık
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingOperations ? (
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : operations?.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p className="text-lg mb-2">İşlem kaydı bulunamadı</p>
                <p className="text-sm">Seçilen tarih aralığında işlem kaydı bulunmamaktadır.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>İşlem</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Puan</TableHead>
                    <TableHead>Açıklama</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {operations?.map((op) => (
                    <TableRow key={op.id}>
                      <TableCell>
                        {format(new Date(op.created_at), "dd MMM yyyy", { locale: tr })}
                      </TableCell>
                      <TableCell>{op.islem?.islem_adi || "Tanımsız İşlem"}</TableCell>
                      <TableCell className="font-medium">₺{op.tutar.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{op.puan}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{op.aciklama || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </StaffLayout>
  );
}
