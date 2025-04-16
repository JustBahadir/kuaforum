
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { personelServisi } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface WorkInfoTabProps {
  personnel: any;
  onSave?: () => void;
  operations?: any[];
}

export function WorkInfoTab({ personnel, onSave, operations = [] }: WorkInfoTabProps) {
  const [loading, setLoading] = useState(false);
  const [workSystem, setWorkSystem] = useState(personnel?.calisma_sistemi || "prim_komisyon");
  
  // Calculate revenue from operations
  const totalRevenue = operations.reduce((sum, op) => sum + (op.tutar || 0), 0);
  const operationCount = operations.length;

  // Using React Hook Form for better validation
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      calisma_sistemi: personnel?.calisma_sistemi || "prim_komisyon",
      maas: personnel?.maas || 0,
      prim_yuzdesi: personnel?.prim_yuzdesi || 0
    }
  });

  // Update form values when personnel data changes
  useEffect(() => {
    if (personnel) {
      setValue("calisma_sistemi", personnel.calisma_sistemi || "prim_komisyon");
      setValue("maas", personnel.maas || 0);
      setValue("prim_yuzdesi", personnel.prim_yuzdesi || 0);
      setWorkSystem(personnel.calisma_sistemi || "prim_komisyon");
    }
  }, [personnel, setValue]);

  // Watch for changes in the form
  const watchWorkSystem = watch("calisma_sistemi");
  
  // Effect to update work system state when form value changes
  useEffect(() => {
    setWorkSystem(watchWorkSystem);
  }, [watchWorkSystem]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Submitting update with data:", data);
      console.log("Sending data to server:", data);
      return await personelServisi.guncelle(personnel.id, data);
    },
    onSuccess: () => {
      toast.success("Personel bilgileri başarıyla güncellendi");
      setLoading(false);
      if (onSave) onSave();
    },
    onError: (error) => {
      console.error("Update error:", error);
      toast.error(`Personel güncellenirken bir hata oluştu: ${error instanceof Error ? error.message : "Bilinmeyen hata"}`);
      setLoading(false);
    }
  });

  const onSubmit = (data: any) => {
    setLoading(true);
    // Make sure data has correct types
    const updateData = {
      calisma_sistemi: data.calisma_sistemi,
      maas: parseFloat(data.maas),
      prim_yuzdesi: parseFloat(data.prim_yuzdesi)
    };
    
    updateMutation.mutate(updateData);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Çalışma Sistemi</h3>
            <RadioGroup 
              className="grid grid-cols-2 gap-4 mt-2"
              value={watchWorkSystem}
              onValueChange={(value) => setValue("calisma_sistemi", value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="aylik_maas" id="maasli" />
                <Label htmlFor="maasli">Maaşlı</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="prim_komisyon" id="komisyonlu" />
                <Label htmlFor="komisyonlu">Komisyonlu</Label>
              </div>
            </RadioGroup>
          </div>

          {watchWorkSystem === "aylik_maas" ? (
            <div className="grid gap-2">
              <Label htmlFor="maas">Maaş (₺)</Label>
              <Input 
                id="maas" 
                type="number" 
                placeholder="0" 
                {...register("maas")}
                min="0"
              />
            </div>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="prim">Prim Yüzdesi (%)</Label>
              <div className="flex items-center">
                <span className="mr-2">%</span>
                <Input 
                  id="prim" 
                  type="number" 
                  placeholder="0" 
                  {...register("prim_yuzdesi")}
                  min="0"
                  max="100"
                />
              </div>
            </div>
          )}
          
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium mb-2">Özet Bilgiler</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Toplam Ciro</p>
                <p className="font-medium">{formatCurrency(totalRevenue)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">İşlem Sayısı</p>
                <p className="font-medium">{operationCount}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onSave ? onSave() : null}
              disabled={loading}
            >
              İptal
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="min-w-[100px]"
            >
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
