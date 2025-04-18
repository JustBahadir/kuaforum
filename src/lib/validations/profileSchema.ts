
import { z } from "zod";

export const profileSchema = z.object({
  firstName: z.string().min(2, { message: "Ad en az 2 karakter olmalıdır" }),
  lastName: z.string().min(2, { message: "Soyad en az 2 karakter olmalıdır" }),
  phone: z.string().min(10, { message: "Geçerli bir telefon numarası girin" })
    .refine(val => {
      // Remove all non-digits and check if the result is a valid Turkish mobile number
      const digitsOnly = val.replace(/\D/g, '');
      return digitsOnly.length === 11 && digitsOnly.startsWith('0');
    }, {
      message: "Geçerli bir telefon numarası girin (05XX XXX XX XX)"
    }),
  gender: z.enum(["male", "female"]).optional(),
  role: z.enum(["staff", "business_owner"], { 
    required_error: "Kayıt türü seçimi zorunludur" 
  }),
  businessName: z.string().optional(),
  businessCode: z.string().optional()
}).refine(data => {
  if (data.role === "business_owner" && !data.businessName) {
    return false;
  }
  return true;
}, {
  message: "İşletme sahibi iseniz işletme adı girmelisiniz",
  path: ["businessName"]
});
