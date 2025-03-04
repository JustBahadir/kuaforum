
export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: string;
  gender?: "erkek" | "kadın" | null;
  birthdate?: string;
  avatar_url?: string;
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
}

export function getGenderTitle(gender?: string | null): string {
  if (!gender) return "";
  
  switch(gender) {
    case "erkek": return "Bey";
    case "kadın": return "Hanım";
    default: return "";
  }
}
