
/**
 * Formats a user's name based on gender
 * 
 * @param firstName The user's first name
 * @param lastName The user's last name
 * @param gender The user's gender ('erkek', 'kadın', or null)
 * @returns Properly formatted name with title
 */
export function formatNameWithTitle(firstName: string, lastName: string, gender: 'erkek' | 'kadın' | null | undefined): string {
  // If we have no name, return default
  if (!firstName && !lastName) {
    return "Kullanıcı";
  }

  // Format based on gender
  if (gender === 'erkek') {
    return `${firstName || ''} Bey`.trim();
  } else if (gender === 'kadın') {
    return `${firstName || ''} Hanım`.trim();
  } else {
    // No gender specified, use full name
    return `${firstName || ''} ${lastName || ''}`.trim();
  }
}

/**
 * Gets a proper welcome message with user's name and title
 * 
 * @param firstName The user's first name
 * @param lastName The user's last name
 * @param gender The user's gender ('erkek', 'kadın', or null)
 * @returns Welcome message with formatted name
 */
export function getWelcomeMessage(firstName: string, lastName: string, gender: 'erkek' | 'kadın' | null | undefined): string {
  const formattedName = formatNameWithTitle(firstName, lastName, gender);
  return `Hoşgeldiniz, ${formattedName}`;
}

/**
 * Gets the user role as Turkish text
 * 
 * @param role The user's role
 * @returns Translated role name
 */
export function getUserRoleText(role: string | null | undefined): string {
  switch (role) {
    case 'admin':
      return 'İşletme Sahibi';
    case 'staff':
      return 'Personel';
    case 'customer':
      return 'Müşteri';
    default:
      return 'Kullanıcı';
  }
}
