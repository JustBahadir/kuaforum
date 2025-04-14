
import { useState } from "react";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { personelServisi } from "@/lib/supabase";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormDescription 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Personel } from "@/lib/supabase/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PersonnelEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  personnel: Personel;
}

export function PersonnelEditDialog({
  isOpen,
  onOpenChange,
  personnel
}: PersonnelEditDialogProps) {
  const queryClient = useQueryClient();
  
  const form = useForm({
    defaultValues: {
      calisma_sistemi: personnel?.calisma_sistemi || "aylik_maas",
      maas: personnel?.maas || 0,
      prim_yuzdesi: personnel?.prim_yuzdesi || 0,
    }
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
      onOpenChange(false);
    },
    onError: (error) => {
      console.error(error);
      toast.error("Personel güncellenirken bir hata oluştu.");
    },
  });

  const onSubmit = (data: any) => {
    // Prepare the data for submission
    const updateData = {
      calisma_sistemi: data.calisma_sistemi,
    };
    
    // Add the appropriate salary or commission field based on working system
    if (data.calisma_sistemi === "prim_komisyon") {
      Object.assign(updateData, {
        prim_yuzdesi: data.prim_yuzdesi,
        maas: 0 // Set salary to 0 for commission-based workers
      });
    } else {
      Object.assign(updateData, {
        maas: data.maas,
        prim_yuzdesi: 0 // Set commission to 0 for salaried workers
      });
    }
    
    updateMutation.mutate(updateData);
  };
  
  // Watch for changes to the working system field to conditionally show/hide fields
  const calisma_sistemi = form.watch("calisma_sistemi");
  
  // Check if the working system is a salary type
  const isSalaryType = ["aylik_maas", "haftalik_maas", "gunluk_maas"].includes(calisma_sistemi);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Çalışma Bilgilerini Düzenle</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="calisma_sistemi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Çalışma Sistemi</FormLabel>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-2 gap-4"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="aylik_maas" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Aylık Maaşlı
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="haftalik_maas" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Haftalık Maaşlı
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="gunluk_maas" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Günlük Maaşlı
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="prim_komisyon" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Yüzdelik Çalışan
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormItem>
              )}
            />
          
            <FormField
              control={form.control}
              name="maas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maaş Tutarı</FormLabel>
                  <FormDescription>
                    {isSalaryType 
                      ? `${calisma_sistemi === "aylik_maas" ? "Aylık" : calisma_sistemi === "haftalik_maas" ? "Haftalık" : "Günlük"} maaş tutarını giriniz.`
                      : "Maaşlı çalışanlar için geçerlidir."
                    }
                  </FormDescription>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      disabled={!isSalaryType}
                      value={isSalaryType ? (field.value || '') : ''}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="prim_yuzdesi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prim Oranı (%)</FormLabel>
                  <FormDescription>
                    {!isSalaryType 
                      ? "Personelin hizmet başına alacağı yüzdelik prim oranını giriniz."
                      : "Yüzdelik çalışanlar için geçerlidir."
                    }
                  </FormDescription>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      {...field}
                      disabled={isSalaryType}
                      value={!isSalaryType ? (field.value || '') : ''}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                İptal
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
