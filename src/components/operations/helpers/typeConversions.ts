
/**
 * Türkçe dosya adı: tipDonusumleri.ts
 * Açıklama: Tip dönüşümlerini yöneten yardımcı fonksiyonlar
 */

/**
 * Sayısal bir değeri string'e dönüştürür
 * @param value Dönüştürülecek değer
 * @returns String olarak sayı
 */
export function sayiyiMetneDetir(value: number | string | undefined | null): string {
  if (value === undefined || value === null) return '0';
  return String(value);
}

/**
 * String bir değeri sayıya dönüştürür
 * @param value Dönüştürülecek metin
 * @param defaultValue Hata durumunda dönecek varsayılan değer
 * @returns Sayı değeri
 */
export function metniSayiyaDonustur(value: string | undefined | null, defaultValue = 0): number {
  if (!value) return defaultValue;
  const sayi = parseFloat(value);
  return isNaN(sayi) ? defaultValue : sayi;
}

/**
 * String bir değeri tam sayıya dönüştürür
 * @param value Dönüştürülecek metin
 * @param defaultValue Hata durumunda dönecek varsayılan değer
 * @returns Tam sayı değeri
 */
export function metniTamSayiyaDonustur(value: string | undefined | null, defaultValue = 0): number {
  if (!value) return defaultValue;
  const sayi = parseInt(value);
  return isNaN(sayi) ? defaultValue : sayi;
}
