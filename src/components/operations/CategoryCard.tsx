
import { useState } from "react";
import { ServiceItem } from "./ServiceItem";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { ServiceForm } from "./ServiceForm";

export function CategoryCard({ kategori, islemler, isStaff, onServiceEdit, onServiceDelete, onCategoryDelete, onCategoryEdit, onSiralamaChange, onRandevuAl, puanlamaAktif }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false);
  const [islemAdi, setIslemAdi] = useState("");
  const [fiyat, setFiyat] = useState(0);
  const [maliyet, setMaliyet] = useState(0);
  const [puan, setPuan] = useState(0);
  const [duzenleId, setDuzenleId] = useState(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = islemler.findIndex(item => item.id === active.id);
      const newIndex = islemler.findIndex(item => item.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(islemler, oldIndex, newIndex);
        onSiralamaChange(newItems);
      }
    }
  };
  
  const handleAddServiceClick = () => {
    setIslemAdi("");
    setFiyat(0);
    setMaliyet(0);
    setPuan(0);
    setDuzenleId(null);
    setIsServiceFormOpen(true);
  };
  
  const handleServiceFormSubmit = (e) => {
    e.preventDefault();
    
    const service = {
      islem_adi: islemAdi,
      fiyat,
      maliyet,
      puan,
      kategori_id: kategori.id
    };
    
    if (duzenleId) {
      onServiceEdit({ ...service, id: duzenleId });
    } else {
      onServiceEdit(service);
    }
    
    setIsServiceFormOpen(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between pb-2">
        <h3 className="text-lg font-semibold">{kategori.kategori_adi}</h3>
        {isStaff && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onCategoryEdit(kategori)}
              className="h-8 w-8 text-gray-500"
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Düzenle</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="h-8 w-8 text-red-500"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Sil</span>
            </Button>
          </div>
        )}
      </div>
      
      <div className="rounded-lg border bg-card">
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={islemler.map(item => item.id)} 
            strategy={verticalListSortingStrategy}
          >
            <div className="divide-y">
              {islemler.map((islem) => (
                <ServiceItem
                  key={islem.id}
                  islem={islem}
                  isStaff={isStaff}
                  onEdit={onServiceEdit}
                  onDelete={onServiceDelete}
                  onRandevuAl={onRandevuAl}
                  puanlamaAktif={puanlamaAktif}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        
        {islemler.length === 0 && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Bu kategoride henüz hizmet bulunmamaktadır.
          </div>
        )}
        
        {isStaff && (
          <div className="border-t px-4 py-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddServiceClick}
              className="w-full flex items-center justify-center gap-1"
            >
              <Plus className="h-4 w-4" />
              <span>Bu Kategoriye Hizmet Ekle</span>
            </Button>
          </div>
        )}
      </div>
      
      <ServiceForm
        isOpen={isServiceFormOpen}
        onOpenChange={setIsServiceFormOpen}
        kategoriler={[]}
        islemAdi={islemAdi}
        setIslemAdi={setIslemAdi}
        fiyat={fiyat}
        setFiyat={setFiyat}
        maliyet={maliyet}
        setMaliyet={setMaliyet}
        puan={puan}
        setPuan={setPuan}
        kategoriId={kategori.id}
        setKategoriId={() => {}} // Kategori ID'si zaten belirlenmiş olduğu için boş fonksiyon
        duzenleId={duzenleId}
        onSubmit={handleServiceFormSubmit}
        onReset={() => {}}
        puanlamaAktif={puanlamaAktif}
        showCategorySelect={false} // Kategori seçimini gösterme
      />
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kategoriyi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              "{kategori.kategori_adi}" kategorisini ve içindeki tüm hizmetleri silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => onCategoryDelete(kategori.id)}
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
