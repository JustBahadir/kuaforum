
export type HoroscopeSign = 
  'Koç' | 'Boğa' | 'İkizler' | 'Yengeç' | 'Aslan' | 'Başak' | 
  'Terazi' | 'Akrep' | 'Yay' | 'Oğlak' | 'Kova' | 'Balık' | null;

interface HoroscopeRange {
  sign: HoroscopeSign;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
}

// Burç tarih aralıklarını tanımla
const horoscopeRanges: HoroscopeRange[] = [
  { sign: 'Koç', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
  { sign: 'Boğa', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
  { sign: 'İkizler', startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
  { sign: 'Yengeç', startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 },
  { sign: 'Aslan', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
  { sign: 'Başak', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
  { sign: 'Terazi', startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
  { sign: 'Akrep', startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
  { sign: 'Yay', startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 },
  { sign: 'Oğlak', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
  { sign: 'Kova', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
  { sign: 'Balık', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
];

// Doğum tarihine göre burç hesaplama
export function getHoroscope(birthDate: Date | null): HoroscopeSign {
  if (!birthDate) return null;
  
  const month = birthDate.getMonth() + 1; // JavaScript'te aylar 0-11 arası
  const day = birthDate.getDate();
  
  const horoscope = horoscopeRanges.find(range => {
    // Aynı ay içinde başlayıp biten burçlar için
    if (range.startMonth === range.endMonth) {
      return month === range.startMonth && day >= range.startDay && day <= range.endDay;
    }
    
    // Yılı aşan burçlar için (örn. Oğlak)
    if (range.startMonth > range.endMonth) {
      return (month === range.startMonth && day >= range.startDay) || 
             (month === range.endMonth && day <= range.endDay);
    }
    
    // Normal durumlar için
    return (month === range.startMonth && day >= range.startDay) || 
           (month === range.endMonth && day <= range.endDay) || 
           (month > range.startMonth && month < range.endMonth);
  });
  
  return horoscope?.sign || null;
}

// Burç özelliklerini getir
export function getHoroscopeDescription(sign: HoroscopeSign): string {
  if (!sign) return '';
  
  const descriptions: Record<string, string> = {
    'Koç': 'Cesur, enerjik ve lider ruhlu. Koç burcu insanları girişimci, dinamik ve hızlı karar verebilen kişilerdir. Yeni başlangıçlar yapmayı severler. Sabırsız olabilirler.',
    'Boğa': 'Kararlı, güvenilir ve pratik. Boğa burcu insanları sadık, sakin ve rahata düşkündür. Değişimden hoşlanmazlar ve maddi güvenliğe önem verirler. İnatçı olabilirler.',
    'İkizler': 'Meraklı, uyumlu ve zeki. İkizler burcu insanları iletişimi kuvvetli, hareketli ve çok yönlüdür. Birden fazla konuyla aynı anda ilgilenebilirler. Kararsız olabilirler.',
    'Yengeç': 'Duygusal, koruyucu ve sezgisel. Yengeç burcu insanları ailesine düşkün, merhametli ve derin duygulara sahiptir. Yuvalarına bağlıdırlar. Alıngan olabilirler.',
    'Aslan': 'Yaratıcı, tutkulu ve cömert. Aslan burcu insanları kendine güvenen, lider ve dikkat çekmeyi seven kişilerdir. Sadık ve sıcakkanlıdırlar. Kibirli olabilirler.',
    'Başak': 'Analitik, çalışkan ve titiz. Başak burcu insanları detaylara dikkat eden, mükemmeliyetçi ve yardımseverdir. Pratik çözümler üretirler. Eleştirel olabilirler.',
    'Terazi': 'Diplomatik, adil ve uyumlu. Terazi burcu insanları ilişkilere önem veren, dengeli ve estetik anlayışı yüksek kişilerdir. Sosyal adaleti önemserler. Kararsız olabilirler.',
    'Akrep': 'Tutkulu, kararlı ve derin. Akrep burcu insanları güçlü sezgilere sahip, gizemli ve araştırmacıdır. İntikam duyguları güçlüdür. Kıskanç olabilirler.',
    'Yay': 'Maceracı, iyimser ve dürüst. Yay burcu insanları özgürlüğüne düşkün, bilgiye açık ve felsefi düşünceye yatkındır. Gezmeyi severler. Düşüncesiz olabilirler.',
    'Oğlak': 'Disiplinli, sorumlu ve sabırlı. Oğlak burcu insanları hırslı, geleneksel ve çalışkandır. Kariyer odaklıdırlar. Mesafeli olabilirler.',
    'Kova': 'Özgün, idealist ve bağımsız. Kova burcu insanları yenilikçi, insancıl ve entelektüel kişilerdir. Toplumsal konulara ilgi duyarlar. Duygusal olarak mesafeli olabilirler.',
    'Balık': 'Şefkatli, artistik ve sezgisel. Balık burcu insanları hayalperest, empatik ve romantiktir. Sanatsal yetenekleri vardır. Gerçeklerden kaçma eğiliminde olabilirler.'
  };
  
  return descriptions[sign] || '';
}

// twitburc.com.tr sitesinden günlük burç yorumu çekme fonksiyonu
export async function getDailyHoroscopeReading(sign: HoroscopeSign): Promise<string> {
  if (!sign) return 'Burç bilgisi bulunamadı';
  
  try {
    // Türkçe karakter dönüşümü yapmak için
    const signForUrl = sign.toLowerCase()
      .replace('ç', 'c')
      .replace('ğ', 'g')
      .replace('ı', 'i')
      .replace('ö', 'o')
      .replace('ş', 's')
      .replace('ü', 'u');
    
    // Not: Gerçek implementasyonda burada bir API çağrısı yapılır
    // Şimdilik aşağıdaki örnek yorumu döndürüyoruz
    return `${sign} burcu için günlük yorumunuz: Bugün kendinizi enerjik hissedeceksiniz. Yeni fırsatlar kapınızı çalabilir, açık olun. Twitburc.com.tr kaynağından alınmıştır.`;
    
    // Gerçek uygulama için API çağrısı örneği (sunucu tarafında veya CORS sorunu çözülmüş olmalı):
    // const response = await fetch(`https://twitburc.com.tr/gunluk-burc-yorumlari/${signForUrl}-burcu-gunluk-yorumu.html`);
    // const html = await response.text();
    // return html'den burç yorumunu çıkarma işlemi...
  } catch (error) {
    console.error('Günlük burç yorumu alınırken hata:', error);
    return `${sign} burcu için günlük yorum alınamadı. Lütfen daha sonra tekrar deneyin.`;
  }
}
