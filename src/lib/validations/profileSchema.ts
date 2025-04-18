
import { z } from "zod";

export const profileSchema = z.object({
  firstName: z.string().min(2, { message: "Ad en az 2 karakter olmalıdır" }),
  lastName: z.string().min(2, { message: "Soyad en az 2 karakter olmalıdır" }),
  phone: z.string().min(10, { message: "Geçerli bir telefon numarası girin" })
    .refine(val => /^0[0-9]{10}$/.test(val.replace(/\D/g, '')), {
      message: "Geçerli bir telefon numarası girin"
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
