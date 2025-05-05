import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash, Clock, Calendar } from 'lucide-react';
import { IslemKategorisi, Hizmet } from '@/lib/supabase/types';

interface SortableCategoryProps {
  kategori: IslemKategorisi;
  islemler: Hizmet[];
  isStaff?: boolean;
  onServiceEdit: (islem: Hizmet) => void;
  onServiceDelete: (islemId: number | string) => void;
  onCategoryDelete: (kategoriId: number | string) => void;
  onCategoryEdit: (kategori: IslemKategorisi) => void;
  onSiralamaChange?: (items: Hizmet[]) => void;
  onRandevuAl?: (islemId: number | string) => void;
  puanlamaAktif?: boolean;
}

export const SortableCategory = ({
  kategori,
  islemler,
  isStaff = false,
  onServiceEdit,
  onServiceDelete,
  onCategoryDelete,
  onCategoryEdit,
  onSiralamaChange,
  onRandevuAl,
  puanlamaAktif = false
}: SortableCategoryProps) => {
  const [draggedItem, setDraggedItem] = useState<Hizmet | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: Hizmet) => {
    setDraggedItem(item);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, targetItem: Hizmet) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetItem.id) return;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetItem: Hizmet) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetItem.id) return;

    const updatedItems = [...islemler];
    const draggedIndex = updatedItems.findIndex(item => item.id === draggedItem.id);
    const targetIndex = updatedItems.findIndex(item => item.id === targetItem.id);

    // Reorder the items
    const [movedItem] = updatedItems.splice(draggedIndex, 1);
    updatedItems.splice(targetIndex, 0, movedItem);

    // Update the siralama property
    const reorderedItems = updatedItems.map((item, index) => ({
      ...item,
      siralama: index
    }));

    if (onSiralamaChange) {
      onSiralamaChange(reorderedItems);
    }

    setIsDragging(false);
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedItem(null);
  };
  
  return (
    <div className="mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-2">
          <div className="font-semibold flex-1">
            {kategori.baslik || kategori.kategori_adi}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onCategoryEdit(kategori)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onCategoryDelete(kategori.id)}
              className="text-destructive hover:text-destructive/90"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div>
            {islemler.map((islem) => (
              <div
                key={islem.id}
                draggable={!isStaff}
                onDragStart={(e) => handleDragStart(e, islem)}
                onDragOver={(e) => handleDragOver(e, islem)}
                onDrop={(e) => handleDrop(e, islem)}
                onDragEnd={handleDragEnd}
                className={`flex items-center justify-between p-2 mb-2 rounded-md ${
                  isDragging && draggedItem?.id === islem.id
                    ? 'opacity-50 bg-gray-100'
                    : 'bg-gray-50'
                } ${!isStaff ? 'cursor-move' : ''}`}
              >
                <div className="flex-1">
                  <div className="font-medium">{islem.islem_adi || islem.hizmet_adi}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {islem.suresi || islem.sure_dakika || 30} dk
                    </span>
                    <span className="font-medium">{islem.fiyat} ₺</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isStaff && onRandevuAl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRandevuAl(islem.id)}
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Randevu Al
                    </Button>
                  )}
                  {!isStaff && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onServiceEdit(islem)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onServiceDelete(islem.id)}
                        className="text-destructive hover:text-destructive/90"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
