
import React from 'react';
import { Hizmet } from '@/lib/supabase/types';

interface ServicesListProps {
  islemler?: Hizmet[];
  onItemSelect?: (hizmet: Hizmet) => void;
  selectedItems?: string[];
  isSelectable?: boolean;
}

export function ServicesList({ 
  islemler = [], 
  onItemSelect, 
  selectedItems = [],
  isSelectable = false
}: ServicesListProps) {
  return (
    <div className="p-4 border border-gray-200 rounded-md">
      {islemler.length > 0 ? (
        <div className="space-y-2">
          {islemler.map((hizmet) => {
            const itemId = hizmet.id?.toString() || hizmet.kimlik?.toString() || '';
            const isSelected = selectedItems.includes(itemId);
            
            return (
              <div 
                key={itemId} 
                className={`p-3 border rounded-md ${
                  isSelected ? 'bg-blue-50 border-blue-300' : 'border-gray-200 hover:bg-gray-50'
                } cursor-pointer transition-colors`}
                onClick={() => onItemSelect && onItemSelect(hizmet)}
              >
                <div className="flex justify-between items-center">
                  <div className="font-medium">{hizmet.islem_adi || hizmet.hizmet_adi}</div>
                  <div className="text-sm text-gray-600">
                    {typeof hizmet.fiyat === 'number' && (
                      <span>{hizmet.fiyat} ₺</span>
                    )}
                  </div>
                </div>
                {hizmet.aciklama && (
                  <div className="text-sm text-gray-500 mt-1">{hizmet.aciklama}</div>
                )}
                {hizmet.sure_dakika && (
                  <div className="text-xs text-gray-500 mt-1">Süre: {hizmet.sure_dakika} dk</div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p>Hizmet listesi burada görüntülenecek.</p>
      )}
    </div>
  );
}
