
import { Profil } from '../../types';

export type ProfileRole = 'admin' | 'staff' | 'customer';

export interface ProfileWithRole extends Profil {
  role: ProfileRole;
}

export interface ProfileUpdateData {
  id?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  gender?: string;
  shopname?: string;
  role?: string;
  birthdate?: string;
  avatar_url?: string;
  address?: string;
  iban?: string;
}
