
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function IsletmeOlustur() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-2xl font-bold">İşletme Oluşturuldu</h1>
          <p className="mt-2 text-gray-600">İşletmeniz başarıyla oluşturuldu.</p>
        </div>
        
        <div className="space-y-4">
          <p>
            İşletmenizi yönetmek için ana sayfaya gidebilirsiniz.
          </p>
          
          <Button 
            onClick={() => navigate("/isletme-anasayfa")}
            className="w-full"
          >
            İşletme Ana Sayfasına Git
          </Button>
        </div>
      </div>
    </div>
  );
}
