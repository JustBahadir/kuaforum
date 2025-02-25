
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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

interface CategoryCardProps {
  kategori: any;
  islemler: any[];
  isStaff: boolean;
  onEdit?: (islem: any) => void;
  onDelete?: (islem: any) => void;
  onKategoriDelete?: (kategoriId: number) => void;
  onSiralamaChange?: (items: any[]) => void;
  onRandevuAl?: (islemId: number) => void;
}

export function CategoryCard({
  kategori,
  islemler,
  isStaff,
  onEdit,
  onDelete,
  onKategoriDelete,
  onSiralamaChange,
  onRandevuAl
}: CategoryCardProps) {
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
      
      onSiralamaChange?.(newItems);
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{kategori.kategori_adi}</h2>
        {isStaff && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive">
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
                  onClick={() => onKategoriDelete?.(kategori.id)}
                  className="bg-destructive text-destructive-foreground"
                >
                  Sil
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
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
            {islemler.map((islem) => (
              <ServiceItem
                key={islem.id}
                id={islem.id}
                islem={islem}
                isStaff={isStaff}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </SortableContext>
        </DndContext>
      ) : (
        <div className="space-y-2">
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
    </div>
  );
}
