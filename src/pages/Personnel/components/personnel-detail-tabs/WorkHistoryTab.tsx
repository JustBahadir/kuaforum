
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

interface WorkHistoryTabProps {
  personnelId: number;
}

export function WorkHistoryTab({ personnelId }: WorkHistoryTabProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [workHistoryData, setWorkHistoryData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    isyerleri: "",
    gorevpozisyon: "",
    yarismalar: "",
    belgeler: "",
    cv: ""
  });
  
  useEffect(() => {
    fetchWorkHistoryData();
  }, [personnelId]);
  
  const fetchWorkHistoryData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('staff_history')
        .select('*')
        .eq('personel_id', personnelId)
        .maybeSingle();
        
      if (error) throw error;
      
      if (data) {
        setWorkHistoryData(data);
        setFormData({
          isyerleri: data.isyerleri || "",
          gorevpozisyon: data.gorevpozisyon || "",
          yarismalar: data.yarismalar || "",
          belgeler: data.belgeler || "",
          cv: data.cv || ""
        });
      } else {
        setWorkHistoryData(null);
      }
    } catch (error) {
      console.error("İş geçmişi bilgileri alınamadı:", error);
      toast.error("İş geçmişi bilgileri yüklenirken hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (workHistoryData) {
        // Update existing record
        const { error } = await supabase
          .from('staff_history')
          .update(formData)
          .eq('personel_id', personnelId);
          
        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('staff_history')
          .insert([{ ...formData, personel_id: personnelId }]);
          
        if (error) throw error;
      }
      
      fetchWorkHistoryData();
      setIsEditing(false);
      toast.success("İş geçmişi bilgileri kaydedildi");
    } catch (error) {
      console.error("İş geçmişi bilgileri kaydedilirken hata:", error);
      toast.error("İş geçmişi bilgileri kaydedilirken hata oluştu");
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
        <h3 className="text-lg font-medium">İş Geçmişi Bilgileri</h3>
        <Button variant="outline" onClick={() => setIsEditing(true)}>
          {workHistoryData ? "Düzenle" : "Ekle"}
        </Button>
      </div>
      
      {!workHistoryData ? (
        <div className="text-center py-8 text-muted-foreground">
          Henüz iş geçmişi bilgisi eklenmemiş
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-medium mb-4">Çalıştığı İşyerleri</h4>
              <div className="whitespace-pre-line">
                {workHistoryData.isyerleri || "-"}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-medium mb-4">Görev / Pozisyon</h4>
              <div className="whitespace-pre-line">
                {workHistoryData.gorevpozisyon || "-"}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-medium mb-4">Katıldığı Yarışmalar</h4>
              <div className="whitespace-pre-line">
                {workHistoryData.yarismalar || "-"}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-medium mb-4">Belgeler / Sertifikalar</h4>
              <div className="whitespace-pre-line">
                {workHistoryData.belgeler || "-"}
              </div>
            </CardContent>
          </Card>
          
          {workHistoryData.cv && (
            <Card className="md:col-span-2">
              <CardContent className="pt-6">
                <h4 className="font-medium mb-4">CV / Özgeçmiş</h4>
                <div className="whitespace-pre-line">
                  {workHistoryData.cv}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>İş Geçmişi Bilgileri</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Çalıştığı İşyerleri</label>
              <textarea
                name="isyerleri"
                value={formData.isyerleri}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Görev / Pozisyon</label>
              <textarea
                name="gorevpozisyon"
                value={formData.gorevpozisyon}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Katıldığı Yarışmalar</label>
              <textarea
                name="yarismalar"
                value={formData.yarismalar}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Belgeler / Sertifikalar</label>
              <textarea
                name="belgeler"
                value={formData.belgeler}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">CV / Özgeçmiş</label>
              <textarea
                name="cv"
                value={formData.cv}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                rows={5}
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
