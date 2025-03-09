
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit, Trash2, CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useState } from 'react';

export function ServiceItem({ islem, isStaff, onEdit, onDelete, onRandevuAl, puanlamaAktif }) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition 
  } = useSortable({ id: islem.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleDelete = () => {
    console.log("ServiceItem - handleDelete çağrıldı, islem.id:", islem.id);
    onDelete(islem.id);
    setDeleteConfirmOpen(false);
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="flex items-center py-3 px-4 bg-white"
    >
      {isStaff && (
        <div 
          {...attributes} 
          {...listeners} 
          className="mr-3 flex items-center cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>
      )}
      
      <div className="flex-1">
        <h4 className="font-medium">{islem.islem_adi}</h4>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="font-medium">{formatPrice(islem.fiyat)}</div>
          {puanlamaAktif && (
            <div className="text-sm text-muted-foreground">{islem.puan} puan</div>
          )}
        </div>
        
        {isStaff ? (
          <div className="flex">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onEdit(islem)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Düzenle</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setDeleteConfirmOpen(true)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Sil</span>
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onRandevuAl(islem.id)}
            className="flex items-center gap-1"
          >
            <CalendarPlus className="h-4 w-4" />
            <span>Randevu Al</span>
          </Button>
        )}
      </div>
      
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hizmeti Sil</AlertDialogTitle>
            <AlertDialogDescription>
              "{islem.islem_adi}" hizmetini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
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
