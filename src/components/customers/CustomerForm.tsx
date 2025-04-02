
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { musteriServisi } from "@/lib/supabase";
import { Musteri } from "@/lib/supabase/types";
import { toast } from "sonner";

// Form validation schema
const customerFormSchema = z.object({
  first_name: z.string().min(1, { message: "İsim alanı zorunludur" }),
  last_name: z.string().optional(),
  phone: z.string().optional(),
  birthdate: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

interface CustomerFormProps {
  initialData: Musteri;
  onCancel: () => void;
  onSuccess: () => void;
}

export function CustomerForm({ initialData, onCancel, onSuccess }: CustomerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convert date to proper format for input
  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split('T')[0];
  };

  const { register, handleSubmit, formState: { errors } } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      first_name: initialData.first_name || "",
      last_name: initialData.last_name || "",
      phone: initialData.phone || "",
      birthdate: initialData.birthdate ? formatDateForInput(initialData.birthdate) : "",
    },
  });

  const onSubmit = async (data: CustomerFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Update customer data
      await musteriServisi.guncelle(initialData.id, {
        ...initialData,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        birthdate: data.birthdate || null,
      });
      
      onSuccess();
      toast.success("Müşteri bilgileri güncellendi");
    } catch (error) {
      console.error("Müşteri güncellenirken hata:", error);
      toast.error("Müşteri güncellenirken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="first_name">İsim *</Label>
        <Input 
          id="first_name"
          {...register("first_name")} 
          placeholder="İsim"
        />
        {errors.first_name && (
          <p className="text-sm text-red-500">{errors.first_name.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="last_name">Soyisim</Label>
        <Input 
          id="last_name"
          {...register("last_name")} 
          placeholder="Soyisim"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Telefon</Label>
        <Input 
          id="phone"
          {...register("phone")} 
          placeholder="Telefon numarası"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="birthdate">Doğum Tarihi</Label>
        <Input 
          id="birthdate"
          type="date"
          {...register("birthdate")} 
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
        >
          İptal
        </Button>
        <Button 
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </div>
    </form>
  );
}
