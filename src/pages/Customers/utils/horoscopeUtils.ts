
/**
 * Calculates the horoscope sign based on birth date
 */
export function getHoroscope(birthDate: Date): string | null {
  if (!birthDate) return null;
  
  const day = birthDate.getDate();
  const month = birthDate.getMonth() + 1; // JavaScript months are 0-based
  
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    return "Koç";
  } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    return "Boğa";
  } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
    return "İkizler";
  } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
    return "Yengeç";
  } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    return "Aslan";
  } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    return "Başak";
  } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
    return "Terazi";
  } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
    return "Akrep";
  } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
    return "Yay";
  } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
    return "Oğlak";
  } else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    return "Kova";
  } else if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) {
    return "Balık";
  }
  
  return null;
}

/**
 * Fetches horoscope description from elle.com.tr
 */
export async function getHoroscopeDescription(horoscope: string): Promise<string> {
  // Map Turkish horoscope names to English as used in the URL
  const horoscopeMap: Record<string, string> = {
    "Koç": "koc",
    "Boğa": "boga",
    "İkizler": "ikizler",
    "Yengeç": "yengec",
    "Aslan": "aslan",
    "Başak": "basak",
    "Terazi": "terazi",
    "Akrep": "akrep",
    "Yay": "yay",
    "Oğlak": "oglak",
    "Kova": "kova",
    "Balık": "balik"
  };
  
  // In a real implementation, this would fetch the horoscope from elle.com.tr
  // For simulation purposes, we'll return a fixed description
  const englishHoroscope = horoscopeMap[horoscope] || "";
  
  // We're simulating the API call since we can't actually scrape the website
  return `${horoscope} burcu günlük yorumu: Bugün kendinizi daha enerjik ve motive hissedebilirsiniz. İş hayatınızda olumlu gelişmeler yaşanabilir. Sevdiklerinizle vakit geçirmek size iyi gelecek.`;
}
