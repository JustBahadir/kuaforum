
export interface Personel {
  id: string;
  dukkan_id: string;
  auth_id?: string;
  eposta: string;
  telefon: string;
  adres?: string;
  ad_soyad: string;
  maas: number;
  prim_yuzdesi: number;
  personel_no: string;
  iban?: string;
  calisma_sistemi?: string;
  birth_date?: string;
  avatar_url?: string;
  created_at?: string;
}

export type Personnel = Personel; // For compatibility

export interface PersonnelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  personnel?: Personel;
  isEditMode?: boolean;
}

export interface PersonnelFormProps {
  personel?: Personel;
  onSubmit: (formData: Omit<Personel, "id" | "created_at">) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface PersonnelListProps {
  personel: Personel[];
  onEdit: (personel: Personel) => void;
  isLoading: boolean;
  onRefresh?: () => void;
}

export interface ServiceCategoryFormProps {
  dukkanId: string;
  isletmeId?: string; // For backward compatibility
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  kategori?: any;
}

export interface CategoryFormProps {
  dukkanId: string;
  kategori?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export interface WorkingHoursProps {
  isletmeId: string;
}

export interface ServiceFormProps {
  isletmeId: string;
  kategoriler: any[];
  islem?: any;
  onSuccess: () => void;
  onCancel: () => void;
  puanlamaAktif?: boolean;
  setPuanlamaAktif?: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface ServicesListProps {
  kategoriler: any[];
  islemler: any[];
  onEdit?: (kategori: any) => void;
  onDelete?: (kategoriId: string) => Promise<void>;
  onOrderChange?: (newOrder: any[]) => Promise<void>;
  isStaff?: boolean;
  setDialogAcik?: React.Dispatch<React.SetStateAction<boolean>>;
  setSeciliIslem?: React.Dispatch<React.SetStateAction<any>>;
}

export interface ServiceCategoriesListProps {
  kategoriler: any[];
  onEdit?: (kategori: any) => void;
  onDelete?: (kategoriId: string) => Promise<void>;
  onOrderChange?: (newOrder: any[]) => Promise<void>;
  inactiveKategoriler?: any[];
  showInactive?: boolean;
  setShowInactive?: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface ShopWorkingHoursCardProps {
  calisma_saatleri?: any[];
  userRole?: string;
  dukkanId?: number | string;
}
