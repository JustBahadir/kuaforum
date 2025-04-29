
import { Profil } from '../../types';

export type ProfileRole = 'admin' | 'staff' | 'customer';

export interface ProfileWithRole extends Profil {
  role: ProfileRole;
}
