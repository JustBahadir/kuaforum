
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ServiceItem } from "./ServiceItem";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface SortableCategoryProps {
  id: number;
  kategori: any;
  islemler: any[];
  isStaff: boolean;
  onServiceEdit?: (islem: any) => void;
  onServiceDelete?: (islem: any) => void;
  onCategoryDelete?: (kategoriId: number) => void;
  onSiralamaChange?: (items: any[]) => void;
  onRandevuAl?: (islemId: number) => void;
}

export function SortableCategory({
  id,
  kategori,
  islemler,
  isStaff,
  onServiceEdit,
  onServiceDelete,
  onCategoryDelete,
  onSiralamaChange,
  onRandevuAl
}: SortableCategoryProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 1 : 0
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = islemler.findIndex((i) => i.id === active.id);
      const newIndex = islemler.findIndex((i) => i.id === over.id);
      
      const newItems = [...islemler];
      const [removed] = newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, removed);
      
      if (onSiralamaChange) {
        onSiralamaChange(newItems);
      }
    }
  };

  return (
    <AccordionItem 
      value={`${kategori.id}`} 
      ref={setNodeRef} 
      style={style}
      className="border rounded-lg overflow-hidden"
    >
      <div className="flex items-center">
        {isStaff && (
          <div 
            {...attributes} 
            {...listeners}
            className="px-3 cursor-grab hover:text-primary"
          >
            <GripVertical className="h-5 w-5" />
          </div>
        )}
        <AccordionTrigger className="flex-1 px-4 py-3 bg-slate-50 hover:bg-slate-100 font-medium">
          {kategori.kategori_adi}
        </AccordionTrigger>
        {isStaff && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="mr-2 text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Kategoriyi Sil</AlertDialogTitle>
                <AlertDialogDescription>
                  Bu kategoriyi silmek istediğinizden emin misiniz?
                  Bu işlem geri alınamaz.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onCategoryDelete?.(kategori.id)}
                  className="bg-destructive text-destructive-foreground"
                >
                  Sil
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      <AccordionContent className="px-4 py-2">
        {isStaff ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={islemler.map((islem) => islem.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2 py-2">
                {islemler.map((islem) => (
                  <ServiceItem
                    key={islem.id}
                    id={islem.id}
                    islem={islem}
                    isStaff={isStaff}
                    onEdit={onServiceEdit}
                    onDelete={onServiceDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="space-y-2 py-2">
            {islemler.map((islem) => (
              <ServiceItem
                key={islem.id}
                id={islem.id}
                islem={islem}
                isStaff={isStaff}
                onRandevuAl={onRandevuAl}
              />
            ))}
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
