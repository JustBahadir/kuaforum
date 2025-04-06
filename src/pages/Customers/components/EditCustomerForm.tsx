
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { musteriServisi } from "@/lib/supabase";
import { Musteri } from "@/lib/supabase/types";
import { CustomerFormFields } from "./FormFields/CustomerFormFields";
import { CustomerFormActions } from "./FormFields/CustomerFormActions";
import { Form } from "@/components/ui/form";

// Form schema for customer data
const customerFormSchema = z.object({
  first_name: z.string().min(1, { message: "İsim alanı zorunludur" }),
  last_name: z.string().optional(),
  phone: z.string().optional(),
  birthdate: z.date().optional().nullable(),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;

interface EditCustomerFormProps {
  customer: Musteri;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  dukkanId?: number;
}

export function EditCustomerForm({
  customer,
  isOpen,
  onClose,
  onSuccess,
  dukkanId,
}: EditCustomerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      first_name: customer.first_name || "",
      last_name: customer.last_name || "",
      phone: customer.phone || "",
      birthdate: customer.birthdate ? new Date(customer.birthdate) : null,
    },
  });

  // Update customer mutation
  const updateCustomer = useMutation({
    mutationFn: async (data: CustomerFormValues) => {
      if (!customer.id) {
        throw new Error("Müşteri ID bulunamadı");
      }

      // Format the data for the API
      const customerData = {
        ...data,
        id: customer.id,
        dukkan_id: dukkanId || customer.dukkan_id,
      };

      // Fix: Pass both arguments to the guncelle function
      return musteriServisi.guncelle(customerData, customer.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["musteriler"] });
      toast.success("Müşteri başarıyla güncellendi");
      onSuccess();
      onClose();
    },
    onError: (error) => {
      console.error("Error updating customer:", error);
      toast.error("Müşteri güncellenirken bir hata oluştu");
    },
  });

  const onSubmit = async (data: CustomerFormValues) => {
    setIsSubmitting(true);
    try {
      await updateCustomer.mutateAsync(data);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <CustomerFormFields form={form} />
        
        <CustomerFormActions 
          isSubmitting={isSubmitting} 
          onCancel={onClose} 
          submitLabel="Güncelle"
        />
      </form>
    </Form>
  );
}
