
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { personelIslemleriServisi } from "@/lib/supabase/services/personelIslemleriServisi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/currencyFormatter";
import { PersonelIslemi } from "@/lib/supabase/types";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface OperationsHistoryTabProps {
  personnelId: number;
}

export function OperationsHistoryTab({ personnelId }: OperationsHistoryTabProps) {
  const [timeframe, setTimeframe] = useState<"all" | "month" | "week" | "day">("all");

  const { data: operations = [], isLoading } = useQuery({
    queryKey: ["personnel-operations", personnelId, timeframe],
    queryFn: async () => {
      try {
        return await personelIslemleriServisi.personelIslemleriniGetir(personnelId);
      } catch (error) {
        console.error("Error fetching operations:", error);
        return [];
      }
    },
  });

  // Filter operations by timeframe
  const filteredOperations = operations.filter((op: PersonelIslemi) => {
    if (timeframe === "all") return true;
    
    const operationDate = new Date(op.created_at);
    const now = new Date();
    
    if (timeframe === "day") {
      return operationDate.toDateString() === now.toDateString();
    } else if (timeframe === "week") {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      return operationDate >= weekStart;
    } else if (timeframe === "month") {
      return (
        operationDate.getMonth() === now.getMonth() &&
        operationDate.getFullYear() === now.getFullYear()
      );
    }
    
    return true;
  });

  // Calculate total revenue
  const totalRevenue = filteredOperations.reduce(
    (sum, op: PersonelIslemi) => sum + op.tutar,
    0
  );

  // Calculate commission
  const totalCommission = filteredOperations.reduce(
    (sum, op: PersonelIslemi) => sum + (op.tutar * op.prim_yuzdesi) / 100,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground mr-2">Filtrele:</span>
        <Button
          variant={timeframe === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setTimeframe("all")}
        >
          Tümü
        </Button>
        <Button
          variant={timeframe === "month" ? "default" : "outline"}
          size="sm"
          onClick={() => setTimeframe("month")}
        >
          Bu Ay
        </Button>
        <Button
          variant={timeframe === "week" ? "default" : "outline"}
          size="sm"
          onClick={() => setTimeframe("week")}
        >
          Bu Hafta
        </Button>
        <Button
          variant={timeframe === "day" ? "default" : "outline"}
          size="sm"
          onClick={() => setTimeframe("day")}
        >
          Bugün
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg bg-green-50">
          <p className="text-sm text-muted-foreground">Toplam Ciro</p>
          <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="p-4 border rounded-lg bg-blue-50">
          <p className="text-sm text-muted-foreground">Toplam Komisyon</p>
          <p className="text-2xl font-bold">{formatCurrency(totalCommission)}</p>
        </div>
        <div className="p-4 border rounded-lg bg-purple-50">
          <p className="text-sm text-muted-foreground">İşlem Sayısı</p>
          <p className="text-2xl font-bold">{filteredOperations.length}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : filteredOperations.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Bu zaman diliminde işlem bulunamadı.
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarih</TableHead>
                <TableHead>İşlem</TableHead>
                <TableHead>Müşteri</TableHead>
                <TableHead className="text-right">Tutar</TableHead>
                <TableHead className="text-right">Komisyon</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOperations.map((op: PersonelIslemi) => (
                <TableRow key={op.id}>
                  <TableCell>
                    {format(new Date(op.created_at), "dd MMM yyyy HH:mm", { locale: tr })}
                  </TableCell>
                  <TableCell>
                    {op.aciklama || (op.islem?.islem_adi || "Bilinmeyen")}
                  </TableCell>
                  <TableCell>
                    {op.musteri
                      ? `${op.musteri.first_name} ${op.musteri.last_name || ""}`
                      : "Bilinmeyen"}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(op.tutar)}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency((op.tutar * op.prim_yuzdesi) / 100)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
