
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { personelServisi } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { PersonnelCard } from "./components/PersonnelCard";
import { Heading } from "@/components/ui/heading";
import { Search, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { JoinRequestsAdmin } from "./components/JoinRequestsAdmin";

export default function PersonnelPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("tumu");
  
  // Here's the fixed useQuery call - using a proper query function that doesn't directly pass the parameter
  const { data: personnelData = [], isLoading } = useQuery({
    queryKey: ['personnel'],
    queryFn: async () => {
      return personelServisi.hepsiniGetir();
    }
  });

  const filteredPersonnel = personnelData.filter(
    (person) =>
      person.ad_soyad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.telefon?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.eposta?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Heading
          title={t("Personnel")}
          description={t("Manage your personnel")}
        />
        <Button asChild>
          <Link to="/personnel/add">
            <Plus className="mr-2 h-4 w-4" /> {t("Add Personnel")}
          </Link>
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="tumu">Tümü</TabsTrigger>
            <TabsTrigger value="aktif">Aktif</TabsTrigger>
            <TabsTrigger value="katilim-talepleri">Katılım Talepleri</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <Input
            placeholder={t("Search personnel...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </div>
      
      <Separator />
      
      <Tabs value={activeTab} className="w-full">
        <TabsContent value="tumu" className="mt-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : filteredPersonnel.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-lg font-semibold mb-2">Personel bulunamadı</h3>
              <p className="text-muted-foreground mb-6">
                Henüz personel eklenmemiş veya arama kriterlerinizle eşleşen personel yok.
              </p>
              <Button asChild>
                <Link to="/personnel/add">
                  <Plus className="mr-2 h-4 w-4" /> Personel Ekle
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPersonnel.map((person) => (
                <PersonnelCard key={person.id} personnel={person} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="aktif" className="mt-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPersonnel
                .filter(person => person.aktif !== false)
                .map((person) => (
                  <PersonnelCard key={person.id} personnel={person} />
                ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="katilim-talepleri" className="mt-0">
          <JoinRequestsAdmin />
        </TabsContent>
      </Tabs>
    </div>
  );
}
