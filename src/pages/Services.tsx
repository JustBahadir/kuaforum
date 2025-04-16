import { useState } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServicesContent } from "@/components/operations/ServicesContent";
import { ServiceCostManagement } from "@/components/operations/ServiceCostManagement";
import { useQuery } from "@tanstack/react-query";
import { islemKategoriServisi, islemServisi } from "@/lib/supabase";

export default function Services() {
  const [activeTab, setActiveTab] = useState("services");
  const [dialogAcik, setDialogAcik] = useState(false);
  const [kategoriDialogAcik, setKategoriDialogAcik] = useState(false);
  const [kategoriDuzenleDialogAcik, setKategoriDuzenleDialogAcik] = useState(false);
  const [yeniKategoriAdi, setYeniKategoriAdi] = useState("");
  const [duzenleKategoriId, setDuzenleKategoriId] = useState<number | null>(null);
  const [duzenleKategoriAdi, setDuzenleKategoriAdi] = useState("");
  const [islemAdi, setIslemAdi] = useState("");
  const [fiyat, setFiyat] = useState<number>(0);
  const [maliyet, setMaliyet] = useState<number>(0);
  const [puan, setPuan] = useState<number>(0);
  const [kategoriId, setKategoriId] = useState<number | null>(null);
  const [duzenleId, setDuzenleId] = useState<number | null>(null);
  const [puanlamaAktif, setPuanlamaAktif] = useState(true);

  const { data: kategoriler = [] } = useQuery({
    queryKey: ['kategoriler'],
    queryFn: islemKategoriServisi.hepsiniGetir
  });

  const { data: islemler = [] } = useQuery({
    queryKey: ['islemler'],
    queryFn: islemServisi.hepsiniGetir
  });

  const handleServiceFormSubmit = () => {};
  const handleCategoryFormSubmit = () => {};
  const handleCategoryEditFormSubmit = () => {};
  const handleServiceEdit = () => {};
  const handleServiceDelete = () => {};
  const handleCategoryDelete = () => {};
  const handleCategoryEdit = () => {};
  const handleSiralamaChange = () => {};
  const handleRandevuAl = () => {};
  const formuSifirla = () => {};

  return (
    <StaffLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Hizmet Yönetimi</h1>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="services">Hizmetler</TabsTrigger>
            <TabsTrigger value="costs">Maliyet</TabsTrigger>
          </TabsList>
          
          <TabsContent value="services">
            <ServicesContent 
              isStaff={true}
              kategoriler={kategoriler}
              islemler={islemler}
              dialogAcik={dialogAcik}
              setDialogAcik={setDialogAcik}
              kategoriDialogAcik={kategoriDialogAcik}
              setKategoriDialogAcik={setKategoriDialogAcik}
              kategoriDuzenleDialogAcik={kategoriDuzenleDialogAcik}
              setKategoriDuzenleDialogAcik={setKategoriDuzenleDialogAcik}
              yeniKategoriAdi={yeniKategoriAdi}
              setYeniKategoriAdi={setYeniKategoriAdi}
              duzenleKategoriId={duzenleKategoriId}
              duzenleKategoriAdi={duzenleKategoriAdi}
              setDuzenleKategoriAdi={setDuzenleKategoriAdi}
              islemAdi={islemAdi}
              setIslemAdi={setIslemAdi}
              fiyat={fiyat}
              setFiyat={setFiyat}
              maliyet={maliyet}
              setMaliyet={setMaliyet}
              puan={puan}
              setPuan={setPuan}
              kategoriId={kategoriId}
              setKategoriId={setKategoriId}
              duzenleId={duzenleId}
              onServiceFormSubmit={handleServiceFormSubmit}
              onCategoryFormSubmit={handleCategoryFormSubmit}
              onCategoryEditFormSubmit={handleCategoryEditFormSubmit}
              onServiceEdit={handleServiceEdit}
              onServiceDelete={handleServiceDelete}
              onCategoryDelete={handleCategoryDelete}
              onCategoryEdit={handleCategoryEdit}
              onSiralamaChange={handleSiralamaChange}
              onRandevuAl={handleRandevuAl}
              formuSifirla={formuSifirla}
              puanlamaAktif={puanlamaAktif}
              setPuanlamaAktif={setPuanlamaAktif}
            />
          </TabsContent>
          
          <TabsContent value="costs">
            <ServiceCostManagement />
          </TabsContent>
        </Tabs>
      </div>
    </StaffLayout>
  );
}
