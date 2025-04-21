import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CustomerPersonalData } from "@/lib/supabase/services/customerPersonalDataService";
import { customerPersonalDataService } from "@/lib/supabase/services/customerPersonalDataService";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface CustomerPersonalDataProps {
  customerId: number;
}

const BEVERAGE_OPTIONS = ["Kahve", "Çay", "Su", "Soğuk İçecekler"];
const CARE_PREFERENCES = ["Keratin Bakımı", "Saç Botoksu", "Bitkisel İçerikli Ürün", "Vegan/Hayvan Deneysiz", "Parfümsüz Ürün"];
const HAIR_LENGTH_OPTIONS = ["Kısa", "Orta", "Uzun"];
const HAIR_GOAL_OPTIONS = ["Uzatmak İstiyor", "Düzenli Kestiriyor", "Mevcut Uzunluğu Korumak İstiyor"];
const BROW_OPTIONS = ["Kaş Aldırır", "Kaş Aldırmaz", "Kaş Boyatır"];
const MUSTACHE_OPTIONS = ["Bıyık Temizliği İster", "Bıyık Temizliği İstemez"];
const SENSITIVITY_OPTIONS = [
  "Saç Derisi Hassasiyeti",
  "Kimyasallara Alerji",
  "Bel/Omurga Rahatsızlığı",
  "Uzun Süre Oturamama",
  "Boya Kokusuna Hassasiyet"
];

