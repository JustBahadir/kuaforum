
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { AlertCircle, FileText, MoreHorizontal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCustomerOperations } from '@/hooks/useCustomerOperations';

interface CustomerOperationsTableProps {
  customerId?: number;
  limit?: number;
  showHeader?: boolean;
}

export function CustomerOperationsTable({ customerId, limit, showHeader = true }: CustomerOperationsTableProps) {
  const {
    operations,
    loading,
    error,
    addOperation,
    refetch
  } = useCustomerOperations(customerId ? { customerId } : undefined);
  
  // For the build errors, we'll create states for the missing properties
  const [dateRange, setDateRange] = useState({ from: new Date(), to: new Date() });
  const totals = { totalAmount: 0, totalPaid: 0, totalUnpaid: 0, averageServiceValue: 0 };
  
  const handleForceRecover = async () => {
    console.log("Force recover operations");
  };

  // Limit operations if needed
  const displayedOperations = limit ? operations.slice(0, limit) : operations;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-500 mb-2">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Hata</span>
          </div>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>İşlem Geçmişi</CardTitle>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <FileText className="h-4 w-4 mr-2" />
            Yenile
          </Button>
        </CardHeader>
      )}
      <CardContent>
        {displayedOperations.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>İşlem</TableHead>
                  <TableHead>Personel</TableHead>
                  <TableHead className="text-right">Tutar</TableHead>
                  <TableHead className="text-right">Ödenen</TableHead>
                  <TableHead className="text-right">Durum</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedOperations.map((operation) => (
                  <TableRow key={operation.id}>
                    <TableCell className="font-medium">
                      {operation.created_at ? 
                        format(new Date(operation.created_at), 'dd MMM yyyy', {locale: tr}) : 
                        'N/A'
                      }
                    </TableCell>
                    <TableCell>{operation.islem?.islem_adi || operation.aciklama}</TableCell>
                    <TableCell>{operation.personel?.ad_soyad || 'N/A'}</TableCell>
                    <TableCell className="text-right">{operation.tutar} ₺</TableCell>
                    <TableCell className="text-right">{operation.odenen} ₺</TableCell>
                    <TableCell className="text-right">
                      {operation.tutar <= operation.odenen ? (
                        <Badge variant="success">Ödendi</Badge>
                      ) : (
                        <Badge variant="destructive">Ödenmedi</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Menü aç</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>İşlem detayları</DropdownMenuItem>
                          <DropdownMenuItem>Ödeme al</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <p>Bu müşteri için herhangi bir işlem kaydı bulunamadı.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
