
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { CategoryCard } from "./CategoryCard";

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
  puanlamaAktif,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  // Fix the style object to conform to CSSProperties
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : undefined,  // Use undefined instead of 'auto'
    position: isDragging ? 'relative' : undefined as any,  // Use undefined and type assertion
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <AccordionItem value={kategori.id.toString()} className="border rounded-md bg-white">
        <div className="flex items-center">
          {isStaff && (
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-2 flex items-center"
            >
              <GripVertical className="h-5 w-5 text-gray-400" />
            </div>
          )}
          <AccordionTrigger className="flex-grow py-4 hover:no-underline">
            <span className="font-medium text-left">{kategori.kategori_adi}</span>
          </AccordionTrigger>
        </div>
        <AccordionContent className="p-4">
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
        </AccordionContent>
      </AccordionItem>
    </div>
  );
}
