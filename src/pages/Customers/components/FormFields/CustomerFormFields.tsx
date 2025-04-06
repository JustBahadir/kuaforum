
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export interface CustomerFormFieldsProps {
  form?: UseFormReturn<any>;
  firstName?: string;
  lastName?: string;
  onFirstNameChange?: (value: string) => void;
  onLastNameChange?: (value: string) => void;
  errors?: Record<string, string>;
}

export function CustomerFormFields({ 
  form, 
  firstName, 
  lastName, 
  onFirstNameChange, 
  onLastNameChange, 
  errors 
}: CustomerFormFieldsProps) {
  // If form is provided, use react-hook-form
  if (form) {
    return (
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>İsim*</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Müşteri ismi" />
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
                <Input {...field} placeholder="Müşteri soyismi" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    );
  }
  
  // If individual props are provided, use controlled inputs
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium">İsim*</label>
        <Input
          id="firstName"
          value={firstName || ''}
          onChange={(e) => onFirstNameChange?.(e.target.value)}
          placeholder="Müşteri ismi"
          className={errors?.firstName ? "border-red-500" : ""}
        />
        {errors?.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
      </div>
      
      <div>
        <label htmlFor="lastName" className="block text-sm font-medium">Soyisim</label>
        <Input
          id="lastName"
          value={lastName || ''}
          onChange={(e) => onLastNameChange?.(e.target.value)}
          placeholder="Müşteri soyismi"
        />
      </div>
    </div>
  );
}
