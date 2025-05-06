
// Personnel
export interface Personel {
  id: string | number;
  kimlik?: string;
  ad_soyad: string;
  telefon?: string;
  eposta?: string;
  adres?: string;
  birth_date?: string | Date;
  isletme_id?: string;
  dukkan_id?: string | number;
  maas?: number;
  prim_yuzdesi?: number;
  personel_no?: string;
  calisma_sistemi?: string;
  avatar_url?: string;
  iban?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PersonnelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  isletmeId: string;
}

export interface PersonnelFormProps {
  isletmeId: string;
  onSuccess: () => void;
}

export interface PersonnelDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  personnel: Personel;
}

export interface PersonnelListProps {
  personnel: Personel[];
  onEdit: (personnel: Personel) => void;
  isLoading: boolean;
  onRefresh?: (options?: any) => Promise<any>;
}

export interface PersonnelPerformanceProps {
  personnel: Personel[];
  onEdit: (personnel: Personel) => void;
  isLoading: boolean;
}

// Service forms
export interface ServiceFormProps {
  isletmeId: string;
  kategoriler: any[];
  islem: any;
  onSuccess: () => Promise<void> | void;
  onCancel: () => void;
  puanlamaAktif: boolean;
  setPuanlamaAktif: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface ServiceCategoryFormProps {
  dukkanId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess: () => Promise<void> | void;
  onCancel?: () => void;
}

export interface CategoryFormProps {
  dukkanId: string;
  kategori: any;
  onSuccess: () => void;
  onCancel: () => void;
}

// Shop components
export interface ShopProfileHeaderProps {
  shopData: any;
  isOwner: boolean;
}

export interface ShopWorkingHoursCardProps {
  calisma_saatleri: any[];
  userRole: string;
  dukkanId: number;
}

export interface ShopProfilePhotoUploadProps {
  shopData: any;
  isOwner: boolean;
  onLogoUpdated: (url: string) => Promise<void>;
}

// Service list
export interface ServicesListProps {
  isStaff: boolean;
  kategoriler: any[];
  islemler: any[];
  dialogAcik: boolean;
  setDialogAcik: React.Dispatch<React.SetStateAction<boolean>>;
  kategoriDialogAcik: boolean;
  setKategoriDialogAcik: React.Dispatch<React.SetStateAction<boolean>>;
  seciliIslem: any;
  setSeciliIslem: React.Dispatch<React.SetStateAction<any>>;
  seciliKategori: any;
  setSeciliKategori: React.Dispatch<React.SetStateAction<any>>;
  yenilemeGerekli: boolean;
  setYenilemeGerekli: React.Dispatch<React.SetStateAction<boolean>>;
  islemEkle: () => void;
  kategoriEkle: () => void;
  kategoriyeIslemEkle: (kategoriId: string | number) => void;
  islemSil: (islemId: string | number) => Promise<void>;
  kategoriSil: (kategoriId: string | number) => Promise<void>;
  islemGuncelle: (islem: any) => void;
  kategoriGuncelle: (kategori: any) => void;
  siraDegistir: (yeniSira: any[]) => Promise<void>;
  inactiveKategoriler: any[];
  showInactive: boolean;
  setShowInactive: React.Dispatch<React.SetStateAction<boolean>>;
  puanlamaAktif: boolean;
  setPuanlamaAktif: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface ServiceCategoriesListProps {
  kategoriler: any[];
  onEdit: (kategori: any) => void;
  onDelete: (kategoriId: string) => Promise<void>;
  onOrderChange: (newOrder: any[]) => Promise<void>;
  inactiveKategoriler: any[];
  showInactive: boolean;
  setShowInactive: React.Dispatch<React.SetStateAction<boolean>>;
}

// Working Hours
export interface WorkingHoursProps {
  isletmeId: string;
}

// AccountNotFound Component
export interface AccountNotFoundProps {
  accountExists?: boolean;
}
