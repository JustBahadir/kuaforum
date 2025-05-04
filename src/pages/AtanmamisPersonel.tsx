
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function AtanmamisPersonel() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Başarıyla çıkış yapıldı');
      navigate('/login');
    } catch (err) {
      console.error('Çıkış hatası:', err);
      toast.error('Çıkış yaparken bir hata oluştu');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Atanmamış Personel</h1>
          <p className="mt-2 text-gray-600">Henüz bir işletmeye atanmadınız.</p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Sistem şu anda test modunda çalışmaktadır. Sadece giriş, kayıt ve profil tamamlama ekranları aktif durumdadır.
          </p>

          <Button 
            onClick={handleSignOut}
            className="w-full"
            variant="destructive"
          >
            Çıkış Yap
          </Button>
        </div>
      </div>
    </div>
  );
}
