
import { useState } from "react";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { personelServisi } from "@/lib/supabase";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";

interface PersonnelEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  personnel: any;
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
      toast.success("Personel başarıyla güncellendi!");
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
    updateMutation.mutate(data);
  };
  
  // Watch for changes to the working system field to conditionally show/hide the commission field
  const calisma_sistemi = form.watch("calisma_sistemi");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Personel Bilgilerini Düzenle</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="calisma_sistemi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Çalışma Sistemi</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seçiniz" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="aylik_maas">Aylık Maaş</SelectItem>
                      <SelectItem value="prim_komisyon">Prim/Komisyon</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          
            <FormField
              control={form.control}
              name="maas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maaş</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {calisma_sistemi === "prim_komisyon" && (
              <FormField
                control={form.control}
                name="prim_yuzdesi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prim Yüzdesi (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
            
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
