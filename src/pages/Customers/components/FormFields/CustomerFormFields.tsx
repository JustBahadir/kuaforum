
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { CustomerFormValues } from "../EditCustomerForm";
import { UseFormReturn } from "react-hook-form";

export interface CustomerFormFieldsProps {
  form: UseFormReturn<CustomerFormValues, any, undefined>;
}

export function CustomerFormFields({ form }: CustomerFormFieldsProps) {
  return (
    <div className="space-y-4">
      {/* First Name Field */}
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

      {/* Last Name Field */}
      <FormField
        control={form.control}
        name="last_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Soyisim</FormLabel>
            <FormControl>
              <Input placeholder="Soyisim" {...field} value={field.value || ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Phone Field */}
      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Telefon</FormLabel>
            <FormControl>
              <Input placeholder="Telefon" {...field} value={field.value || ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Birthdate Field */}
      <FormField
        control={form.control}
        name="birthdate"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Doğum Tarihi</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "dd MMMM yyyy", { locale: tr })
                    ) : (
                      <span>Tarih seçin</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value || undefined}
                  onSelect={field.onChange}
                  initialFocus
                  locale={tr}
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
