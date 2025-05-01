
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { personelIslemleriServisi } from '@/lib/supabase';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { CalendarIcon, ClockIcon, CoinsIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface HistoryTabProps {
  personnelId: number;
}

export function HistoryTab({ personnelId }: HistoryTabProps) {
  const [period, setPeriod] = useState('all');
  
  const { data: history = [], isLoading } = useQuery({
    queryKey: ['personnel-history', personnelId],
    queryFn: () => personelIslemleriServisi.personelIslemleriGetir(personnelId),
    enabled: !!personnelId,
  });
  
  // Filter history by period
  const filteredHistory = history.filter(item => {
    if (period === 'all') return true;
    
    const date = new Date(item.created_at);
    const now = new Date();
    
    if (period === 'today') {
      return date.toDateString() === now.toDateString();
    }
    
    if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return date >= weekAgo;
    }
    
    if (period === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(now.getMonth() - 1);
      return date >= monthAgo;
    }
    
    return true;
  });
  
  // Format price as currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Calculate statistics
  const totalRevenue = filteredHistory.reduce((sum, item) => sum + (item.tutar || 0), 0);
  const totalPaid = filteredHistory.reduce((sum, item) => sum + (item.odenen || 0), 0);
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold">İşlem Geçmişi</h2>
        
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Dönem Seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Zamanlar</SelectItem>
            <SelectItem value="today">Bugün</SelectItem>
            <SelectItem value="week">Son 7 Gün</SelectItem>
            <SelectItem value="month">Son 30 Gün</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Toplam Ciro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatPrice(totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Toplam Ödenen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatPrice(totalPaid)}</div>
          </CardContent>
        </Card>
      </div>
      
      {filteredHistory.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Bu dönemde işlem geçmişi bulunmuyor.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row justify-between">
                  <div>
                    <div className="font-medium mb-1">{item.aciklama}</div>
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                      <span>{format(new Date(item.created_at), 'd MMMM yyyy', { locale: tr })}</span>
                      <span className="mx-1">•</span>
                      <ClockIcon className="h-3.5 w-3.5 mr-1" />
                      <span>{format(new Date(item.created_at), 'HH:mm', { locale: tr })}</span>
                    </div>
                    
                    {item.musteri_id && (
                      <div className="text-sm mb-2">
                        <span className="font-medium">Müşteri:</span>{' '}
                        <span className="text-muted-foreground">
                          {item.musteri ? `${item.musteri.first_name} ${item.musteri.last_name || ''}` : 'Bilinmiyor'}
                        </span>
                      </div>
                    )}
                    
                    {item.notlar && (
                      <div className="text-sm mt-2">
                        <span className="font-medium">Notlar:</span>{' '}
                        <span className="text-muted-foreground">{item.notlar}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 sm:mt-0 text-right">
                    <div className="flex items-center justify-end text-lg font-semibold mb-1">
                      <CoinsIcon className="h-4 w-4 mr-1 text-yellow-500" />
                      {formatPrice(item.tutar)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Prim: {formatPrice(item.tutar * (item.prim_yuzdesi / 100))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default HistoryTab;
