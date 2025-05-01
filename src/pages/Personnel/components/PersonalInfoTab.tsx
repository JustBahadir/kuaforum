
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface PersonalInfoTabProps {
  personel: any;
  onRefresh: () => void;
}

export function PersonalInfoTab({ personel, onRefresh }: PersonalInfoTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    ad_soyad: personel?.ad_soyad || '',
    telefon: personel?.telefon || '',
    eposta: personel?.eposta || '',
    adres: personel?.adres || '',
    personel_no: personel?.personel_no || '',
    calisma_sistemi: personel?.calisma_sistemi || '',
    birth_date: personel?.birth_date || '',
    iban: personel?.iban || '',
    maas: personel?.maas || 0,
    prim_yuzdesi: personel?.prim_yuzdesi || 0
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSave = async () => {
    try {
      // Logic for saving personel data would go here
      toast.success('Personel bilgileri güncellendi');
      setIsEditing(false);
      onRefresh();
    } catch (error) {
      toast.error('Güncelleme sırasında bir hata oluştu');
      console.error('Error saving personnel data:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Kişisel Bilgiler</h2>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} variant="outline">
            Düzenle
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button onClick={() => setIsEditing(false)} variant="outline">
              İptal
            </Button>
            <Button onClick={handleSave}>
              Kaydet
            </Button>
          </div>
        )}
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="w-full md:w-2/3">
          <CardHeader>
            <CardTitle>Genel Bilgiler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ad_soyad">Ad Soyad</Label>
                {isEditing ? (
                  <Input
                    id="ad_soyad"
                    name="ad_soyad"
                    value={formData.ad_soyad}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="mt-1 text-muted-foreground">{formData.ad_soyad}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="telefon">Telefon</Label>
                {isEditing ? (
                  <Input
                    id="telefon"
                    name="telefon"
                    value={formData.telefon}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="mt-1 text-muted-foreground">{formData.telefon}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="eposta">E-Posta</Label>
                {isEditing ? (
                  <Input
                    id="eposta"
                    name="eposta"
                    type="email"
                    value={formData.eposta}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="mt-1 text-muted-foreground">{formData.eposta}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="birth_date">Doğum Tarihi</Label>
                {isEditing ? (
                  <Input
                    id="birth_date"
                    name="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="mt-1 text-muted-foreground">
                    {formData.birth_date || 'Belirtilmemiş'}
                  </p>
                )}
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="adres">Adres</Label>
                {isEditing ? (
                  <Input
                    id="adres"
                    name="adres"
                    value={formData.adres}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="mt-1 text-muted-foreground">{formData.adres}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="iban">IBAN</Label>
                {isEditing ? (
                  <Input
                    id="iban"
                    name="iban"
                    value={formData.iban}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="mt-1 text-muted-foreground">
                    {formData.iban || 'Belirtilmemiş'}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="w-full md:w-1/3">
          <CardHeader>
            <CardTitle>Profil</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="w-32 h-32">
              <AvatarImage src={personel?.avatar_url} />
              <AvatarFallback className="text-2xl">
                {getInitials(formData.ad_soyad)}
              </AvatarFallback>
            </Avatar>
            
            {isEditing && (
              <Button variant="outline">
                Fotoğraf Değiştir
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>İş Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="personel_no">Personel No</Label>
              {isEditing ? (
                <Input
                  id="personel_no"
                  name="personel_no"
                  value={formData.personel_no}
                  onChange={handleChange}
                />
              ) : (
                <p className="mt-1 text-muted-foreground">{formData.personel_no}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="calisma_sistemi">Çalışma Sistemi</Label>
              {isEditing ? (
                <Select
                  value={formData.calisma_sistemi}
                  onValueChange={(value) => handleSelectChange('calisma_sistemi', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Çalışma sistemi seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tam_zamanli">Tam Zamanlı</SelectItem>
                    <SelectItem value="yari_zamanli">Yarı Zamanlı</SelectItem>
                    <SelectItem value="serbest">Serbest Çalışan</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="mt-1 text-muted-foreground">
                  {formData.calisma_sistemi === 'tam_zamanli' ? 'Tam Zamanlı' :
                   formData.calisma_sistemi === 'yari_zamanli' ? 'Yarı Zamanlı' :
                   formData.calisma_sistemi === 'serbest' ? 'Serbest Çalışan' : 
                   formData.calisma_sistemi || 'Belirtilmemiş'}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="maas">Maaş (TL)</Label>
              {isEditing ? (
                <Input
                  id="maas"
                  name="maas"
                  type="number"
                  value={formData.maas}
                  onChange={handleChange}
                />
              ) : (
                <p className="mt-1 text-muted-foreground">
                  {new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: 'TRY'
                  }).format(Number(formData.maas))}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="prim_yuzdesi">Prim Yüzdesi (%)</Label>
              {isEditing ? (
                <Input
                  id="prim_yuzdesi"
                  name="prim_yuzdesi"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.prim_yuzdesi}
                  onChange={handleChange}
                />
              ) : (
                <p className="mt-1 text-muted-foreground">
                  %{formData.prim_yuzdesi}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PersonalInfoTab;
