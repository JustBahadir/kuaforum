
import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { personelServisi } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PersonnelCard } from "./PersonnelCard";
import { PersonnelDialog } from "./PersonnelDialog";
import { PersonnelDetailDialog } from "./PersonnelDetailDialog";
import { Plus, Search, FilterX } from "lucide-react";

interface PersonnelListProps {
  onPersonnelSelect?: (personnelId: number) => void;
}

export function PersonnelList({ onPersonnelSelect }: PersonnelListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<any>(null);

  const { data: personnel = [], isLoading } = useQuery({
    queryKey: ["personeller"],
    queryFn: () => personelServisi.hepsiniGetir(),
  });

  const handlePersonnelClick = useCallback((personnel: any) => {
    setSelectedPersonnel(personnel);
    if (onPersonnelSelect) {
      onPersonnelSelect(personnel.id);
    }
    setIsDetailDialogOpen(true);
  }, [onPersonnelSelect]);

  const getWorkingSystemLabel = (system: string): string => {
    switch (system) {
      case "aylik_maas":
        return "Aylık";
      case "haftalik_maas":
        return "Haftalık";
      case "gunluk_maas":
        return "Günlük";
      case "prim_komisyon":
        return "Yüzdelik";
      default:
        return system || "";
    }
  };

  // Filter personnel by search term
  const filteredPersonnel = useMemo(() => {
    if (!searchTerm.trim()) return personnel;
    
    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    
    return personnel.filter((person: any) => {
      return (
        person.ad_soyad?.toLowerCase().includes(lowerSearchTerm) ||
        person.telefon?.toLowerCase().includes(lowerSearchTerm) ||
        person.eposta?.toLowerCase().includes(lowerSearchTerm)
      );
    });
  }, [personnel, searchTerm]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Personel ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-9 w-9"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              <FilterX className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Personel
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredPersonnel.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-muted/30">
          <h3 className="font-medium mb-2">Personel bulunamadı</h3>
          <p className="text-sm text-muted-foreground">Arama kriterinize uygun personel bulunmamaktadır.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPersonnel.map((person: any) => (
            <PersonnelCard
              key={person.id}
              name={person.ad_soyad}
              phone={person.telefon}
              email={person.eposta}
              workingSystem={getWorkingSystemLabel(person.calisma_sistemi)}
              onClick={() => handlePersonnelClick(person)}
            />
          ))}
        </div>
      )}

      {/* Personnel Detail Dialog */}
      <PersonnelDetailDialog
        isOpen={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        personnel={selectedPersonnel}
        onPersonnelUpdated={() => {
          // Refresh data if needed
        }}
      />

      {/* Add New Personnel Dialog */}
      <PersonnelDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onPersonnelAdded={() => {
          // Do something when personnel is added
        }}
      />
    </div>
  );
}
