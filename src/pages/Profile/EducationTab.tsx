
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EducationTabProps {
  educationData?: any;
  updateEducation?: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export default function EducationTab({
  educationData = {},
  updateEducation = async () => {},
  isLoading = false,
}: EducationTabProps) {
  const [formData, setFormData] = useState({
    ortaokuldurumu: educationData.ortaokuldurumu || '',
    lisedurumu: educationData.lisedurumu || '',
    liseturu: educationData.liseturu || '',
    universitedurumu: educationData.universitedurumu || '',
    universitebolum: educationData.universitebolum || '',
    meslekibrans: educationData.meslekibrans || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateEducation(formData);
  };

  const egitimDurumuOptions = [
    { value: 'mezun', label: 'Mezun' },
    { value: 'devam_ediyor', label: 'Devam Ediyor' },
    { value: 'tamamlanmadi', label: 'Tamamlanmadı' },
  ];

  const liseTuruOptions = [
    { value: 'genel_lise', label: 'Genel Lise' },
    { value: 'meslek_lisesi', label: 'Meslek Lisesi' },
    { value: 'anadolu_lisesi', label: 'Anadolu Lisesi' },
    { value: 'fen_lisesi', label: 'Fen Lisesi' },
    { value: 'diger', label: 'Diğer' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Temel Eğitim</h3>
        <Separator className="my-2" />
        
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="ortaokuldurumu">Ortaokul Durumu</Label>
            <Select 
              value={formData.ortaokuldurumu} 
              onValueChange={(value) => handleSelectChange('ortaokuldurumu', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Ortaokul eğitim durumunuzu seçin" />
              </SelectTrigger>
              <SelectContent>
                {egitimDurumuOptions.map(option => (
                  <SelectItem key={`ortaokul-${option.value}`} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lisedurumu">Lise Durumu</Label>
            <Select 
              value={formData.lisedurumu} 
              onValueChange={(value) => handleSelectChange('lisedurumu', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Lise eğitim durumunuzu seçin" />
              </SelectTrigger>
              <SelectContent>
                {egitimDurumuOptions.map(option => (
                  <SelectItem key={`lise-${option.value}`} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.lisedurumu && formData.lisedurumu !== 'tamamlanmadi' && (
            <div className="space-y-2">
              <Label htmlFor="liseturu">Lise Türü</Label>
              <Select 
                value={formData.liseturu} 
                onValueChange={(value) => handleSelectChange('liseturu', value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Lise türünü seçin" />
                </SelectTrigger>
                <SelectContent>
                  {liseTuruOptions.map(option => (
                    <SelectItem key={`liseturu-${option.value}`} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">Yüksek Öğrenim</h3>
        <Separator className="my-2" />
        
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="universitedurumu">Üniversite Durumu</Label>
            <Select 
              value={formData.universitedurumu} 
              onValueChange={(value) => handleSelectChange('universitedurumu', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Üniversite eğitim durumunuzu seçin" />
              </SelectTrigger>
              <SelectContent>
                {egitimDurumuOptions.map(option => (
                  <SelectItem key={`universite-${option.value}`} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
                <SelectItem value="yok">Üniversite Eğitimim Yok</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.universitedurumu && formData.universitedurumu !== 'yok' && formData.universitedurumu !== 'tamamlanmadi' && (
            <div className="space-y-2">
              <Label htmlFor="universitebolum">Üniversite Bölümü</Label>
              <Input
                id="universitebolum"
                name="universitebolum"
                value={formData.universitebolum}
                onChange={handleChange}
                placeholder="Üniversite bölümünüzü yazınız"
                disabled={isLoading}
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">Mesleki Bilgiler</h3>
        <Separator className="my-2" />
        
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="meslekibrans">Mesleki Branş</Label>
            <Textarea
              id="meslekibrans"
              name="meslekibrans"
              value={formData.meslekibrans}
              onChange={handleChange}
              placeholder="Uzmanlık alanlarınızı yazınız"
              disabled={isLoading}
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Kaydediliyor
            </>
          ) : (
            'Bilgileri Kaydet'
          )}
        </Button>
      </div>
    </form>
  );
}
