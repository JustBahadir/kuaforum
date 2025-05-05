
export interface Personel {
  id: string;
  dukkan_id: string;
  eposta: string;
  telefon: string;
  adres: string;
  ad_soyad: string;
  maas: number;
  prim_yuzdesi: number;
  personel_no: string;
  iban?: string;
  calisma_sistemi: string;
  birth_date?: string | Date;
  auth_id?: string;
  avatar_url?: string;
  created_at?: string | Date;
}

export interface Personnel {
  id: string;
  dukkan_id: string;
  eposta: string;
  telefon: string;
  adres: string;
  ad_soyad: string;
  maas: number;
  prim_yuzdesi: number;
  personel_no: string;
  iban?: string;
  calisma_sistemi: string;
  birth_date?: string | Date;
  auth_id?: string;
  avatar_url?: string;
  created_at?: string | Date;
}

export interface PersonnelFormProps {
  personel?: Personel;
  onSubmit: (personel: Omit<Personel, "id" | "created_at">) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface ServiceFormProps {
  isletmeId?: string;
  kategoriler?: any[];
  islem?: any;
  onSuccess?: () => Promise<void>;
  onCancel?: () => void;
  puanlamaAktif?: boolean;
  setPuanlamaAktif?: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface ShopProfileHeaderProps {
  shopData: any;
  isOwner: boolean;
}

export interface ShopWorkingHoursCardProps {
  calisma_saatleri: any[];
  userRole?: string;
  dukkanId?: string;
}

export interface PersonnelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  personnel?: Personel | null;
  isEditMode: boolean;
}

export interface ServiceCategoryFormProps {
  isletmeId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => Promise<void>;
  onCancel?: () => void;
  dukkanId?: string;
}

export interface CategoryFormProps {
  dukkanId?: string;
  kategori?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export interface ServicesListProps {
  isStaff?: boolean;
  kategoriler?: any[];
  islemler?: any[];
  dialogAcik?: boolean;
  setDialogAcik?: React.Dispatch<React.SetStateAction<boolean>>;
  kategoriDialogAcik?: boolean;
  setKategoriDialogAcik?: React.Dispatch<React.SetStateAction<boolean>>;
  kategoriEditDialogAcik?: boolean;
  setKategoriEditDialogAcik?: React.Dispatch<React.SetStateAction<boolean>>;
  seciliKategori?: any;
  setSeciliKategori?: React.Dispatch<React.SetStateAction<any>>;
  seciliIslem?: any;
  setSeciliIslem?: React.Dispatch<React.SetStateAction<any>>;
  handleRandevuClick?: (islem: any) => void;
  handleIslemClick?: (islem: any) => void;
  handleKategoriClick?: (kategori: any) => void;
  isLoading?: boolean;
  handleIslemSil?: (islemId: string) => Promise<void>;
  handleKategoriSil?: (kategoriId: string) => Promise<void>;
  handleIslemEkleClick?: () => void;
  handleKategoriEkleClick?: () => void;
  isletmeId?: string;
  dukkanId?: string;
  yenile?: () => Promise<void>;
  inactiveKategoriler?: any[];
  inactiveIslemler?: any[];
  showInactive?: boolean;
  setShowInactive?: React.Dispatch<React.SetStateAction<boolean>>;
  puanlamaAktif?: boolean;
  setPuanlamaAktif?: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface ServiceCategoriesListProps {
  kategoriler?: any[];
  onEdit?: (kategori: any) => void;
  onDelete?: (kategoriId: string) => Promise<void>;
  onOrderChange?: (newOrder: any[]) => Promise<void>;
  inactiveKategoriler?: any[];
  showInactive?: boolean;
  setShowInactive?: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface WorkingHoursProps {
  isletmeId: string;
}

export interface PersonnelListProps {
  personel?: Personel[];
  onEdit?: (personnel: Personel) => void;
  isLoading?: boolean;
}
