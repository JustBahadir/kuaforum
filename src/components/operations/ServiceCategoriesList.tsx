
import React from 'react';
import { IslemKategorisi } from '@/lib/supabase/types';
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, X } from "lucide-react";

interface ServiceCategoriesListProps {
  kategoriler?: IslemKategorisi[];
  onAddCategory?: () => void;
  onEditCategory?: (kategori: IslemKategorisi) => void;
  onDeleteCategory?: (kategori: IslemKategorisi) => void;
  selectedCategory?: string | number | null;
  onCategorySelect?: (kategori: IslemKategorisi) => void;
}

export function ServiceCategoriesList({
  kategoriler = [],
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  selectedCategory,
  onCategorySelect
}: ServiceCategoriesListProps) {
  return (
    <div className="p-4 border border-gray-200 rounded-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Kategoriler</h3>
        {onAddCategory && (
          <Button variant="ghost" size="sm" onClick={onAddCategory} className="flex items-center gap-1">
            <PlusCircle className="h-4 w-4" /> Ekle
          </Button>
        )}
      </div>
      
      {kategoriler.length > 0 ? (
        <div className="space-y-2">
          {kategoriler.map((kategori) => {
            const itemId = kategori.id?.toString() || kategori.kimlik?.toString() || '';
            const isSelected = (selectedCategory === kategori.id) || 
                              (selectedCategory === kategori.kimlik) ||
                              (selectedCategory?.toString() === itemId);
            
            return (
              <div 
                key={itemId}
                className={`p-3 border rounded-md flex justify-between items-center ${
                  isSelected ? 'bg-blue-50 border-blue-300' : 'border-gray-200 hover:bg-gray-50'
                } cursor-pointer transition-colors`}
                onClick={() => onCategorySelect && onCategorySelect(kategori)}
              >
                <div className="font-medium">
                  {kategori.kategori_adi || kategori.baslik}
                </div>
                
                <div className="flex space-x-2">
                  {onEditCategory && (
                    <button
                      onClick={(e) => { 
                        e.stopPropagation();
                        onEditCategory(kategori); 
                      }}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                  
                  {onDeleteCategory && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCategory(kategori);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p>Hizmet kategorileri listesi burada görüntülenecek.</p>
      )}
    </div>
  );
}
