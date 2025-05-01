
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { CategoryCard } from "./CategoryCard";

interface SortableCategoryProps {
  id: number;
  kategori: any;
  islemler: any[];
  isStaff: boolean;
  onServiceEdit: (islem: any) => void;
  onServiceDelete: (islemId: number) => void;
  onCategoryDelete: (kategoriId: number) => void;
  onCategoryEdit: (kategori: any) => void;
  onSiralamaChange: (items: any[]) => void;
  onRandevuAl: (islemId: number) => void;
  puanlamaAktif: boolean;
}

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
}: SortableCategoryProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: id,
    data: kategori
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
    position: isDragging ? 'relative' : 'static',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="touch-none">
      <AccordionItem 
        value={kategori.id.toString()}
        className={`border rounded-md p-1 ${isDragging ? 'bg-accent' : ''}`}
      >
        <AccordionTrigger 
          className="px-3 py-2"
          {...listeners}
        >
          {kategori.kategori_adi}
        </AccordionTrigger>
        <AccordionContent>
          <div className="p-3">
            <CategoryCard
              kategori={kategori}
              islemler={islemler}
              isStaff={isStaff}
              onServiceEdit={onServiceEdit}
              onServiceDelete={onServiceDelete}
              onCategoryDelete={onCategoryDelete}
              onCategoryEdit={onCategoryEdit}
              onSiralamaChange={onSiralamaChange}
              onRandevuAl={onRandevuAl}
              puanlamaAktif={puanlamaAktif}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </div>
  );
}
