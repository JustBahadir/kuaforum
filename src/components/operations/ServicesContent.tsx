
import { CategoryCard } from "./CategoryCard";
import { ServiceForm } from "./ServiceForm";
import { CategoryForm } from "./CategoryForm";

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
  onRandevuAl: (islemId: number) => void;
  formuSifirla: () => void;
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
  onRandevuAl,
  formuSifirla,
}: ServicesContentProps) {
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

      <div className="space-y-6">
        {kategoriler.map((kategori) => (
          <CategoryCard
            key={kategori.id}
            kategori={kategori}
            islemler={islemler.filter((islem: any) => islem.kategori_id === kategori.id)}
            isStaff={isStaff}
            onEdit={onServiceEdit}
            onDelete={onServiceDelete}
            onKategoriDelete={onCategoryDelete}
            onSiralamaChange={onSiralamaChange}
            onRandevuAl={onRandevuAl}
          />
        ))}
      </div>
    </>
  );
}
