import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Musteri } from "@/lib/supabase/types";
import { customerPersonalDataService } from "@/lib/supabase/services/customerPersonalDataService";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { formatPhoneNumber } from "@/utils/phoneFormatter";

interface CustomerPersonalInfoProps {
  customer: Musteri;
  onUpdate: (data: Partial<Musteri>) => void;
  editMode?: boolean;
}

// Zodiac sign calculator
const getZodiacSign = (day: number, month: number): { sign: string, description: string } => {
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

export function CustomerPersonalInfo({ customer, onUpdate, editMode = false }: CustomerPersonalInfoProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [personalData, setPersonalData] = useState({
    spouseName: "",
    spouseBirthdate: "",
    anniversaryDate: "",
    childrenNames: [] as string[],
    style: ""
  });
  const [newChildName, setNewChildName] = useState("");

  // Convert customerId to string for query key consistency
  const customerIdStr = String(customer.id);

  const { data: existingPersonalData, isLoading } = useQuery({
    queryKey: ['customer_personal_data', customerIdStr],
    queryFn: async () => {
      console.log("Fetching personal data for customer ID:", customerId);
      try {
        const data = await customerPersonalDataService.getCustomerPersonalData(customerId);
        console.log("Fetched personal data:", data);
        return data;
      } catch (error) {
        console.error("Error fetching personal data:", error);
        return null;
      }
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (existingPersonalData) {
        return await customerPersonalDataService.updateCustomerPersonalData(customerId, data);
      } else {
        // Use updateCustomerPersonalData instead of createCustomerPersonalData
        return await customerPersonalDataService.updateCustomerPersonalData(customerId, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer_personal_data', customerIdStr] });
      setIsEditing(false);
      toast.success("Müşteri kişisel bilgileri kaydedildi");
    },
    onError: (error) => {
      console.error("Error saving personal data:", error);
      toast.error("Kişisel bilgiler kaydedilemedi");
    }
  });

  // Initialize form with existing data when it's available
  useEffect(() => {
    if (existingPersonalData) {
      setPersonalData({
        spouseName: existingPersonalData.spouse_name || "",
        spouseBirthdate: existingPersonalData.spouse_birthdate 
          ? format(new Date(existingPersonalData.spouse_birthdate), "yyyy-MM-dd") 
          : "",
        anniversaryDate: existingPersonalData.anniversary_date 
          ? format(new Date(existingPersonalData.anniversary_date), "yyyy-MM-dd") 
          : "",
        childrenNames: existingPersonalData.children_names || [],
        style: existingPersonalData.custom_notes || ""
      });
    }
  }, [existingPersonalData]);

  const handleSave = () => {
    const dataToSave = {
      spouse_name: personalData.spouseName || null,
      spouse_birthdate: personalData.spouseBirthdate || null,
      anniversary_date: personalData.anniversaryDate || null,
      children_names: personalData.childrenNames,
      custom_notes: personalData.style || null
    };
    
    mutation.mutate(dataToSave);
  };

  // Only define addChildName once
  const addChildName = () => {
    if (newChildName.trim()) {
      setPersonalData(prev => ({
        ...prev,
        childrenNames: [...prev.childrenNames, newChildName.trim()]
      }));
      setNewChildName("");
    }
  };

  // Only define removeChildName once
  const removeChildName = (index: number) => {
    setPersonalData(prev => ({
      ...prev,
      childrenNames: prev.childrenNames.filter((_, i) => i !== index)
    }));
  };

  // Get zodiac sign if birthdate exists
  const getHoroscopeInfo = () => {
    if (customer.dogum_tarihi) {
      const birthDate = new Date(customer.dogum_tarihi);
      const day = birthDate.getDate();
      const month = birthDate.getMonth() + 1; // getMonth is 0-indexed
      const zodiacInfo = getZodiacSign(day, month);
      return zodiacInfo;
    }
    return null;
  };

  const horoscopeInfo = getHoroscopeInfo();

  if (isLoading) {
    return <div className="p-4 text-center">Bilgiler yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex justify-between">
          <span>İletişim Bilgileri</span>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>Düzenle</Button>
          ) : (
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>İptal</Button>
              <Button size="sm" onClick={handleSave} disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Kaydediliyor
                  </>
                ) : "Kaydet"}
              </Button>
            </div>
          )}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Telefon</Label>
            <div className="p-2 border rounded mt-1 bg-gray-50">
              {customer.telefon ? formatPhoneNumber(customer.telefon) : "Belirtilmemiş"}
            </div>
          </div>
          <div>
            <Label>Doğum Tarihi</Label>
            <div className="p-2 border rounded mt-1 bg-gray-50">
              {customer.dogum_tarihi ? format(new Date(customer.dogum_tarihi), "dd MMMM yyyy", { locale: tr }) : "Belirtilmemiş"}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Family Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">
          <span>Aile Bilgileri</span>
        </h3>

        <div className="space-y-4">
          {/* Spouse Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="spouseName">Eş İsmi</Label>
              {isEditing ? (
                <Input
                  id="spouseName"
                  value={personalData.spouseName}
                  onChange={(e) => setPersonalData(prev => ({ ...prev, spouseName: e.target.value }))}
                  placeholder="Eşinin adı"
                />
              ) : (
                <div className="p-2 border rounded mt-1 bg-gray-50">
                  {personalData.spouseName || existingPersonalData?.spouse_name || "Belirtilmemiş"}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="spouseBirthdate">Eş Doğum Tarihi</Label>
              {isEditing ? (
                <Input
                  id="spouseBirthdate"
                  type="text" 
                  placeholder="gg.aa"
                  value={personalData.spouseBirthdate ? format(new Date(personalData.spouseBirthdate), "dd.MM") : ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    let formattedDate = "";
                    
                    // If valid input like "dd.MM", create a full date with current year
                    if (/^\d{2}\.\d{2}$/.test(value)) {
                      const [day, month] = value.split('.');
                      const currentYear = new Date().getFullYear();
                      formattedDate = `${currentYear}-${month}-${day}`;
                    }
                    
                    setPersonalData(prev => ({ 
                      ...prev, 
                      spouseBirthdate: formattedDate || value 
                    }));
                  }}
                />
              ) : (
                <div className="p-2 border rounded mt-1 bg-gray-50">
                  {existingPersonalData?.spouse_birthdate 
                    ? format(new Date(existingPersonalData.spouse_birthdate), "dd MMMM", { locale: tr })
                    : "Belirtilmemiş"}
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="anniversaryDate">Evlilik Yıldönümü</Label>
            {isEditing ? (
              <Input
                id="anniversaryDate"
                type="text"
                placeholder="gg.aa"
                value={personalData.anniversaryDate ? format(new Date(personalData.anniversaryDate), "dd.MM") : ""}
                onChange={(e) => {
                  const value = e.target.value;
                  let formattedDate = "";
                  
                  // If valid input like "dd.MM", create a full date with current year
                  if (/^\d{2}\.\d{2}$/.test(value)) {
                    const [day, month] = value.split('.');
                    const currentYear = new Date().getFullYear();
                    formattedDate = `${currentYear}-${month}-${day}`;
                  }
                  
                  setPersonalData(prev => ({ 
                    ...prev, 
                    anniversaryDate: formattedDate || value 
                  }));
                }}
              />
            ) : (
              <div className="p-2 border rounded mt-1 bg-gray-50">
                {existingPersonalData?.anniversary_date 
                  ? format(new Date(existingPersonalData.anniversary_date), "dd MMMM", { locale: tr })
                  : "Belirtilmemiş"}
              </div>
            )}
          </div>

          {/* Children Names */}
          <div>
            <Label>Çocuklar</Label>
            {isEditing ? (
              <>
                <div className="flex space-x-2 mb-2">
                  <Input
                    value={newChildName}
                    onChange={(e) => setNewChildName(e.target.value)}
                    placeholder="Çocuk adı"
                    className="flex-1"
                  />
                  <Button type="button" onClick={addChildName}>Ekle</Button>
                </div>
                <div className="space-y-2">
                  {personalData.childrenNames.map((name, index) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded">
                      <span>{name}</span>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => removeChildName(index)}
                      >
                        Sil
                      </Button>
                    </div>
                  ))}
                  {personalData.childrenNames.length === 0 && (
                    <div className="text-center p-2 text-gray-500">Henüz çocuk eklenmemiş</div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-2 border rounded mt-1 bg-gray-50 min-h-[40px]">
                {(existingPersonalData?.children_names || []).length > 0 
                  ? (existingPersonalData?.children_names || []).join(", ")
                  : "Belirtilmemiş"}
              </div>
            )}
          </div>

          {/* Customer Style */}
          <div>
            <Label htmlFor="style">Tarz</Label>
            {isEditing ? (
              <Input
                id="style"
                value={personalData.style}
                onChange={(e) => setPersonalData(prev => ({ ...prev, style: e.target.value }))}
                placeholder="samimi, resmi..."
              />
            ) : (
              <div className="p-2 border rounded mt-1 bg-gray-50">
                {personalData.style || existingPersonalData?.custom_notes || "Belirtilmemiş"}
              </div>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Horoscope Information */}
      {customer.dogum_tarihi && horoscopeInfo && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Burç Bilgisi</h3>
          <div className="p-4 border rounded bg-purple-50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center text-purple-700">
                {horoscopeInfo.sign.charAt(0)}
              </div>
              <h4 className="text-lg font-medium text-purple-700">{horoscopeInfo.sign} Burcu</h4>
            </div>
            <p className="text-gray-700">{horoscopeInfo.description}</p>
          </div>
        </div>
      )}
      
      {!customer.dogum_tarihi && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Burç Bilgisi</h3>
          <div className="p-4 border rounded bg-gray-50">
            <p className="text-center text-gray-500">
              Burç bilgisi için doğum tarihi gereklidir.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
