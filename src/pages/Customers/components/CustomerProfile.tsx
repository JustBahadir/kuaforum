
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { musteriServisi } from "@/lib/supabase";
import { formatPhoneNumber } from "@/utils/phoneFormatter";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface CustomerProfileProps {
  customer: any;
}

export function CustomerProfile({ customer }: CustomerProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: customer.first_name || "",
    lastName: customer.last_name || "",
    phone: customer.phone || "",
    birthdate: customer.birthdate ? new Date(customer.birthdate).toISOString().split('T')[0] : "",
    spouseName: customer.spouse_name || "",
    spouseBirthdate: customer.spouse_birthdate ? new Date(customer.spouse_birthdate).toISOString().split('T')[0] : "",
    anniversaryDate: customer.anniversary_date ? new Date(customer.anniversary_date).toISOString().split('T')[0] : "",
    childrenNames: customer.children_names || []
  });
  const [newChildName, setNewChildName] = useState("");
  const [loading, setLoading] = useState(false);

  // Function to determine zodiac sign based on birthdate
  const getZodiacSign = (date: string): { sign: string, description: string } => {
    if (!date) return { sign: "Belirtilmemiş", description: "Doğum tarihi belirtilmediği için burç bilgisi hesaplanamıyor." };
    
    const birthDate = new Date(date);
    const day = birthDate.getDate();
    const month = birthDate.getMonth() + 1; // getMonth is 0-indexed
    
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
      return { 
        sign: "Koç", 
        description: "Enerjik, cesur ve maceracı. Genellikle atletik yapılı ve güçlüdür. Cesareti ve liderlik özellikleriyle tanınır."
      };
    } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
      return { 
        sign: "Boğa", 
        description: "Kararlı, güvenilir ve pratik. Genellikle sabırlı ve istikrarlıdır. Konfor ve lüksü sever, değişime dirençli olabilir."
      };
    } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
      return { 
        sign: "İkizler", 
        description: "Meraklı, uyarlanabilir ve hızlı düşünen. Genellikle sosyal ve iletişimcidir. Çok yönlü, değişken ve hareketlidir."
      };
    } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
      return { 
        sign: "Yengeç", 
        description: "Duygusal, koruyucu ve sezgisel. Genellikle empati yeteneği yüksektir. Aile odaklı, korumacı ve gelenekseldir."
      };
    } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
      return { 
        sign: "Aslan", 
        description: "Yaratıcı, tutkulu ve sadık. Genellikle güçlü bir kişiliğe sahiptir. Dikkat çekmeyi ve takdir görmeyi sever."
      };
    } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
      return { 
        sign: "Başak", 
        description: "Analitik, pratik ve çalışkan. Genellikle detaylara önem verir. Mükemmeliyetçi, düzenli ve titizdir."
      };
    } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
      return { 
        sign: "Terazi", 
        description: "Diplomatik, uyumlu ve adil. Genellikle sosyal ve zarif davranır. Denge, güzellik ve barışı önemser."
      };
    } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
      return { 
        sign: "Akrep", 
        description: "Tutkulu, kararlı ve sezgisel. Genellikle duygusal derinliğe sahiptir. Gizem ve yoğunluk barındırır."
      };
    } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
      return { 
        sign: "Yay", 
        description: "İyimser, maceracı ve açık fikirli. Genellikle felsefi bakış açısına sahiptir. Özgürlüğü ve seyahati sever."
      };
    } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
      return { 
        sign: "Oğlak", 
        description: "Disiplinli, sorumlu ve başarı odaklı. Genellikle kararlı ve hırslıdır. Geleneksel, pratik ve sabırlıdır."
      };
    } else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
      return { 
        sign: "Kova", 
        description: "Yaratıcı, bağımsız ve analitik. Genellikle yenilikçi fikirlere sahiptir. Orijinal, insancıl ve özgün davranır."
      };
    } else {
      return { 
        sign: "Balık", 
        description: "Sezgisel, sanatsal ve duygusal. Genellikle empatik ve hassastır. Hayal gücü kuvvetli, romantik ve yardımseverdir."
      };
    }
  };

  // Get zodiac information based on customer birthdate
  const zodiacInfo = formData.birthdate ? getZodiacSign(formData.birthdate) : null;

  useEffect(() => {
    // Initialize form data from customer data
    setFormData({
      firstName: customer.first_name || "",
      lastName: customer.last_name || "",
      phone: customer.phone || "",
      birthdate: customer.birthdate ? new Date(customer.birthdate).toISOString().split('T')[0] : "",
      spouseName: customer.spouse_name || "",
      spouseBirthdate: customer.spouse_birthdate ? new Date(customer.spouse_birthdate).toISOString().split('T')[0] : "",
      anniversaryDate: customer.anniversary_date ? new Date(customer.anniversary_date).toISOString().split('T')[0] : "",
      childrenNames: customer.children_names || []
    });
  }, [customer]);

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Update basic customer info
      await musteriServisi.guncelle(customer.id, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        birthdate: formData.birthdate || null
      });
      
      // Update customer personal data
      // This may include family information and other personal details
      if (customer.id) {
        const personalData = {
          customer_id: customer.id,
          spouse_name: formData.spouseName,
          spouse_birthdate: formData.spouseBirthdate,
          anniversary_date: formData.anniversaryDate,
          children_names: formData.childrenNames,
          // Add horoscope data based on birthdate
          horoscope: zodiacInfo?.sign,
          horoscope_description: zodiacInfo?.description
        };
        
        // Import the service here to avoid circular dependencies
        const { customerPersonalDataService } = await import('@/lib/supabase/services/customerPersonalDataService');
        await customerPersonalDataService.updateCustomerPersonalData(customer.id, personalData);
      }
      
      toast.success("Müşteri bilgileri güncellendi");
      setIsEditing(false);
    } catch (error) {
      console.error("Müşteri güncelleme hatası:", error);
      toast.error("Müşteri bilgileri güncellenemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Belirtilmemiş";
    try {
      return new Date(dateString).toLocaleDateString('tr-TR');
    } catch {
      return dateString;
    }
  };
  
  const formatDateInput = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch {
      return dateString;
    }
  };
  
  const handleAddChild = () => {
    if (newChildName.trim()) {
      setFormData(prev => ({
        ...prev,
        childrenNames: [...prev.childrenNames, newChildName.trim()]
      }));
      setNewChildName("");
    }
  };

  const handleRemoveChild = (index: number) => {
    setFormData(prev => ({
      ...prev,
      childrenNames: prev.childrenNames.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Müşteri Bilgileri</h3>
        {isEditing ? (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsEditing(false)}
              disabled={loading}
            >
              İptal
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave}
              disabled={loading}
            >
              Kaydet
            </Button>
          </div>
        ) : (
          <Button size="sm" onClick={() => setIsEditing(true)}>
            Düzenle
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2">
        <div className="grid grid-cols-3 items-center border-b py-2">
          <div className="font-medium">İsim</div>
          <div className="col-span-2">
            {isEditing ? (
              <div className="grid grid-cols-2 gap-2">
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Ad"
                />
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Soyad"
                />
              </div>
            ) : (
              `${customer.first_name || ""} ${customer.last_name || ""}`
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-3 items-center border-b py-2">
          <div className="font-medium">Telefon</div>
          <div className="col-span-2">
            {isEditing ? (
              <Input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Telefon numarası"
              />
            ) : (
              customer.phone ? formatPhoneNumber(customer.phone) : "Belirtilmemiş"
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-3 items-center border-b py-2">
          <div className="font-medium">Doğum Tarihi</div>
          <div className="col-span-2">
            {isEditing ? (
              <Input
                type="date"
                name="birthdate"
                value={formData.birthdate}
                onChange={handleChange}
              />
            ) : (
              formatDate(customer.birthdate)
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-3 items-center border-b py-2">
          <div className="font-medium">Kayıt Tarihi</div>
          <div className="col-span-2">
            {formatDate(customer.created_at)}
          </div>
        </div>

        {/* Aile Bilgileri */}
        <div className="pt-4">
          <h4 className="font-medium text-md mb-2">Aile Bilgileri</h4>
        </div>

        <div className="grid grid-cols-3 items-center border-b py-2">
          <div className="font-medium">Eş İsmi</div>
          <div className="col-span-2">
            {isEditing ? (
              <Input
                name="spouseName"
                value={formData.spouseName}
                onChange={handleChange}
                placeholder="Eş adı"
              />
            ) : (
              formData.spouseName || "Belirtilmemiş"
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-3 items-center border-b py-2">
          <div className="font-medium">Eş Doğum Tarihi</div>
          <div className="col-span-2">
            {isEditing ? (
              <Input
                type="date"
                name="spouseBirthdate"
                value={formatDateInput(formData.spouseBirthdate)}
                onChange={handleChange}
              />
            ) : (
              formData.spouseBirthdate ? formatDate(formData.spouseBirthdate) : "Belirtilmemiş"
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-3 items-center border-b py-2">
          <div className="font-medium">Evlilik Yıldönümü</div>
          <div className="col-span-2">
            {isEditing ? (
              <Input
                type="date"
                name="anniversaryDate"
                value={formatDateInput(formData.anniversaryDate)}
                onChange={handleChange}
              />
            ) : (
              formData.anniversaryDate ? formatDate(formData.anniversaryDate) : "Belirtilmemiş"
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-3 items-start border-b py-2">
          <div className="font-medium pt-2">Çocuklar</div>
          <div className="col-span-2">
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newChildName}
                    onChange={(e) => setNewChildName(e.target.value)}
                    placeholder="Çocuk adı"
                    className="flex-1"
                  />
                  <Button type="button" onClick={handleAddChild}>Ekle</Button>
                </div>
                
                <div className="space-y-2">
                  {formData.childrenNames && formData.childrenNames.length > 0 ? (
                    formData.childrenNames.map((name, index) => (
                      <div key={index} className="flex items-center justify-between border p-2 rounded-md">
                        <span>{name}</span>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleRemoveChild(index)}
                        >
                          Sil
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 text-center p-2">
                      Henüz çocuk eklenmemiş
                    </div>
                  )}
                </div>
              </div>
            ) : (
              formData.childrenNames && formData.childrenNames.length > 0 
                ? formData.childrenNames.join(", ") 
                : "Belirtilmemiş"
            )}
          </div>
        </div>

        {/* Burç Bilgisi */}
        {formData.birthdate && zodiacInfo && (
          <>
            <div className="pt-4">
              <h4 className="font-medium text-md mb-2">Burç Bilgisi</h4>
            </div>
            
            <div className="grid grid-cols-3 items-center border-b py-2">
              <div className="font-medium">Burç</div>
              <div className="col-span-2">{zodiacInfo.sign}</div>
            </div>
            
            <div className="grid grid-cols-3 items-center border-b py-2">
              <div className="font-medium">Burcun Özellikleri</div>
              <div className="col-span-2">{zodiacInfo.description}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
