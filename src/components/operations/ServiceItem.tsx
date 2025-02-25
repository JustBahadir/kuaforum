
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface ServiceItemProps {
  id: number;
  islem: any;
  isStaff: boolean;
  onEdit?: (islem: any) => void;
  onDelete?: (islem: any) => void;
  onRandevuAl?: (islemId: number) => void;
}

export function ServiceItem({ id, islem, isStaff, onEdit, onDelete, onRandevuAl }: ServiceItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (!isStaff) {
    return (
      <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
        <div>
          <h3 className="font-medium">{islem.islem_adi}</h3>
          <p className="text-sm text-muted-foreground">
            {islem.fiyat} TL
          </p>
        </div>
        <Button onClick={() => onRandevuAl?.(islem.id)}>
          Randevu Al
        </Button>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className="bg-white p-4 rounded-lg shadow-sm mb-2 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button {...attributes} {...listeners}>
          <GripVertical className="text-gray-400" />
        </button>
        <div>
          <h3 className="font-medium">{islem.islem_adi}</h3>
          <p className="text-sm text-muted-foreground">
            Fiyat: {islem.fiyat} TL | Puan: {islem.puan}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => onEdit?.(islem)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hizmeti Sil</AlertDialogTitle>
              <AlertDialogDescription>
                Bu hizmeti silmek istediğinizden emin misiniz?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>İptal</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete?.(islem)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Sil
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
