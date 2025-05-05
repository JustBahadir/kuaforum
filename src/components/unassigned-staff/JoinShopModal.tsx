
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface JoinShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function JoinShopModal({ isOpen, onClose, onSuccess }: JoinShopModalProps) {
  const [shopCode, setShopCode] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Kullanıcı girişi yapılmamış!');
      return;
    }
    
    if (!shopCode.trim()) {
      toast.error('İşletme kodu gereklidir');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Check if the shop code exists
      const { data: isletme, error: isletmeError } = await supabase
        .from('isletmeler')
        .select('kimlik, isletme_adi')
        .eq('isletme_kodu', shopCode)
        .single();
      
      if (isletmeError || !isletme) {
        toast.error('Geçersiz işletme kodu. Böyle bir işletme bulunamadı.');
        setIsSubmitting(false);
        return;
      }
      
      // Create join request
      const { error: requestError } = await supabase
        .from('personel_basvurulari')
        .insert({
          kullanici_kimlik: user.id,
          isletme_kodu: shopCode,
          durum: 'beklemede',
          aciklama: description,
          tarih: new Date().toISOString().split('T')[0]
        });
      
      if (requestError) {
        console.error('Join request error:', requestError);
        toast.error('Başvuru gönderilirken bir hata oluştu');
        setIsSubmitting(false);
        return;
      }
      
      toast.success(`"${isletme.isletme_adi}" işletmesine başvurunuz gönderildi. İşletme sahibinin onayı bekleniyor.`);
      
      // Reset form and close modal
      setShopCode('');
      setDescription('');
      onClose();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>İşletmeye Katılım Talebi Gönder</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="shopCode">İşletme Kodu</Label>
            <Input
              id="shopCode"
              value={shopCode}
              onChange={(e) => setShopCode(e.target.value)}
              placeholder="İşletme kodunu giriniz"
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Açıklama (İsteğe Bağlı)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Eklemek istediğiniz bilgiler"
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>İptal</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Gönderiliyor...' : 'Başvuru Gönder'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