export function CustomerPersonalData({ customerId }: CustomerPersonalDataProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [childName, setChildName] = useState("");
  const [formData, setFormData] = useState<Partial<CustomerPersonalData>>({
    beverage_preferences: [],
    beverage_notes: "",
    care_preferences: [],
    care_notes: "",
    hair_length: "",
    hair_goal: "",
    hair_goal_notes: "",
    brow_preference: "",
    mustache_preference: "",
    waxing_preference: false,
    eyelash_preference: false,
    face_preference_notes: "",
    sensitivities: [],
    sensitivity_notes: "",
    stylist_observations: "",
    children_names: [],
  });

  const { data: personalData, isLoading } = useQuery<CustomerPersonalData | null>({
    queryKey: ["customer-personal-data", customerId],
    queryFn: async () => {
      return customerPersonalDataService.getCustomerPersonalData(customerId);
    },
  });

  useEffect(() => {
    if (personalData) {
      setFormData({
        beverage_preferences: personalData.beverage_preferences || [],
        beverage_notes: personalData.beverage_notes || "",
        care_preferences: personalData.care_preferences || [],
        care_notes: personalData.care_notes || "",
        hair_length: personalData.hair_length || "",
        hair_goal: personalData.hair_goal || "",
        hair_goal_notes: personalData.hair_goal_notes || "",
        brow_preference: personalData.brow_preference || "",
        mustache_preference: personalData.mustache_preference || "",
        waxing_preference: personalData.waxing_preference || false,
        eyelash_preference: personalData.eyelash_preference || false,
        face_preference_notes: personalData.face_preference_notes || "",
        sensitivities: personalData.sensitivities || [],
        sensitivity_notes: personalData.sensitivity_notes || "",
        stylist_observations: personalData.stylist_observations || "",
        children_names: personalData.children_names || [],
      });
    }
  }, [personalData]);

  const updatePersonalDataMutation = useMutation<boolean, Error, Partial<CustomerPersonalData>>({
    mutationFn: async (data: Partial<CustomerPersonalData>) => {
      const existingRecord = await customerPersonalDataService.getCustomerPersonalData(customerId);
      if (!existingRecord) {
        await customerPersonalDataService.updateCustomerPersonalData(customerId.toString(), { customer_id: customerId.toString() });
      }

      const { bleach_tolerance, root_dye_frequency, straightener_preference, curling_preference, heat_sensitive_hair, heat_notes, ...cleanData } = data as any;
      cleanData.children_names = Array.isArray(cleanData.children_names) ? cleanData.children_names : [];

      await customerPersonalDataService.updateCustomerPersonalData(customerId.toString(), cleanData);
      return true;
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

  const handleCheckboxChange = (name: string, value: string, checked: boolean) => {
    setFormData((prev) => {
      if (checked) {
        return { ...prev, [name]: [...(prev[name as keyof typeof prev] as string[]), value] };
      } else {
        return {
          ...prev,
          [name]: (prev[name as keyof typeof prev] as string[]).filter(item => item !== value),
        };
      }
    });
  };

  const handleBooleanChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleAddChild = () => {
    if (childName.trim()) {
      setFormData((prev) => ({
        ...prev,
        children_names: [...(prev.children_names || []), childName.trim()],
      }));
      setChildName("");
    }
  };

  const handleRemoveChild = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      children_names: (prev.children_names || []).filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    updatePersonalDataMutation.mutate(formData);
  };

  const isSelected = (array: string[], value: string) => array.includes(value);

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
            <Button 
              onClick={handleSave} 
              disabled={updatePersonalDataMutation.isLoading}
            >
              {updatePersonalDataMutation.isLoading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        ) : (
          <Button onClick={() => setIsEditing(true)}>Düzenle</Button>
        )}
      </div>

      {/* 1. İçecek Tercihi */}
      <div>
        <h3 className="text-lg font-medium mb-4">İçecek Tercihi</h3>
        <div className="grid gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {BEVERAGE_OPTIONS.map((beverage) => (
                <div key={beverage} className="flex items-center space-x-2">
                  <Checkbox
                    id={`beverage-${beverage}`}
                    checked={isSelected(formData.beverage_preferences || [], beverage)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("beverage_preferences", beverage, checked as boolean)
                    }
                    disabled={!isEditing}
                  />
                  <label htmlFor={`beverage-${beverage}`}>{beverage}</label>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Label>Detaylı İçecek Notu</Label>
              {isEditing ? (
                <Textarea
                  name="beverage_notes"
                  value={formData.beverage_notes || ""}
                  onChange={handleChange}
                  placeholder="Örn: şekersiz filtre kahve"
                  className="h-20"
                />
              ) : (
                <p className="p-2 border rounded-md bg-gray-50 min-h-[40px]">
                  {formData.beverage_notes || "Belirtilmemiş"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* 2. Bakım Tercihleri */}
      <div>
        <h3 className="text-lg font-medium mb-4">Bakım Tercihleri</h3>
        <div className="grid gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-4">
              {CARE_PREFERENCES.map((care) => (
                <div key={care} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`care-${care}`}
                    checked={isSelected(formData.care_preferences || [], care)}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('care_preferences', care, checked as boolean)
                    }
                    disabled={!isEditing}
                  />
                  <label htmlFor={`care-${care}`}>{care}</label>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Label>Bakım Notları</Label>
              {isEditing ? (
                <Textarea
                  name="care_notes"
                  value={formData.care_notes || ""}
                  onChange={handleChange}
                  placeholder="Müşterinin bakım tercihleri hakkında notlar"
                  className="h-20"
                />
              ) : (
                <p className="p-2 border rounded-md bg-gray-50 min-h-[40px]">
                  {formData.care_notes || "Belirtilmemiş"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* 3. Saç Uzunluğu & Hedefi */}
      <div>
        <h3 className="text-lg font-medium mb-4">Saç Uzunluğu & Hedefi</h3>
        <div className="grid gap-4">
          <div className="space-y-4">
            <div>
              <Label>Saç Uzunluğu</Label>
              {isEditing ? (
                <RadioGroup 
                  value={formData.hair_length || ""} 
                  onValueChange={(value) => 
                    setFormData((prev) => ({ ...prev, hair_length: value }))
                  }
                  className="flex gap-4 mt-2"
                >
                  {HAIR_LENGTH_OPTIONS.map(length => (
                    <div key={length} className="flex items-center space-x-2">
                      <RadioGroupItem value={length} id={`length-${length}`} />
                      <Label htmlFor={`length-${length}`}>{length}</Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <p className="p-2 border rounded-md bg-gray-50">
                  {formData.hair_length || "Belirtilmemiş"}
                </p>
              )}
            </div>
            
            <div>
              <Label>Hedef</Label>
              {isEditing ? (
                <RadioGroup 
                  value={formData.hair_goal || ""} 
                  onValueChange={(value) => 
                    setFormData((prev) => ({ ...prev, hair_goal: value }))
                  }
                  className="flex flex-col gap-2 mt-2"
                >
                  {HAIR_GOAL_OPTIONS.map(goal => (
                    <div key={goal} className="flex items-center space-x-2">
                      <RadioGroupItem value={goal} id={`goal-${goal}`} />
                      <Label htmlFor={`goal-${goal}`}>{goal}</Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <p className="p-2 border rounded-md bg-gray-50">
                  {formData.hair_goal || "Belirtilmemiş"}
                </p>
              )}
            </div>
            
            <div>
              <Label>Not</Label>
              {isEditing ? (
                <Input
                  name="hair_goal_notes"
                  value={formData.hair_goal_notes || ""}
                  onChange={handleChange}
                  placeholder="Örn: Saç uçları kesilmesin istiyor"
                  className="max-w-md"
                />
              ) : (
                <p className="p-2 border rounded-md bg-gray-50">
                  {formData.hair_goal_notes || "Belirtilmemiş"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* 4. Kaş/Bıyık/İpek Kirpik Tercihleri */}
      <div>
        <h3 className="text-lg font-medium mb-4">Kaş/Bıyık/İpek Kirpik Tercihleri</h3>
        <div className="grid gap-4">
          <div className="space-y-4">
            <div>
              <Label>Kaş Tercihi</Label>
              {isEditing ? (
                <Select
                  value={formData.brow_preference || ""}
                  onValueChange={(value) => 
                    setFormData((prev) => ({ ...prev, brow_preference: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    {BROW_OPTIONS.map(pref => (
                      <SelectItem key={pref} value={pref}>{pref}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="p-2 border rounded-md bg-gray-50">
                  {formData.brow_preference || "Belirtilmemiş"}
                </p>
              )}
            </div>
            
            <div>
              <Label>Bıyık Tercihi</Label>
              {isEditing ? (
                <Select
                  value={formData.mustache_preference || ""}
                  onValueChange={(value) => 
                    setFormData((prev) => ({ ...prev, mustache_preference: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    {MUSTACHE_OPTIONS.map(pref => (
                      <SelectItem key={pref} value={pref}>{pref}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="p-2 border rounded-md bg-gray-50">
                  {formData.mustache_preference || "Belirtilmemiş"}
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="waxing_preference" 
                checked={formData.waxing_preference || false}
                onCheckedChange={(checked) => 
                  handleBooleanChange('waxing_preference', checked as boolean)
                }
                disabled={!isEditing}
              />
              <label htmlFor="waxing_preference">Sir Ağda Yaptırır</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="eyelash_preference" 
                checked={formData.eyelash_preference || false}
                onCheckedChange={(checked) => 
                  handleBooleanChange('eyelash_preference', checked as boolean)
                }
                disabled={!isEditing}
              />
              <label htmlFor="eyelash_preference">Kirpik Uzatma / İpek Kirpik Tercihi</label>
            </div>
            
            <div>
              <Label>Notlar</Label>
              {isEditing ? (
                <Textarea
                  name="face_preference_notes"
                  value={formData.face_preference_notes || ""}
                  onChange={handleChange}
                  placeholder="Ek açıklamalar"
                  className="h-20"
                />
              ) : (
                <p className="p-2 border rounded-md bg-gray-50">
                  {formData.face_preference_notes || "Belirtilmemiş"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* 5. Hassasiyet / Alerji / Kısıtlar */}
      <div>
        <h3 className="text-lg font-medium mb-4">Hassasiyet / Alerji / Kısıtlar</h3>
        <div className="grid gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-4">
              {SENSITIVITY_OPTIONS.map((sensitivity) => (
                <div key={sensitivity} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`sensitivity-${sensitivity}`}
                    checked={isSelected(formData.sensitivities || [], sensitivity)}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('sensitivities', sensitivity, checked as boolean)
                    }
                    disabled={!isEditing}
                  />
                  <label htmlFor={`sensitivity-${sensitivity}`}>{sensitivity}</label>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Label>Hassasiyet Notları</Label>
              {isEditing ? (
                <Textarea
                  name="sensitivity_notes"
                  value={formData.sensitivity_notes || ""}
                  onChange={handleChange}
                  placeholder="Ek hassasiyet bilgileri"
                  className="h-20"
                />
              ) : (
                <p className="p-2 border rounded-md bg-gray-50 min-h-[40px]">
                  {formData.sensitivity_notes || "Belirtilmemiş"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* 6. Serbest Not Alanı (Kuaför İçin Gözlem Notları) */}
      <div>
        <h3 className="text-lg font-medium mb-4">Kuaför Gözlem Notları</h3>
        <div className="space-y-2">
          {isEditing ? (
            <Textarea
              name="stylist_observations"
              value={formData.stylist_observations || ""}
              onChange={handleChange}
              placeholder="Çok konuşkan, sessiz ortam sever, bekletilmekten hoşlanmaz gibi gözlemlerinizi yazabilirsiniz..."
              className="min-h-[100px]"
            />
          ) : (
            <p className="p-2 border rounded-md bg-gray-50 min-h-[100px]">
              {formData.stylist_observations || "Henüz not eklenmemiş"}
            </p>
          )}
        </div>
      </div>

      {/* Çocuklar */}
      <div>
        <h3 className="text-lg font-medium mb-4">Çocuklar</h3>
        {isEditing ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="Çocuk adı"
                className="flex-1"
              />
              <Button type="button" onClick={handleAddChild}>Ekle</Button>
            </div>
            <div className="space-y-2">
              {formData.children_names && formData.children_names.length > 0 ? (
                formData.children_names.map((name, index) => (
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
          <p className="p-2 border rounded-md bg-gray-50">
            {formData.children_names && formData.children_names.length > 0 ? formData.children_names.join(", ") : "Belirtilmemiş"}
          </p>
        )}
      </div>
    </div>
  );
}
