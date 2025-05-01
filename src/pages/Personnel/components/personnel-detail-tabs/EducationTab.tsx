
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

interface EducationTabProps {
  personnelId: number;
}

export function EducationTab({ personnelId }: EducationTabProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [educationData, setEducationData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    ortaokuldurumu: "",
    lisedurumu: "",
    liseturu: "",
    universitedurumu: "",
    universitebolum: "",
    meslekibrans: ""
  });
  
  useEffect(() => {
    fetchEducationData();
  }, [personnelId]);
  
  const fetchEducationData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('staff_education')
        .select('*')
        .eq('personel_id', personnelId)
        .maybeSingle();
        
      if (error) throw error;
      
      if (data) {
        setEducationData(data);
        setFormData({
          ortaokuldurumu: data.ortaokuldurumu || "",
          lisedurumu: data.lisedurumu || "",
          liseturu: data.liseturu || "",
          universitedurumu: data.universitedurumu || "",
          universitebolum: data.universitebolum || "",
          meslekibrans: data.meslekibrans || ""
        });
      } else {
        setEducationData(null);
      }
    } catch (error) {
      console.error("Eğitim bilgileri alınamadı:", error);
      toast.error("Eğitim bilgileri yüklenirken hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (educationData) {
        // Update existing record
        const { error } = await supabase
          .from('staff_education')
          .update(formData)
          .eq('personel_id', personnelId);
          
        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('staff_education')
          .insert([{ ...formData, personel_id: personnelId }]);
          
        if (error) throw error;
      }
      
      fetchEducationData();
      setIsEditing(false);
      toast.success("Eğitim bilgileri kaydedildi");
    } catch (error) {
      console.error("Eğitim bilgileri kaydedilirken hata:", error);
      toast.error("Eğitim bilgileri kaydedilirken hata oluştu");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Eğitim Bilgileri</h3>
        <Button variant="outline" onClick={() => setIsEditing(true)}>
          {educationData ? "Düzenle" : "Ekle"}
        </Button>
      </div>
      
      {!educationData ? (
        <div className="text-center py-8 text-muted-foreground">
          Henüz eğitim bilgisi eklenmemiş
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-medium mb-4">Orta Öğrenim</h4>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Ortaokul Durumu</p>
                <p>{educationData.ortaokuldurumu || "-"}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-medium mb-4">Lise Eğitimi</h4>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Mezuniyet Durumu</p>
                <p>{educationData.lisedurumu || "-"}</p>
              </div>
              <div className="space-y-2 mt-4">
                <p className="text-sm text-muted-foreground">Lise Türü</p>
                <p>{educationData.liseturu || "-"}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-medium mb-4">Üniversite Eğitimi</h4>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Üniversite Durumu</p>
                <p>{educationData.universitedurumu || "-"}</p>
              </div>
              <div className="space-y-2 mt-4">
                <p className="text-sm text-muted-foreground">Bölüm</p>
                <p>{educationData.universitebolum || "-"}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-medium mb-4">Mesleki Bilgiler</h4>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Mesleki Branş</p>
                <p>{educationData.meslekibrans || "-"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eğitim Bilgileri</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Ortaokul Durumu</label>
              <input
                type="text"
                name="ortaokuldurumu"
                value={formData.ortaokuldurumu}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Lise Durumu</label>
                <select
                  name="lisedurumu"
                  value={formData.lisedurumu}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Seçiniz</option>
                  <option value="Mezun">Mezun</option>
                  <option value="Terk">Terk</option>
                  <option value="Devam ediyor">Devam ediyor</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Lise Türü</label>
                <input
                  type="text"
                  name="liseturu"
                  value={formData.liseturu}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  placeholder="Örn: Anadolu Lisesi"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Üniversite Durumu</label>
                <select
                  name="universitedurumu"
                  value={formData.universitedurumu}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Seçiniz</option>
                  <option value="Mezun">Mezun</option>
                  <option value="Terk">Terk</option>
                  <option value="Devam ediyor">Devam ediyor</option>
                  <option value="Okumadı">Okumadı</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Bölüm</label>
                <input
                  type="text"
                  name="universitebolum"
                  value={formData.universitebolum}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Mesleki Branş</label>
              <input
                type="text"
                name="meslekibrans"
                value={formData.meslekibrans}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                İptal
              </Button>
              <Button type="submit">
                Kaydet
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
