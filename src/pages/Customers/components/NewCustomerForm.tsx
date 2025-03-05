
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { musteriServisi } from "@/lib/supabase/services/musteriServisi";
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, subYears, parse } from "date-fns";
import { tr } from "date-fns/locale";

// Form validation schema
const formSchema = z.object({
  first_name: z.string().min(1, "İsim zorunludur"),
  last_name: z.string().min(1, "Soyisim zorunludur"),
  phone: z.string().optional(),
  birthdate: z.date().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface NewCustomerFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function NewCustomerForm({ onSuccess, onCancel }: NewCustomerFormProps) {
  const [loading, setLoading] = useState(false);
  const [dateInput, setDateInput] = useState("");
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      birthdate: null,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      // Format the phone number to remove spaces or special characters
      const formattedPhone = data.phone ? data.phone.replace(/\s+/g, "") : undefined;
      
      // Convert birthdate to ISO string or null
      const birthdate = data.birthdate ? data.birthdate.toISOString().split('T')[0] : null;
      
      await musteriServisi.ekle({
        first_name: data.first_name,
        last_name: data.last_name,
        phone: formattedPhone,
        birthdate: birthdate,
      });
      
      toast.success("Müşteri başarıyla eklendi");
      onSuccess();
    } catch (error) {
      console.error("Müşteri eklenirken hata oluştu:", error);
      toast.error("Müşteri eklenirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDateInput(inputValue);
    
    // Try to parse the date if it matches expected format
    try {
      if (inputValue.match(/^\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{4}$/)) {
        // Replace any separator with /
        const normalizedDate = inputValue.replace(/[.\-]/g, '/');
        const parsedDate = parse(normalizedDate, 'dd/MM/yyyy', new Date());
        
        if (!isNaN(parsedDate.getTime())) {
          form.setValue('birthdate', parsedDate);
        }
      }
    } catch (error) {
      // Invalid date format, just continue with the input
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>İsim</FormLabel>
              <FormControl>
                <Input placeholder="İsim" {...field} />
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
                <Input placeholder="Soyisim" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
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
                    // Format phone number while typing
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length > 0) {
                      if (value.length <= 4) {
                        value = value;
                      } else if (value.length <= 7) {
                        value = `${value.slice(0, 4)} ${value.slice(4)}`;
                      } else if (value.length <= 9) {
                        value = `${value.slice(0, 4)} ${value.slice(4, 7)} ${value.slice(7)}`;
                      } else {
                        value = `${value.slice(0, 4)} ${value.slice(4, 7)} ${value.slice(7, 9)} ${value.slice(9, 11)}`;
                      }
                    }
                    field.onChange(value);
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
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal flex justify-between items-center",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd.MM.yyyy", { locale: tr })
                        ) : (
                          <span>Doğum tarihi seçin</span>
                        )}
                        <CalendarIcon className="h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={(date) => {
                        field.onChange(date);
                        if (date) {
                          setDateInput(format(date, "dd.MM.yyyy", { locale: tr }));
                        } else {
                          setDateInput("");
                        }
                      }}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                      captionLayout="dropdown-buttons"
                      fromYear={1920}
                      toYear={new Date().getFullYear()}
                      defaultMonth={field.value || subYears(new Date(), 30)}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                
                <FormControl>
                  <Input
                    placeholder="GG.AA.YYYY"
                    value={dateInput}
                    onChange={handleManualDateInput}
                    onBlur={() => {
                      if (dateInput && !field.value) {
                        try {
                          // Try different formats
                          let parsedDate;
                          if (dateInput.includes('.')) {
                            parsedDate = parse(dateInput, 'dd.MM.yyyy', new Date());
                          } else if (dateInput.includes('/')) {
                            parsedDate = parse(dateInput, 'dd/MM/yyyy', new Date());
                          } else if (dateInput.includes('-')) {
                            parsedDate = parse(dateInput, 'dd-MM-yyyy', new Date());
                          }
                          
                          if (parsedDate && !isNaN(parsedDate.getTime())) {
                            field.onChange(parsedDate);
                          } else {
                            setDateInput("");
                            toast.error("Geçersiz tarih formatı. Lütfen GG.AA.YYYY formatında girin.");
                          }
                        } catch (error) {
                          setDateInput("");
                          toast.error("Geçersiz tarih formatı. Lütfen GG.AA.YYYY formatında girin.");
                        }
                      }
                    }}
                  />
                </FormControl>
              </div>
              <FormMessage />
              <p className="text-xs text-muted-foreground">
                Tarihi "GG.AA.YYYY" formatında girebilirsiniz (örn: 15.04.1990)
              </p>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            İptal
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
