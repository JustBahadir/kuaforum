
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface EducationTabProps {
  personnel: any;
  onRefresh: () => void;
}

export function EducationTab({ personnel, onRefresh }: EducationTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    ortaokuldurumu: personnel.education?.ortaokuldurumu || '',
    lisedurumu: personnel.education?.lisedurumu || '',
    liseturu: personnel.education?.liseturu || '',
    universitedurumu: personnel.education?.universitedurumu || '',
    universitebolum: personnel.education?.universitebolum || '',
    meslekibrans: personnel.education?.meslekibrans || '',
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSave = async () => {
    try {
      // Logic for saving education data would go here
      toast.success('Eğitim bilgileri kaydedildi');
      setIsEditing(false);
      onRefresh();
    } catch (error) {
      toast.error('Bir hata oluştu');
      console.error('Error saving education data:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Eğitim Bilgileri</h2>
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
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Temel Eğitim</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="ortaokuldurumu">Ortaokul Durumu</Label>
                {isEditing ? (
                  <Input
                    id="ortaokuldurumu"
                    name="ortaokuldurumu"
                    value={formData.ortaokuldurumu}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="mt-1 text-muted-foreground">
                    {formData.ortaokuldurumu || 'Belirtilmemiş'}
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lisedurumu">Lise Durumu</Label>
                  {isEditing ? (
                    <Input
                      id="lisedurumu"
                      name="lisedurumu"
                      value={formData.lisedurumu}
                      onChange={handleChange}
                    />
                  ) : (
                    <p className="mt-1 text-muted-foreground">
                      {formData.lisedurumu || 'Belirtilmemiş'}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="liseturu">Lise Türü</Label>
                  {isEditing ? (
                    <Input
                      id="liseturu"
                      name="liseturu"
                      value={formData.liseturu}
                      onChange={handleChange}
                    />
                  ) : (
                    <p className="mt-1 text-muted-foreground">
                      {formData.liseturu || 'Belirtilmemiş'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Yüksek Öğrenim</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="universitedurumu">Üniversite Durumu</Label>
                {isEditing ? (
                  <Input
                    id="universitedurumu"
                    name="universitedurumu"
                    value={formData.universitedurumu}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="mt-1 text-muted-foreground">
                    {formData.universitedurumu || 'Belirtilmemiş'}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="universitebolum">Üniversite Bölümü</Label>
                {isEditing ? (
                  <Input
                    id="universitebolum"
                    name="universitebolum"
                    value={formData.universitebolum}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="mt-1 text-muted-foreground">
                    {formData.universitebolum || 'Belirtilmemiş'}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mesleki Bilgiler</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="meslekibrans">Mesleki Branş</Label>
              {isEditing ? (
                <Textarea
                  id="meslekibrans"
                  name="meslekibrans"
                  value={formData.meslekibrans}
                  onChange={handleChange}
                  rows={4}
                />
              ) : (
                <p className="mt-1 text-muted-foreground">
                  {formData.meslekibrans || 'Belirtilmemiş'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default EducationTab;
