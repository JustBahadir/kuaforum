
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface CustomerProfileProps {
  customer: any;
}

export function CustomerProfile({ customer }: CustomerProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [note, setNote] = useState("");
  const [customerData, setCustomerData] = useState({
    first_name: customer.first_name || "",
    last_name: customer.last_name || "",
    phone: customer.phone || "",
    birthdate: customer.birthdate || ""
  });

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
  const zodiacInfo = customer.birthdate ? getZodiacSign(customer.birthdate) : null;

  const handleSave = () => {
    // Here you would implement the API call to save customer data
    toast.success("Müşteri bilgileri güncellendi");
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerData({
      ...customerData,
      [name]: value
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Belirtilmemiş";
    try {
      return new Date(dateString).toLocaleDateString('tr-TR');
    } catch {
      return dateString;
    }
  };
  
  // Get family information from the detailed info component
  const { spouse_name, spouse_birthdate, anniversary_date, children_names } = customer;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Müşteri Bilgileri</h3>
        {isEditing ? (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
              İptal
            </Button>
            <Button size="sm" onClick={handleSave}>
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
              <input
                type="text"
                name="first_name"
                value={customerData.first_name}
                onChange={handleChange}
                className="w-full border p-1 rounded"
              />
            ) : (
              `${customer.first_name || ""} ${customer.last_name || ""}`
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-3 items-center border-b py-2">
          <div className="font-medium">Telefon</div>
          <div className="col-span-2">
            {isEditing ? (
              <input
                type="text"
                name="phone"
                value={customerData.phone}
                onChange={handleChange}
                className="w-full border p-1 rounded"
              />
            ) : (
              customer.phone || "Belirtilmemiş"
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-3 items-center border-b py-2">
          <div className="font-medium">Doğum Tarihi</div>
          <div className="col-span-2">
            {isEditing ? (
              <input
                type="date"
                name="birthdate"
                value={customerData.birthdate}
                onChange={handleChange}
                className="w-full border p-1 rounded"
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

        {/* Aile Bilgileri - Moved from detailed info */}
        <div className="pt-4">
          <h4 className="font-medium text-md mb-2">Aile Bilgileri</h4>
        </div>

        <div className="grid grid-cols-3 items-center border-b py-2">
          <div className="font-medium">Eş İsmi</div>
          <div className="col-span-2">
            {spouse_name || "Belirtilmemiş"}
          </div>
        </div>
        
        <div className="grid grid-cols-3 items-center border-b py-2">
          <div className="font-medium">Eş Doğum Tarihi</div>
          <div className="col-span-2">
            {spouse_birthdate ? formatDate(spouse_birthdate) : "Belirtilmemiş"}
          </div>
        </div>
        
        <div className="grid grid-cols-3 items-center border-b py-2">
          <div className="font-medium">Evlilik Yıldönümü</div>
          <div className="col-span-2">
            {anniversary_date ? formatDate(anniversary_date) : "Belirtilmemiş"}
          </div>
        </div>
        
        <div className="grid grid-cols-3 items-center border-b py-2">
          <div className="font-medium">Çocuklar</div>
          <div className="col-span-2">
            {children_names && children_names.length > 0 
              ? children_names.join(", ") 
              : "Belirtilmemiş"}
          </div>
        </div>

        {/* Burç Bilgisi - Moved from detailed info */}
        {customer.birthdate && zodiacInfo && (
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
