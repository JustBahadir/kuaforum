
/**
 * Geçici olarak devre dışı bırakılmış bileşenler
 * Bu bileşenler hata ayıklama tamamlanana kadar kullanılmayacaklar
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

// Boş bileşen - hiçbir şey render etmez
export const BosKomponent = () => null;

// Devre dışı bileşen - "Geliştirme aşamasında" mesajı gösterir
export const DevreDisiBilesenKartiTemel = ({ baslik = "Geliştirme Aşamasında", aciklama = "Bu özellik şu anda geliştirme aşamasındadır." }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{baslik}</CardTitle>
        <CardDescription>{aciklama}</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Dikkat</AlertTitle>
          <AlertDescription>
            Bu bileşen henüz kullanıma hazır değildir. Lütfen daha sonra tekrar deneyin.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

// Devre dışı bileşen - Özelleştirilebilir içerikle
export const DevreDisiBilesenKarti = ({ baslik, aciklama, icerik }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{baslik || "Geliştirme Aşamasında"}</CardTitle>
        {aciklama && <CardDescription>{aciklama}</CardDescription>}
      </CardHeader>
      <CardContent>
        {icerik || (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Dikkat</AlertTitle>
            <AlertDescription>
              Bu bileşen henüz kullanıma hazır değildir. Lütfen daha sonra tekrar deneyin.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

// Devre dışı sayfa bileşeni - tam ekran mesaj gösterir
export const DevreDisiBilesenSayfa = ({ baslik = "Sayfa Geliştirme Aşamasında", aciklama = "Bu sayfa şu anda geliştirme aşamasındadır ve yakında kullanıma sunulacaktır." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-center">{baslik}</CardTitle>
          <CardDescription className="text-center">{aciklama}</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Geliştirme Devam Ediyor</AlertTitle>
            <AlertDescription>
              Bu sayfa henüz kullanıma hazır değildir. Lütfen daha sonra tekrar deneyin.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

// İşletme sahibi için geçici ana sayfa
export const IsletmeSahibiSayfasi = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-center">İşletme Yönetim Paneli</CardTitle>
          <CardDescription className="text-center">Bu sayfa şu anda geliştirme aşamasındadır.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Geliştirme Devam Ediyor</AlertTitle>
            <AlertDescription>
              İşletme yönetim paneli yakında kullanıma sunulacaktır. Şu anda sadece temel kimlik doğrulama ve profil oluşturma özellikleri aktiftir.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

// Personel için geçici ana sayfa
export const PersonelSayfasi = ({ durum = "atanmamis" }) => {
  const durumMesaji = {
    atanmamis: "Henüz bir işletmeye atanmadınız. İşletme kodunu girerek bir işletmeye başvurabilirsiniz.",
    beklemede: "Başvurunuz işletme sahibi tarafından değerlendirilmeyi bekliyor.",
    onaylandi: "İşletmeye erişiminiz onaylandı. Yakında tüm özellikler kullanımınıza açılacaktır."
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-center">Personel Paneli</CardTitle>
          <CardDescription className="text-center">Personel durumu: {durum}</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className={durum === "onaylandi" ? "bg-green-50" : durum === "beklemede" ? "bg-yellow-50" : "bg-blue-50"}>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Bilgi</AlertTitle>
            <AlertDescription>{durumMesaji[durum]}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

// Tüm sorunlu bileşenler için varsayılan dışa aktarımlar
export const CalismaSaatleri = () => <BosKomponent />;
export const JoinShopModal = () => <BosKomponent />;
export const WorkingHours = () => <BosKomponent />;
