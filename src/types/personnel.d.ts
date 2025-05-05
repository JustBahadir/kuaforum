
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
  id: number;
  dukkan_id: number;
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
