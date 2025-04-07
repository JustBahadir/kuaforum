
import { useState } from "react";
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
  customerId: number;
  editMode?: boolean;
}

export function CustomerPersonalInfo({ customer, customerId, editMode = false }: CustomerPersonalInfoProps) {
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
  const customerIdStr = String(customerId);

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
  useState(() => {
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
  });

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

  const addChildName = () => {
    if (newChildName.trim()) {
      setPersonalData(prev => ({
        ...prev,
        childrenNames: [...prev.childrenNames, newChildName.trim()]
      }));
      setNewChildName("");
    }
  };

  const removeChildName = (index: number) => {
    setPersonalData(prev => ({
      ...prev,
      childrenNames: prev.childrenNames.filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return <div className="p-4 text-center">Bilgiler yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex justify-between">
          <span>İletişim Bilgileri</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Telefon</Label>
            <div className="p-2 border rounded mt-1 bg-gray-50">
              {customer.phone ? formatPhoneNumber(customer.phone) : "Belirtilmemiş"}
            </div>
          </div>
          <div>
            <Label>Doğum Tarihi</Label>
            <div className="p-2 border rounded mt-1 bg-gray-50">
              {customer.birthdate ? format(new Date(customer.birthdate), "dd MMMM yyyy", { locale: tr }) : "Belirtilmemiş"}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Family Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex justify-between">
          <span>Aile Bilgileri</span>
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
                  type="date"
                  value={personalData.spouseBirthdate}
                  onChange={(e) => setPersonalData(prev => ({ ...prev, spouseBirthdate: e.target.value }))}
                />
              ) : (
                <div className="p-2 border rounded mt-1 bg-gray-50">
                  {existingPersonalData?.spouse_birthdate 
                    ? format(new Date(existingPersonalData.spouse_birthdate), "dd MMMM yyyy", { locale: tr })
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
                type="date"
                value={personalData.anniversaryDate}
                onChange={(e) => setPersonalData(prev => ({ ...prev, anniversaryDate: e.target.value }))}
              />
            ) : (
              <div className="p-2 border rounded mt-1 bg-gray-50">
                {existingPersonalData?.anniversary_date 
                  ? format(new Date(existingPersonalData.anniversary_date), "dd MMMM yyyy", { locale: tr })
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

      {/* Horoscope Information (Placeholder) */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Burç Bilgisi</h3>
        <div className="p-4 border rounded bg-gray-50">
          <p className="text-center text-gray-500">
            {customer.birthdate 
              ? "Burç bilgisi yakında eklenecek..." 
              : "Burç bilgisi için doğum tarihi gereklidir."}
          </p>
        </div>
      </div>
    </div>
  );
  
  function addChildName() {
    if (newChildName.trim()) {
      setPersonalData(prev => ({
        ...prev,
        childrenNames: [...prev.childrenNames, newChildName.trim()]
      }));
      setNewChildName("");
    }
  }

  function removeChildName(index: number) {
    setPersonalData(prev => ({
      ...prev,
      childrenNames: prev.childrenNames.filter((_, i) => i !== index)
    }));
  }
}
