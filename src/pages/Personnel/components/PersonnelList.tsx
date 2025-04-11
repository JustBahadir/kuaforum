
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card, 
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Phone, Mail, Calendar, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PersonnelDetailsDialog } from "./PersonnelDetailsDialog";
import { useQuery } from "@tanstack/react-query";
import { personelServisi } from "@/lib/supabase";

interface PersonnelListProps {
  personnel?: any[];
  isLoading?: boolean;
  onEdit?: (personnel: any) => void;
  onDelete?: (id: number) => void;
  onPersonnelSelect?: (id: number | null) => void;
}

export function PersonnelList({ 
  personnel: externalPersonnel, 
  isLoading: externalLoading = false, 
  onEdit = () => {}, 
  onDelete = () => {},
  onPersonnelSelect = () => {}
}: PersonnelListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedPersonnel, setSelectedPersonnel] = useState<any>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [personnelToDelete, setPersonnelToDelete] = useState<number | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  // Use internal data fetching if external data is not provided
  const { data: fetchedPersonnel = [], isLoading: fetchLoading } = useQuery({
    queryKey: ['personel-list'],
    queryFn: () => personelServisi.hepsiniGetir(),
    enabled: !externalPersonnel,
  });

  // Determine which personnel data and loading state to use
  const personnel = externalPersonnel || fetchedPersonnel;
  const isLoading = externalLoading || fetchLoading;

  // Make sure personnel is always an array
  const personnelArray = Array.isArray(personnel) ? personnel : [];
  
  console.log("Personnel List Rendered with data:", personnelArray);

  const filteredPersonnel = personnelArray.filter(p => {
    if (!p) return false;
    const matchesSearch = p.ad_soyad?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || p.calisma_sistemi === filter;
    return matchesSearch && matchesFilter;
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleDeleteClick = (id: number) => {
    setPersonnelToDelete(id);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = () => {
    if (personnelToDelete !== null) {
      onDelete(personnelToDelete);
    }
    setIsDeleteAlertOpen(false);
    setPersonnelToDelete(null);
  };

  const handlePersonnelClick = (personnel: any) => {
    setSelectedPersonnel(personnel);
    setIsDetailsDialogOpen(true);
    // Call the onPersonnelSelect prop with the selected personnel id
    if (onPersonnelSelect) {
      onPersonnelSelect(personnel.id);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Personel ara..."
            className="pl-8"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="sm:w-[180px]">
            <SelectValue placeholder="Çalışma şekli" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="aylik_maas">Maaşlı</SelectItem>
            <SelectItem value="prim_komisyon">Yüzdelik</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredPersonnel.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {personnelArray.length === 0 ? "Personel bulunamadı." : "Arama kriterleriyle eşleşen personel bulunamadı."}
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-250px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPersonnel.map((p) => (
              <Card key={p.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => handlePersonnelClick(p)}>
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12 border">
                      <AvatarImage src={p.avatar_url} alt={p.ad_soyad} />
                      <AvatarFallback>{getInitials(p.ad_soyad)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{p.ad_soyad}</CardTitle>
                      <Badge variant={p.calisma_sistemi === "aylik_maas" ? "outline" : "secondary"} className="mt-1">
                        {p.calisma_sistemi === "aylik_maas" ? "Maaşlı" : `%${p.prim_yuzdesi}`}
                      </Badge>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(p.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 mr-2" />
                      <span>{p.telefon}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 mr-2" />
                      <span className="truncate">{p.eposta}</span>
                    </div>
                    {p.birth_date && (
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 mr-2" />
                        <span>{new Date(p.birth_date).toLocaleDateString('tr-TR')}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu personel kaydı kalıcı olarak silinecek. Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <PersonnelDetailsDialog
        isOpen={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        personnel={selectedPersonnel}
      />
    </div>
  );
}
