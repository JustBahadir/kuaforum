
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { personelIslemleriServisi } from '@/lib/supabase/services/personelIslemleriServisi';

interface PersonnelHistoryTableProps {
  personelId: number;
  limit?: number;
  showHeader?: boolean;
}

export function PersonnelHistoryTable({ personelId, limit = 5, showHeader = true }: PersonnelHistoryTableProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [operations, setOperations] = useState<any[]>([]);

  useEffect(() => {
    const loadOperations = async () => {
      try {
        setLoading(true);
        const data = await personelIslemleriServisi.personelIslemleriGetir(personelId);
        
        // Apply limit if needed
        const limitedData = limit ? data.slice(0, limit) : data;
        setOperations(limitedData);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching personnel operations:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (personelId) {
      loadOperations();
    }
  }, [personelId, limit]);

  // Function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  if (loading) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle>İşlem Geçmişi</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle>İşlem Geçmişi</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-red-500">Hata: {error.message}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <CardTitle>İşlem Geçmişi</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        {operations.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>İşlem</TableHead>
                  <TableHead>Müşteri</TableHead>
                  <TableHead className="text-right">Tutar</TableHead>
                  <TableHead className="text-right">Ödenen</TableHead>
                  <TableHead className="text-right">Durum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {operations.map((operation) => (
                  <TableRow key={operation.id}>
                    <TableCell className="font-medium">
                      {format(new Date(operation.created_at), 'dd MMM yyyy', {locale: tr})}
                    </TableCell>
                    <TableCell>{operation.islem?.islem_adi || operation.aciklama}</TableCell>
                    <TableCell>
                      {operation.musteri ? 
                        `${operation.musteri.first_name} ${operation.musteri.last_name || ''}` : 
                        'N/A'
                      }
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(operation.tutar)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(operation.odenen)}</TableCell>
                    <TableCell className="text-right">
                      {operation.tutar <= operation.odenen ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">Ödendi</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-100">Ödenmedi</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <p>Bu personel için işlem kaydı bulunamadı.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
