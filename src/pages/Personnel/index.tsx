
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, UserPlus } from "lucide-react";
import { PersonnelList } from "./components/PersonnelList";
import { PersonnelDialog } from "./components/PersonnelDialog";
import { PersonnelActionMenu } from "./components/PersonnelActionMenu"; 
import { PersonnelDetail } from "./components/PersonnelDetail";
import { CreatePersonnelForm } from "./components/CreatePersonnelForm";
import { personelServisi } from "@/lib/supabase/services/personelServisi";
import { toast } from "sonner";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";

export default function Personnel() {
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [selectedPersonnelId, setSelectedPersonnelId] = useState<number>(0);
  const { userRole } = useCustomerAuth();
  const [isNewPersonnelModalOpen, setIsNewPersonnelModalOpen] = useState(false);

  useEffect(() => {
    fetchPersonnel();
  }, []);

  const fetchPersonnel = async () => {
    setLoading(true);
    try {
      const data = await personelServisi.hepsiniGetir();
      console.log("Fetched personnel:", data);
      setPersonnel(data);
    } catch (error) {
      console.error("Personel yüklenirken hata:", error);
      toast.error("Personel listesi yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const filteredPersonnel = searchText
    ? personnel.filter((p) =>
        p.ad_soyad.toLowerCase().includes(searchText.toLowerCase()) ||
        (p.telefon && p.telefon.includes(searchText)) ||
        (p.eposta && p.eposta.toLowerCase().includes(searchText.toLowerCase()))
      )
    : personnel;

  const handleOpenNewPersonnelModal = () => {
    setIsNewPersonnelModalOpen(true);
  };

  return (
    <StaffLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Personel</h1>

        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle>Personel Ara</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="İsim, telefon veya e-posta ile ara..."
                  className="pl-8"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
              {userRole === 'admin' && (
                <Button
                  onClick={handleOpenNewPersonnelModal}
                  className="gap-1"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Yeni Personel</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <PersonnelList
          personel={filteredPersonnel}
          isLoading={loading}
          onRefresh={fetchPersonnel}
          onPersonnelSelect={setSelectedPersonnelId}
        />

        <PersonnelDialog 
          open={isNewPersonnelModalOpen}
          onOpenChange={setIsNewPersonnelModalOpen}
          onSuccess={fetchPersonnel}
        />
      </div>
    </StaffLayout>
  );
}
