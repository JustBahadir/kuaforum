
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, isValid, parse } from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { musteriServisi } from "@/lib/supabase/services/musteriServisi";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { formatPhoneNumber } from "@/utils/phoneFormatter";

const phoneRegex = /^(\+90|0)?\s*(\(\d{3}\)[\s-]*|\d{3}[\s-]*)(\d{3}[\s-]*)(\d{2}[\s-]*)(\d{2})$/;

const formSchema = z.object({
  first_name: z.string().min(1, "İsim gereklidir"),
  last_name: z.string().min(1, "Soyisim gereklidir"),
  phone: z.string().refine(value => {
    if (!value) return true;
    const cleanedValue = value.replace(/\s+/g, "");
    return phoneRegex.test(cleanedValue) || cleanedValue.length === 0;
  }, "Geçerli bir telefon numarası giriniz"),
  birthdate: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface NewCustomerFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function NewCustomerForm({ onSuccess, onCancel }: NewCustomerFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [dateInputValue, setDateInputValue] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      birthdate: "",
    },
  });

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date && isValid(date)) {
      const formattedDate = format(date, "yyyy-MM-dd");
      form.setValue("birthdate", formattedDate);
      setDateInputValue(format(date, "dd.MM.yyyy"));
    } else {
      form.setValue("birthdate", "");
      setDateInputValue("");
    }
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDateInputValue(value);
    
    // Try to parse the manually entered date
    if (value) {
      try {
        // Try different common Turkish date formats
        let date: Date | null = null;
        
        if (/^\d{2}\.\d{2}\.\d{4}$/.test(value)) {
          date = parse(value, "dd.MM.yyyy", new Date());
        } else if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
          date = parse(value, "dd-MM-yyyy", new Date());
        } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
          date = parse(value, "dd/MM/yyyy", new Date());
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          date = parse(value, "yyyy-MM-dd", new Date());
        }
        
        if (date && isValid(date)) {
          setSelectedDate(date);
          form.setValue("birthdate", format(date, "yyyy-MM-dd"));
        } else {
          form.setValue("birthdate", "");
        }
      } catch (error) {
        console.error("Date parsing error:", error);
        form.setValue("birthdate", "");
      }
    } else {
      form.setValue("birthdate", "");
      setSelectedDate(undefined);
    }
  };

  const onSubmit = async (data: FormData) => {
    console.log("Form data:", data);
    setIsLoading(true);

    try {
      // Format phone number if provided
      if (data.phone) {
        data.phone = formatPhoneNumber(data.phone);
      }
      
      // Add the customer
      const result = await musteriServisi.ekle({
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        birthdate: data.birthdate || null
      });
      
      if (result) {
        toast.success("Müşteri başarıyla eklendi");
        onSuccess();
      } else {
        toast.error("Müşteri eklenirken bir hata oluştu");
      }
    } catch (error: any) {
      console.error("Müşteri eklerken hata:", error);
      
      // Özel hata mesajları
      if (error.message?.includes('infinite recursion')) {
        toast.error("Sistem hatası: Profil ilişkileri sorunu. IT ekibine başvurun.");
      } else if (error.code === '23505') {
        toast.error("Bu bilgilere sahip bir müşteri zaten var");
      } else {
        toast.error(`Müşteri eklenirken hata: ${error.message || "Bilinmeyen hata"}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>İsim</FormLabel>
                <FormControl>
                  <Input placeholder="Müşteri ismi" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Soyisim</FormLabel>
                <FormControl>
                  <Input placeholder="Müşteri soyismi" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefon Numarası</FormLabel>
              <FormControl>
                <Input 
                  placeholder="05XX XXX XX XX" 
                  {...field} 
                  onChange={(e) => {
                    // Format phone number as they type
                    const formattedValue = formatPhoneNumber(e.target.value);
                    field.onChange(formattedValue);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="birthdate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Doğum Tarihi</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input
                    placeholder="GG.AA.YYYY"
                    value={dateInputValue}
                    onChange={handleDateInputChange}
                  />
                </FormControl>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-10 p-0",
                        selectedDate && "text-primary"
                      )}
                    >
                      <CalendarIcon className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      locale={tr}
                      mode="single"
                      captionLayout="dropdown-buttons"
                      fromYear={1920}
                      toYear={new Date().getFullYear()}
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onCancel} type="button">
            İptal
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Ekleniyor..." : "Müşteri Ekle"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
