
import { Profile } from '../../types';

// Profile service types
export type ProfileUpdateData = Partial<Profile>;

export type ProfileCreationParams = {
  user_id: string;
  user_first_name: string;
  user_last_name: string;
  user_phone: string;
  user_role: string;
};

export type ProfileServiceError = {
  message: string;
  original?: unknown;
};

export type Gender = 'male' | 'female' | '';

export const getGenderTitle = (gender: string | undefined): string => {
  switch(gender) {
    case 'male': return 'Bey';
    case 'female': return 'Hanım';
    default: return '';
  }
};
