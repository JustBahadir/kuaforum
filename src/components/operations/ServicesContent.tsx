
import { CategoryCard } from "./CategoryCard";
import { ServiceForm } from "./ServiceForm";
import { CategoryForm } from "./CategoryForm";
import { CategoryEditForm } from "./CategoryEditForm";
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
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Info, Plus } from "lucide-react";

interface ServicesContentProps {
  isStaff: boolean;
  kategoriler: any[];
  islemler: any[];
  dialogAcik: boolean;
  setDialogAcik: (open: boolean) => void;
  kategoriDialogAcik: boolean;
  setKategoriDialogAcik: (open: boolean) => void;
  kategoriDuzenleDialogAcik: boolean;
  setKategoriDuzenleDialogAcik: (open: boolean) => void;
  yeniKategoriAdi: string;
  setYeniKategoriAdi: (value: string) => void;
  duzenleKategoriId: number | null;
  duzenleKategoriAdi: string;
  setDuzenleKategoriAdi: (value: string) => void;
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
  onCategoryEditFormSubmit: (e: React.FormEvent) => void;
  onServiceEdit: (islem: any) => void;
  onServiceDelete: (islem: any) => void;
  onCategoryDelete: (kategoriId: number) => void;
  onCategoryEdit: (kategori: any) => void;
  onSiralamaChange: (items: any[]) => void;
  onCategoryOrderChange?: (items: any[]) => void;
  onRandevuAl: (islemId: number) => void;
  formuSifirla: () => void;
  dukkanId?: number | null;
  puanlamaAktif: boolean;
  setPuanlamaAktif: (value: boolean) => void;
}

export function ServicesContent({
  isStaff,
  kategoriler,
  islemler,
  dialogAcik,
  setDialogAcik,
  kategoriDialogAcik,
  setKategoriDialogAcik,
  kategoriDuzenleDialogAcik,
  setKategoriDuzenleDialogAcik,
  yeniKategoriAdi,
  setYeniKategoriAdi,
  duzenleKategoriId,
  duzenleKategoriAdi,
  setDuzenleKategoriAdi,
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
  onCategoryEditFormSubmit,
  onServiceEdit,
  onServiceDelete,
  onCategoryDelete,
  onCategoryEdit,
  onSiralamaChange,
  onCategoryOrderChange,
  onRandevuAl,
  formuSifirla,
  dukkanId,
  puanlamaAktif,
  setPuanlamaAktif,
}: ServicesContentProps) {
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  
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
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="puanlama-modu" 
                checked={puanlamaAktif} 
                onCheckedChange={setPuanlamaAktif} 
              />
              <Label htmlFor="puanlama-modu" className="text-sm">Puanlama Sistemi</Label>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 p-0"
                onClick={() => setInfoDialogOpen(true)}
              >
                <Info className="h-4 w-4" />
                <span className="sr-only">Puanlama Sistemi Bilgisi</span>
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  formuSifirla();
                  setDialogAcik(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Hizmet Ekle
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setKategoriDialogAcik(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Kategori Ekle
              </Button>
            </div>
            
            <CategoryForm 
              isOpen={kategoriDialogAcik}
              onOpenChange={setKategoriDialogAcik}
              kategoriAdi={yeniKategoriAdi}
              setKategoriAdi={setYeniKategoriAdi}
              onSubmit={onCategoryFormSubmit}
            />
            <CategoryEditForm
              isOpen={kategoriDuzenleDialogAcik}
              onOpenChange={setKategoriDuzenleDialogAcik}
              kategoriAdi={duzenleKategoriAdi}
              setKategoriAdi={setDuzenleKategoriAdi}
              onSubmit={onCategoryEditFormSubmit}
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
              puanlamaAktif={puanlamaAktif}
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
                  onCategoryEdit={onCategoryEdit}
                  onSiralamaChange={onSiralamaChange}
                  onRandevuAl={onRandevuAl}
                  puanlamaAktif={puanlamaAktif}
                />
              ))}
            </Accordion>
          </SortableContext>
        </DndContext>
      </div>

      {/* Information Dialog */}
      <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Puanlama Sistemi Hakkında</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <p>
              Puanlama sayesinde sizin belirleyeceğiniz sayıda puana ulaşan müşterilerinize indirim, 
              hediye veya sizin seçeceğiniz bir ödül sistemi olarak kullanmak için ekledik. 
              Aynı şekilde bunu personellerinize prim vermek için de kullanabilirsiniz.
              Bu sistemin kullanımı tamamen sizin tercihlerinize bağlıdır.
            </p>
          </div>
          <DialogFooter className="flex justify-center">
            <DialogClose asChild>
              <Button type="button" variant="default">Kapat</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
