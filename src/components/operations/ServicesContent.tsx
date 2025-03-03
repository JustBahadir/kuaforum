import { CategoryCard } from "./CategoryCard";
import { ServiceForm } from "./ServiceForm";
import { CategoryForm } from "./CategoryForm";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { useState } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { SortableCategory } from "./SortableCategory";

interface ServicesContentProps {
  isStaff: boolean;
  kategoriler: any[];
  islemler: any[];
  dialogAcik: boolean;
  setDialogAcik: (open: boolean) => void;
  kategoriDialogAcik: boolean;
  setKategoriDialogAcik: (open: boolean) => void;
  yeniKategoriAdi: string;
  setYeniKategoriAdi: (value: string) => void;
  islemAdi: string;
  setIslemAdi: (value: string) => void;
  fiyat: number;
  setFiyat: (value: number) => void;
  puan: number;
  setPuan: (value: number) => void;
  kategoriId: number | null;
  setKategoriId: (value: number | null) => void;
  duzenleId: number | null;
  onServiceFormSubmit: (e: React.FormEvent) => void;
  onCategoryFormSubmit: (e: React.FormEvent) => void;
  onServiceEdit: (islem: any) => void;
  onServiceDelete: (islem: any) => void;
  onCategoryDelete: (kategoriId: number) => void;
  onSiralamaChange: (items: any[]) => void;
  onCategoryOrderChange?: (items: any[]) => void;
  onRandevuAl: (islemId: number) => void;
  formuSifirla: () => void;
  dukkanId?: number | null;
}

export function ServicesContent({
  isStaff,
  kategoriler,
  islemler,
  dialogAcik,
  setDialogAcik,
  kategoriDialogAcik,
  setKategoriDialogAcik,
  yeniKategoriAdi,
  setYeniKategoriAdi,
  islemAdi,
  setIslemAdi,
  fiyat,
  setFiyat,
  puan,
  setPuan,
  kategoriId,
  setKategoriId,
  duzenleId,
  onServiceFormSubmit,
  onCategoryFormSubmit,
  onServiceEdit,
  onServiceDelete,
  onCategoryDelete,
  onSiralamaChange,
  onCategoryOrderChange,
  onRandevuAl,
  formuSifirla,
  dukkanId,
}: ServicesContentProps) {
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const handleCategoryToggle = (value: string) => {
    setOpenCategories(prev => {
      if (prev.includes(value)) {
        return [];
      }
      return [value];
    });
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = kategoriler.findIndex(k => k.id === active.id);
      const newIndex = kategoriler.findIndex(k => k.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newKategoriler = arrayMove(kategoriler, oldIndex, newIndex);
        
        if (onCategoryOrderChange) {
          onCategoryOrderChange(newKategoriler);
        }
      }
    }
  };

  return (
    <>
      {isStaff && (
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Hizmet Yönetimi</h1>
          <div className="flex gap-2">
            <CategoryForm 
              isOpen={kategoriDialogAcik}
              onOpenChange={setKategoriDialogAcik}
              kategoriAdi={yeniKategoriAdi}
              setKategoriAdi={setYeniKategoriAdi}
              onSubmit={onCategoryFormSubmit}
            />
            <ServiceForm
              isOpen={dialogAcik}
              onOpenChange={setDialogAcik}
              kategoriler={kategoriler}
              islemAdi={islemAdi}
              setIslemAdi={setIslemAdi}
              fiyat={fiyat}
              setFiyat={setFiyat}
              puan={puan}
              setPuan={setPuan}
              kategoriId={kategoriId}
              setKategoriId={setKategoriId}
              duzenleId={duzenleId}
              onSubmit={onServiceFormSubmit}
              onReset={formuSifirla}
            />
          </div>
        </div>
      )}

      <div className="space-y-6 pt-4">
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={kategoriler.map(k => k.id)} 
            strategy={verticalListSortingStrategy}
          >
            <Accordion 
              type="single" 
              collapsible 
              className="w-full space-y-4"
              value={openCategories.length > 0 ? openCategories[0] : undefined}
              onValueChange={handleCategoryToggle}
            >
              {kategoriler.map((kategori) => (
                <SortableCategory
                  key={kategori.id}
                  id={kategori.id}
                  kategori={kategori}
                  islemler={islemler.filter((islem: any) => islem.kategori_id === kategori.id)}
                  isStaff={isStaff}
                  onServiceEdit={onServiceEdit}
                  onServiceDelete={onServiceDelete}
                  onCategoryDelete={onCategoryDelete}
                  onSiralamaChange={onSiralamaChange}
                  onRandevuAl={onRandevuAl}
                />
              ))}
            </Accordion>
          </SortableContext>
        </DndContext>
      </div>
    </>
  );
}
