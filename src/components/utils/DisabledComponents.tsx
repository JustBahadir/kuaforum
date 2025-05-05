
import React from "react";
import { Link } from "react-router-dom";

// Geliştirme sırasında geçici olarak kullanılan bileşenler

// İşletme sahibi sayfaları için geçici bileşen
export const IsletmeSahibiSayfasi: React.FC<{title?: string}> = ({title = "İşletme Sahibi Sayfası"}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
        <h1 className="text-2xl font-bold mb-4">{title}</h1>
        <p className="mb-6 text-gray-600">
          Bu sayfa şu anda geliştirme aşamasındadır. Çok yakında kullanıma açılacaktır.
        </p>
        <Link 
          to="/" 
          className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
};

// Personel sayfaları için geçici bileşen
export const PersonelSayfasi: React.FC<{durum: string}> = ({durum = "atanmamis"}) => {
  const durumBasligi = {
    "atanmamis": "Atanmamış Personel Sayfası",
    "beklemede": "Başvuru Bekleyen Personel Sayfası",
    "onaylandi": "Onaylanmış Personel Sayfası"
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
        <h1 className="text-2xl font-bold mb-4">{durumBasligi[durum] || "Personel Sayfası"}</h1>
        <p className="mb-6 text-gray-600">
          Bu sayfa şu anda geliştirme aşamasındadır. Çok yakında kullanıma açılacaktır.
        </p>
        <Link 
          to="/" 
          className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
};

// Diğer devre dışı sayfalar için genel bileşen
export const DevreDisiBilesenSayfa: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
        <h1 className="text-2xl font-bold mb-4">Sayfa Hazırlanıyor</h1>
        <p className="mb-6 text-gray-600">
          Bu özellik henüz geliştirme aşamasındadır. Lütfen daha sonra tekrar deneyiniz.
        </p>
        <Link 
          to="/" 
          className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
};

// Yardımcı fonksiyon - Devre dışı bileşen oluşturma
export function createDisabledComponent(name: string) {
  return () => (
    <div className="p-4 border border-dashed border-gray-300 rounded-md bg-gray-50 text-center">
      <p className="text-gray-500">{name} bileşeni şu anda devre dışı.</p>
    </div>
  );
}
