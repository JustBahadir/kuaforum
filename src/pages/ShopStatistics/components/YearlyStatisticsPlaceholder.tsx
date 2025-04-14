
import React from 'react';
import { Info } from 'lucide-react';

export function YearlyStatisticsPlaceholder() {
  return (
    <div className="bg-muted/50 rounded-lg p-8 flex flex-col items-center justify-center text-center space-y-4">
      <div className="bg-background rounded-full p-4 inline-flex">
        <Info className="h-10 w-10 text-primary/60" />
      </div>
      <div>
        <h3 className="text-xl font-medium mb-2">Veri Bulunamadı</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Seçilen tarih aralığında herhangi bir işlem kaydı bulunmuyor. Farklı bir tarih aralığı seçerek veya yeni işlemler ekleyerek istatistikleri görüntüleyebilirsiniz.
        </p>
      </div>
    </div>
  );
}
