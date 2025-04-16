
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { personelServisi } from "@/lib/supabase";

interface WorkInfoTabProps {
  personnel: any;
  onUpdate?: () => void;
}

export function WorkInfoTab({ personnel, onUpdate }: WorkInfoTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workType, setWorkType] = useState(personnel.calisma_sistemi || 'prim_komisyon');
  const [salaryType, setSalaryType] = useState(
    personnel.calisma_sistemi === 'aylik_maas' ? 'aylik' : 
    personnel.calisma_sistemi === 'haftalik_maas' ? 'haftalik' : 'gunluk'
  );
  const [salary, setSalary] = useState(personnel.maas || 0);
  const [commission, setCommission] = useState(personnel.prim_yuzdesi || 0);
  
  // Calculate summary data
  const totalRevenue = personnel.operations?.reduce((sum: number, op: any) => sum + (Number(op.tutar) || 0), 0) || 0;
  const totalOperations = personnel.operations?.length || 0;
  
  const handleSave = async () => {
    if (workType === 'maasli' && !salaryType) {
      toast.error("Lütfen maaş türünü seçin.");
      return;
    }
    
    // Validate salary or commission
    if (workType === 'maasli' && !salary) {
      toast.error("Lütfen maaş tutarını girin.");
      return;
    }
    
    if (workType === 'prim_komisyon' && !commission) {
      toast.error("Lütfen komisyon yüzdesini girin.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Determine the full work type
      let fullWorkType = workType;
      if (workType === 'maasli') {
        fullWorkType = `${salaryType}_maas`;
      }
      
      await personelServisi.guncelle(personnel.id, {
        calisma_sistemi: fullWorkType,
        maas: Number(salary),
        prim_yuzdesi: Number(commission)
      });
      
      toast.success("Çalışma bilgileri güncellendi");
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      toast.error("Çalışma bilgileri güncellenirken bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    setWorkType(personnel.calisma_sistemi || 'prim_komisyon');
    setSalary(personnel.maas || 0);
    setCommission(personnel.prim_yuzdesi || 0);
    setSalaryType(
      personnel.calisma_sistemi === 'aylik_maas' ? 'aylik' : 
      personnel.calisma_sistemi === 'haftalik_maas' ? 'haftalik' : 'gunluk'
    );
    setIsEditing(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {!isEditing ? (
          <>
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Çalışma Sistemi</div>
              <div>
                {personnel.calisma_sistemi === 'prim_komisyon' 
                  ? `Yüzdelik Çalışan (%${personnel.prim_yuzdesi})` 
                  : personnel.calisma_sistemi === 'aylik_maas' 
                    ? "Aylık Maaşlı" 
                    : personnel.calisma_sistemi === 'haftalik_maas' 
                      ? "Haftalık Maaşlı"
                      : "Günlük Maaşlı"}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Maaş/Komisyon</div>
              <div>
                {personnel.calisma_sistemi === 'prim_komisyon'
                  ? `%${personnel.prim_yuzdesi} Komisyon`
                  : formatCurrency(personnel.maas || 0)}
              </div>
            </div>
          </>
        ) : (
          <div className="col-span-2 space-y-4">
            <RadioGroup value={workType} onValueChange={setWorkType} className="flex flex-col space-y-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="prim_komisyon" id="komisyonlu" />
                <Label htmlFor="komisyonlu">Komisyonlu Çalışan</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="maasli" id="maasli" />
                <Label htmlFor="maasli">Maaşlı Çalışan</Label>
              </div>
            </RadioGroup>
            
            {workType === 'prim_komisyon' && (
              <div className="space-y-2">
                <Label htmlFor="commission">Komisyon Yüzdesi</Label>
                <div className="flex items-center">
                  <Input
                    id="commission"
                    type="number"
                    min="0"
                    max="100"
                    value={commission}
                    onChange={(e) => setCommission(Number(e.target.value))}
                    className="w-24"
                  />
                  <span className="ml-2">%</span>
                </div>
              </div>
            )}
            
            {workType === 'maasli' && (
              <>
                <RadioGroup value={salaryType} onValueChange={setSalaryType} className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="gunluk" id="gunluk" />
                    <Label htmlFor="gunluk">Günlük</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="haftalik" id="haftalik" />
                    <Label htmlFor="haftalik">Haftalık</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="aylik" id="aylik" />
                    <Label htmlFor="aylik">Aylık</Label>
                  </div>
                </RadioGroup>
                
                <div className="space-y-2">
                  <Label htmlFor="salary">Maaş Tutarı</Label>
                  <div className="flex items-center">
                    <Input
                      id="salary"
                      type="number"
                      min="0"
                      value={salary}
                      onChange={(e) => setSalary(Number(e.target.value))}
                    />
                    <span className="ml-2">₺</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      
      <div className="bg-muted/30 rounded-md p-4">
        <h3 className="text-sm font-medium mb-3">Özet Bilgiler</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Toplam Ciro</div>
            <div className="font-medium">{formatCurrency(totalRevenue)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">İşlem Sayısı</div>
            <div className="font-medium">{totalOperations}</div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        {isEditing ? (
          <div className="space-x-2">
            <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              İptal
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        ) : (
          <Button onClick={() => setIsEditing(true)}>
            Düzenle
          </Button>
        )}
      </div>
    </div>
  );
}
