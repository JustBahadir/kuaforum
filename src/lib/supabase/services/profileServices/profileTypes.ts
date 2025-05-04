
// Defining the role types explicitly to fix type errors
export type ProfileRole = 'admin' | 'staff' | 'customer';

// Profile interface with proper typing
export interface Profil {
  id: string;
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
