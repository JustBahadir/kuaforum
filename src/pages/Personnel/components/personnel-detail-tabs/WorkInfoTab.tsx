
import React, { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { personelServisi } from "@/lib/supabase";
import { Check, X } from "lucide-react";

interface WorkInfoTabProps {
  personnel: any;
  onEdit?: () => void;
}

export function WorkInfoTab({ personnel, onEdit }: WorkInfoTabProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    calisma_sistemi: personnel.calisma_sistemi || "aylik_maas",
    maas: personnel.maas || 0,
    prim_yuzdesi: personnel.prim_yuzdesi || 0,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return await personelServisi.guncelle(personnel.id, data);
    },
    onSuccess: () => {
      toast.success("Personel bilgileri başarıyla güncellendi!");
      queryClient.invalidateQueries({ queryKey: ["personeller"] });
      queryClient.invalidateQueries({ queryKey: ["personel-list"] });
      queryClient.invalidateQueries({ queryKey: ["personel"] });
      setIsEditing(false);
    },
    onError: (error) => {
      console.error(error);
      toast.error("Personel güncellenirken bir hata oluştu.");
    },
  });

  const getWorkingSystemLabel = (system: string) => {
    switch (system) {
      case "aylik_maas":
        return "Aylık Maaş";
      case "haftalik_maas":
        return "Haftalık Maaş";
      case "gunluk_maas":
        return "Günlük Maaş";
      case "prim_komisyon":
        return "Yüzdelik Çalışma";
      default:
        return system;
    }
  };

  const handleSave = () => {
    // Prepare the data for submission
    const updateData = {
      calisma_sistemi: formData.calisma_sistemi,
    };
    
    // Add the appropriate salary or commission field based on working system
    if (formData.calisma_sistemi === "prim_komisyon") {
      Object.assign(updateData, {
        prim_yuzdesi: formData.prim_yuzdesi,
        maas: 0 // Set salary to 0 for commission-based workers
      });
    } else {
      Object.assign(updateData, {
        maas: formData.maas,
        prim_yuzdesi: 0 // Set commission to 0 for salaried workers
      });
    }
    
    updateMutation.mutate(updateData);
  };

  const handleCancel = () => {
    setFormData({
      calisma_sistemi: personnel.calisma_sistemi || "aylik_maas",
      maas: personnel.maas || 0,
      prim_yuzdesi: personnel.prim_yuzdesi || 0,
    });
    setIsEditing(false);
  };

  // Check if the working system is a salary type
  const isSalaryType = ["aylik_maas", "haftalik_maas", "gunluk_maas"].includes(formData.calisma_sistemi);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Çalışma Sistemi</h3>
          {!isEditing ? (
            <Badge variant={personnel.calisma_sistemi === "prim_komisyon" ? "secondary" : "outline"}>
              {getWorkingSystemLabel(personnel.calisma_sistemi)}
            </Badge>
          ) : (
            <div className="space-y-3 mt-2">
              <RadioGroup
                value={formData.calisma_sistemi}
                onValueChange={(value) => setFormData(prev => ({ ...prev, calisma_sistemi: value }))}
                className="grid grid-cols-1 gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="prim_komisyon" id="prim_komisyon" />
                  <Label htmlFor="prim_komisyon">Komisyonlu</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="aylik_maas" id="aylik_maas" />
                  <Label htmlFor="aylik_maas">Maaşlı</Label>
                </div>
              </RadioGroup>
              
              {formData.calisma_sistemi !== "prim_komisyon" && (
                <RadioGroup
                  value={formData.calisma_sistemi}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, calisma_sistemi: value }))}
                  className="grid grid-cols-3 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="aylik_maas" id="aylik_maas_option" />
                    <Label htmlFor="aylik_maas_option">Aylık</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="haftalik_maas" id="haftalik_maas" />
                    <Label htmlFor="haftalik_maas">Haftalık</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="gunluk_maas" id="gunluk_maas" />
                    <Label htmlFor="gunluk_maas">Günlük</Label>
                  </div>
                </RadioGroup>
              )}
            </div>
          )}
        </div>

        {!isEditing ? (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              {personnel.calisma_sistemi === "prim_komisyon" ? "Prim Yüzdesi" : "Maaş Tutarı"}
            </h3>
            <div className="font-semibold">
              {personnel.calisma_sistemi === "prim_komisyon" 
                ? `%${personnel.prim_yuzdesi}` 
                : formatCurrency(personnel.maas)}
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              {formData.calisma_sistemi === "prim_komisyon" ? "Prim Yüzdesi" : "Maaş Tutarı"}
            </h3>
            {formData.calisma_sistemi === "prim_komisyon" ? (
              <div className="flex items-center">
                <Input 
                  type="number"
                  min="0"
                  max="100"
                  value={formData.prim_yuzdesi}
                  onChange={(e) => setFormData(prev => ({ ...prev, prim_yuzdesi: Number(e.target.value) }))}
                  className="w-24"
                />
                <span className="ml-2">%</span>
              </div>
            ) : (
              <Input 
                type="number"
                min="0"
                value={formData.maas}
                onChange={(e) => setFormData(prev => ({ ...prev, maas: Number(e.target.value) }))}
                className="w-40"
              />
            )}
          </div>
        )}
      </div>

      <div className="bg-muted p-4 rounded-md">
        <h3 className="font-medium mb-3">Özet Bilgiler</h3>
        <table className="w-full">
          <tbody>
            <tr className="border-b">
              <td className="py-2 text-sm text-muted-foreground">Toplam Prim</td>
              <td className="py-2 text-right font-medium">{formatCurrency(personnel.toplam_prim || 0)}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 text-sm text-muted-foreground">Toplam Ciro</td>
              <td className="py-2 text-right font-medium">{formatCurrency(personnel.toplam_ciro || 0)}</td>
            </tr>
            <tr>
              <td className="py-2 text-sm text-muted-foreground">İşlem Sayısı</td>
              <td className="py-2 text-right font-medium">{personnel.islem_sayisi || 0}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {isEditing && (
        <div className="flex justify-end space-x-3">
          <Button variant="outline" size="sm" onClick={handleCancel} className="gap-1">
            <X className="h-4 w-4" />
            İptal
          </Button>
          <Button 
            size="sm" 
            onClick={handleSave} 
            disabled={updateMutation.isPending} 
            className="gap-1"
          >
            <Check className="h-4 w-4" />
            {updateMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      )}

      {!isEditing && (
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsEditing(true)}
            className="gap-1"
          >
            Düzenle
          </Button>
        </div>
      )}
    </div>
  );
}
