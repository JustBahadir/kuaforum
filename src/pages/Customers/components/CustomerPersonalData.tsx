
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { customerPersonalDataService } from "@/lib/supabase/services/customerPersonalDataService";

interface CustomerPersonalDataProps {
  customerId: number;
}

export function CustomerPersonalData({ customerId }: CustomerPersonalDataProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [childName, setChildName] = useState("");
  const [formData, setFormData] = useState({
    spouse_name: "",
    spouse_birthdate: "",
    anniversary_date: "",
    children_names: [] as string[],
    horoscope: "",
    custom_notes: "",
  });

  const {
    data: personalData,
    isLoading,
  } = useQuery({
    queryKey: ["customer-personal-data", customerId],
    queryFn: async () => {
      return customerPersonalDataService.getCustomerPersonalData(customerId);
    },
  });

  useEffect(() => {
    if (personalData) {
      setFormData({
        spouse_name: personalData.spouse_name || "",
        spouse_birthdate: personalData.spouse_birthdate || "",
        anniversary_date: personalData.anniversary_date || "",
        children_names: personalData.children_names || [],
        horoscope: personalData.horoscope || "",
        custom_notes: personalData.custom_notes || "",
      });
    }
  }, [personalData]);

  const updatePersonalDataMutation = useMutation({
    mutationFn: async (data: any) => {
      await customerPersonalDataService.updateCustomerPersonalData(customerId, {
        ...data,
        customer_id: customerId.toString(),
      });
    },
    onSuccess: () => {
      toast.success("Müşteri bilgileri güncellendi");
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["customer-personal-data", customerId] });
    },
    onError: (error) => {
      console.error("Error updating personal data:", error);
      toast.error("Bilgiler güncellenirken bir hata oluştu");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddChild = () => {
    if (childName.trim()) {
      setFormData((prev) => ({
        ...prev,
        children_names: [...prev.children_names, childName.trim()],
      }));
      setChildName("");
    }
  };

  const handleRemoveChild = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      children_names: prev.children_names.filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    updatePersonalDataMutation.mutate(formData);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "dd.MM.yyyy");
    } catch (error) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {isEditing ? (
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              İptal
            </Button>
            <Button onClick={handleSave} disabled={updatePersonalDataMutation.isPending}>
              {updatePersonalDataMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        ) : (
          <Button onClick={() => setIsEditing(true)}>Düzenle</Button>
        )}
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Aile Bilgileri</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Eş İsmi</Label>
            {isEditing ? (
              <Input
                name="spouse_name"
                value={formData.spouse_name}
                onChange={handleChange}
                placeholder="Eşinin adı"
              />
            ) : (
              <p className="p-2 border rounded-md bg-gray-50">
                {formData.spouse_name || "Belirtilmemiş"}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Eş Doğum Tarihi</Label>
            {isEditing ? (
              <Input
                name="spouse_birthdate"
                type="date"
                value={formData.spouse_birthdate}
                onChange={handleChange}
              />
            ) : (
              <p className="p-2 border rounded-md bg-gray-50">
                {formData.spouse_birthdate ? formatDate(formData.spouse_birthdate) : "Belirtilmemiş"}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Evlilik Yıldönümü</Label>
            {isEditing ? (
              <Input
                name="anniversary_date"
                type="date"
                value={formData.anniversary_date}
                onChange={handleChange}
              />
            ) : (
              <p className="p-2 border rounded-md bg-gray-50">
                {formData.anniversary_date ? formatDate(formData.anniversary_date) : "Belirtilmemiş"}
              </p>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Çocuklar</h3>
        {isEditing ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Çocuk adı"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="flex-1"
              />
              <Button type="button" onClick={handleAddChild}>
                Ekle
              </Button>
            </div>
            {formData.children_names.length > 0 ? (
              <ul className="space-y-2">
                {formData.children_names.map((name, index) => (
                  <li key={index} className="flex items-center justify-between p-2 border rounded-md">
                    <span>{name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveChild(index)}
                      className="h-8 w-8 p-0"
                    >
                      &times;
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Henüz çocuk eklenmemiş</p>
            )}
          </div>
        ) : (
          <div>
            {formData.children_names && formData.children_names.length > 0 ? (
              <ul className="space-y-2">
                {formData.children_names.map((name, index) => (
                  <li key={index} className="p-2 border rounded-md bg-gray-50">
                    {name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-2 border rounded-md bg-gray-50">Henüz çocuk eklenmemiş</p>
            )}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Burç Bilgisi</h3>
        <div className="space-y-2">
          {isEditing ? (
            <Input
              name="horoscope"
              value={formData.horoscope}
              onChange={handleChange}
              placeholder="Burç"
            />
          ) : (
            <p className="p-2 border rounded-md bg-gray-50">
              {formData.horoscope || "Belirtilmemiş"}
            </p>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">İçecek Tercihi</h3>
        <div className="grid gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {["Kahve", "Su", "Çay", "Soğuk İçecekler"].map((beverage) => (
                <div key={beverage} className="flex items-center space-x-2">
                  <input type="checkbox" id={beverage} name={beverage} className="rounded" />
                  <label htmlFor={beverage}>{beverage}</label>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Label>Detaylı İçecek Notu</Label>
              {isEditing ? (
                <Textarea
                  placeholder="Örn: şekersiz filtre kahve"
                  className="h-20"
                />
              ) : (
                <p className="p-2 border rounded-md bg-gray-50 min-h-[40px]"></p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Saç Tipi</h3>
        <div className="grid gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-4">
              {["Düz", "Dalgalı", "Kıvırcık", "İnce Telli", "Kalın Telli", "Kuru", "Normal", "Yağlı"].map((hairType) => (
                <div key={hairType} className="flex items-center space-x-2">
                  <input type="checkbox" id={hairType} name={hairType} className="rounded" />
                  <label htmlFor={hairType}>{hairType}</label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Boyama Tercihi</h3>
        <div className="grid gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-4">
              {["Kalıcı Boya", "Geçici Boya"].map((dyeType) => (
                <div key={dyeType} className="flex items-center space-x-2">
                  <input type="checkbox" id={dyeType} name={dyeType} className="rounded" />
                  <label htmlFor={dyeType}>{dyeType}</label>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Label>Dip Boya Sıklığı</Label>
              {isEditing ? (
                <Input
                  placeholder="Örn: 4 haftada bir"
                  className="max-w-md"
                />
              ) : (
                <p className="p-2 border rounded-md bg-gray-50 max-w-md"></p>
              )}
            </div>
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="allergyCheck" name="allergyCheck" className="rounded" />
                <label htmlFor="allergyCheck">Acı Toleransı</label>
              </div>
              <div className="mt-2">
                <Label>Alerji Notları</Label>
                {isEditing ? (
                  <Textarea
                    placeholder="Alerjisi varsa belirtin"
                    className="h-20"
                  />
                ) : (
                  <p className="p-2 border rounded-md bg-gray-50 min-h-[40px]"></p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Isı İşlemi Toleransı</h3>
        <div className="grid gap-4">
          <div className="space-y-4">
            <div>
              <Label>Düzleştirici Kullanımı</Label>
              <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                <option>Seçiniz</option>
              </select>
            </div>
            
            <div>
              <Label>Maşa / Bigudi Tercihi</Label>
              <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                <option>Seçiniz</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input type="checkbox" id="sensitiveSkinCheck" className="rounded" />
              <label htmlFor="sensitiveSkinCheck">Isıya Hassas Saç</label>
            </div>

            <div>
              <Label>Isı İşlemi Notları</Label>
              {isEditing ? (
                <Textarea
                  placeholder="Müşterinin ısı işlemi tercihleri hakkında notlar"
                  className="h-20"
                />
              ) : (
                <p className="p-2 border rounded-md bg-gray-50 min-h-[40px]"></p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Ek Notlar</h3>
        <div className="space-y-2">
          {isEditing ? (
            <Textarea
              name="custom_notes"
              value={formData.custom_notes || ""}
              onChange={handleChange}
              placeholder="Müşteri hakkında özel notlarınız..."
              className="min-h-[100px]"
            />
          ) : (
            <p className="p-2 border rounded-md bg-gray-50 min-h-[100px]">
              {formData.custom_notes || "Henüz not eklenmemiş"}
            </p>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="flex justify-end pt-4">
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              İptal
            </Button>
            <Button onClick={handleSave} disabled={updatePersonalDataMutation.isPending}>
              {updatePersonalDataMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
