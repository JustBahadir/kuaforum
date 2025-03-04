
export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: string;
  gender?: "erkek" | "kadın" | null;
  birthdate?: string;
  avatar_url?: string;
  address?: string;
  iban?: string;
}

export interface ProfileServiceError {
  message: string;
  original?: any;
}

export interface ProfileCreationParams {
  first_name?: string;
  last_name?: string;
  role?: string;
  phone?: string;
  gender?: "erkek" | "kadın" | null;
  birthdate?: string;
  avatar_url?: string;
  address?: string;
  iban?: string;
  // Fields used by RPC functions
  user_id?: string;
  user_first_name?: string;
  user_last_name?: string;
  user_phone?: string;
  user_role?: string;
}

export function getGenderTitle(gender?: string | null): string {
  if (!gender) return "";
  
  switch(gender) {
    case "erkek": return "Bey";
    case "kadın": return "Hanım";
    default: return "";
  }
}
