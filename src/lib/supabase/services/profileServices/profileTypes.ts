
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
