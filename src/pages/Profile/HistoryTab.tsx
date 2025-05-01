
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface HistoryTabProps {
  historyData?: any;
  updateHistory?: (data: any) => Promise<void>;
  isLoading?: boolean;
  uploadCv?: (file: File) => Promise<void>;
}

export default function HistoryTab({
  historyData = {},
  updateHistory = async () => {},
  isLoading = false,
  uploadCv = async () => {},
}: HistoryTabProps) {
  const [formData, setFormData] = useState({
    isyerleri: historyData.isyerleri || '',
    gorevpozisyon: historyData.gorevpozisyon || '',
    belgeler: historyData.belgeler || '',
    yarismalar: historyData.yarismalar || '',
    cv: historyData.cv || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateHistory(formData);
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadCv(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">İş Tecrübesi</h3>
        <Separator className="my-2" />
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="isyerleri">Çalıştığınız İşyerleri</Label>
            <Textarea
              id="isyerleri"
              name="isyerleri"
              value={formData.isyerleri}
              onChange={handleChange}
              placeholder="Çalıştığınız işyerlerini yazınız"
              disabled={isLoading}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gorevpozisyon">Görev ve Pozisyonlar</Label>
            <Textarea
              id="gorevpozisyon"
              name="gorevpozisyon"
              value={formData.gorevpozisyon}
              onChange={handleChange}
              placeholder="Görev ve pozisyonlarınızı yazınız"
              disabled={isLoading}
              rows={3}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">Eğitim ve Beceriler</h3>
        <Separator className="my-2" />
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="belgeler">Sertifikalar ve Belgeler</Label>
            <Textarea
              id="belgeler"
              name="belgeler"
              value={formData.belgeler}
              onChange={handleChange}
              placeholder="Sahip olduğunuz sertifika ve belgeleri yazınız"
              disabled={isLoading}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="yarismalar">Katıldığınız Yarışmalar</Label>
            <Textarea
              id="yarismalar"
              name="yarismalar"
              value={formData.yarismalar}
              onChange={handleChange}
              placeholder="Katıldığınız yarışmaları yazınız"
              disabled={isLoading}
              rows={3}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">CV</h3>
        <Separator className="my-2" />
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cv">CV Bağlantısı</Label>
            <div className="flex gap-3">
              <Input
                id="cv"
                name="cv"
                value={formData.cv}
                onChange={handleChange}
                placeholder="CV bağlantınızı yapıştırın"
                disabled={isLoading}
                className="flex-1"
              />
              <div>
                <label htmlFor="cv-upload" className="cursor-pointer">
                  <Button variant="outline" disabled={isLoading} type="button" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    <span>Yükle</span>
                  </Button>
                  <input
                    id="cv-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={handleCvUpload}
                    disabled={isLoading}
                  />
                </label>
              </div>
            </div>
            {formData.cv && (
              <p className="text-sm text-blue-600 hover:underline">
                <a href={formData.cv} target="_blank" rel="noopener noreferrer">
                  CV'nizi görüntülemek için tıklayın
                </a>
              </p>
            )}
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
