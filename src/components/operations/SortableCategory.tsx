
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ServiceItem } from './ServiceItem';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { GripVertical, Plus, Trash2, Edit } from 'lucide-react';
import { arrayMove } from '@dnd-kit/sortable';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';

export function SortableCategory({
  id,
  kategori,
  islemler,
  isStaff,
  onServiceEdit,
  onServiceDelete,
  onCategoryDelete,
  onCategoryEdit,
  onSiralamaChange,
  onRandevuAl,
  puanlamaAktif
}) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition 
  } = useSortable({ id });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = islemler.findIndex(islem => islem.id === active.id);
      const newIndex = islemler.findIndex(islem => islem.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newIslemler = arrayMove(islemler, oldIndex, newIndex);
        onSiralamaChange(newIslemler);
      }
    }
  };

  return (
    <div ref={setNodeRef} style={style}>
      <AccordionItem value={id.toString()} className="border rounded-lg overflow-hidden">
        <div className="bg-white flex items-center">
          {isStaff && (
            <div 
              {...attributes} 
              {...listeners} 
              className="flex items-center px-3 cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-5 w-5 text-gray-400" />
            </div>
          )}
          <AccordionTrigger className="flex-1 hover:no-underline px-4 py-3">
            <div className="flex items-center justify-between w-full">
              <h3 className="text-lg font-medium text-left">{kategori.kategori_adi}</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {islemler.length} hizmet
                </span>
              </div>
            </div>
          </AccordionTrigger>
          {isStaff && (
            <div className="flex pr-4">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onCategoryEdit(kategori);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Düzenle</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteDialogOpen(true);
                }}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Sil</span>
              </Button>
            </div>
          )}
        </div>

        <AccordionContent className="pt-0">
          {islemler.length > 0 ? (
            <DndContext 
              sensors={sensors} 
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={islemler.map(islem => islem.id)} 
                strategy={verticalListSortingStrategy}
              >
                <div className="divide-y">
                  {islemler.map((islem) => (
                    <ServiceItem
                      key={islem.id}
                      islem={islem}
                      isStaff={isStaff}
                      onEdit={() => onServiceEdit(islem)}
                      onDelete={() => onServiceDelete(islem.id)}
                      onRandevuAl={() => onRandevuAl(islem.id)}
                      puanlamaAktif={puanlamaAktif}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="py-8 text-center text-gray-500">
              Bu kategoride henüz hizmet bulunmamaktadır.
            </div>
          )}
          
          {isStaff && (
            <div className="p-4 bg-gray-50">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  onServiceEdit({ kategori_id: id, islem_adi: '', fiyat: 0, puan: 0 });
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Bu Kategoriye Hizmet Ekle
              </Button>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kategoriyi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu kategoriyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve kategori içindeki tüm hizmetler de silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => onCategoryDelete(id)}
              className="bg-red-500 hover:bg-red-600"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
