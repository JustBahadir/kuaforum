
export const isValidEmail = (email: string) => {
  return /\S+@\S+\.\S+/.test(email);
};

export const validateStaffForm = (formData: {
  name: string;
  phone: string;
  email: string;
  address: string;
  birthDate: string;
  personnelNumber: string;
  system: string;
  shopCode: string;
}) => {
  const errors: {[key: string]: string} = {};
  
  if (!formData.name) errors.name = "Ad soyad zorunludur";
  if (!formData.phone) errors.phone = "Telefon zorunludur";
  if (!formData.email) errors.email = "E-posta zorunludur";
  if (formData.email && !isValidEmail(formData.email)) errors.email = "Geçerli bir e-posta adresi giriniz";
  if (!formData.address) errors.address = "Adres zorunludur";
  if (!formData.birthDate) errors.birthDate = "Doğum tarihi zorunludur";
  if (!formData.personnelNumber) errors.personnelNumber = "Personel no zorunludur";
  if (!formData.system) errors.system = "Çalışma sistemi zorunludur";
  if (!formData.shopCode) errors.shopCode = "İşletme kodu zorunludur";
  
  return { errors, isValid: Object.keys(errors).length === 0 };
};
