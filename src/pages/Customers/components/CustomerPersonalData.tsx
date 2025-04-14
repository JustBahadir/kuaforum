
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { customerPersonalDataService } from "@/lib/supabase/services/customerPersonalDataService";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns"; // Add this import for the format function

interface CustomerPersonalDataProps {
  customerId: number;
}

// Define constants for preference options
const BEVERAGE_OPTIONS = ["Kahve", "Çay", "Su", "Soğuk İçecekler"];
const HAIR_TYPE_OPTIONS = {
  structure: ["Düz", "Dalgalı", "Kıvırcık"],
  condition: ["Kuru", "Normal", "Yağlı"],
  thickness: ["İnce Telli", "Kalın Telli"]
};
const HAIR_DYE_OPTIONS = ["Kalıcı Boya", "Geçici Boya"];
const HEAT_PREFERENCES = ["Seviyor", "Sevmiyor", "Nötr"];
const STYLING_PREFERENCES = ["Maşa", "Düzleştirici", "Bigudi", "Doğal Kurutma"];
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
  const [formData, setFormData] = useState({
    // Beverage Preference
    beverage_preferences: [] as string[],
    beverage_notes: "",

    // Hair Type - Updated structure for radio buttons
    hair_structure: "", // Single value for radio button
    hair_condition: "", // Single value for radio button
    hair_thickness: "", // Single value for radio button
    hair_types: [] as string[], // Keep compatibility with existing data
    
    // Hair Dye Preference
    dye_preferences: [] as string[],
    root_dye_frequency: "",
    bleach_tolerance: false,
    allergy_notes: "",
    
    // Heat Treatment Tolerance
    straightener_preference: "",
    curling_preference: "",
    heat_sensitive_hair: false,
    heat_notes: "",
    
    // Care Preferences
    care_preferences: [] as string[],
    care_notes: "",
    
    // Hair Length & Goal
    hair_length: "",
    hair_goal: "",
    hair_goal_notes: "",
    
    // Brow/Mustache/Eyelash Preferences
    brow_preference: "",
    mustache_preference: "",
    waxing_preference: false,
    eyelash_preference: false,
    face_preference_notes: "",
    
    // Sensitivities
    sensitivities: [] as string[],
    sensitivity_notes: "",
    
    // Free Notes
    stylist_observations: "",
    
    // Add children_names to fix missing property error
    children_names: [] as string[],
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

  // Extract hair type categories from existing data
  useEffect(() => {
    if (personalData) {
      const hairTypes = personalData.hair_types || [];
      
      // Find hair structure
      const hairStructure = HAIR_TYPE_OPTIONS.structure.find(type => hairTypes.includes(type)) || "";
      
      // Find hair condition
      const hairCondition = HAIR_TYPE_OPTIONS.condition.find(type => hairTypes.includes(type)) || "";
      
      // Find hair thickness
      const hairThickness = HAIR_TYPE_OPTIONS.thickness.find(type => hairTypes.includes(type)) || "";
      
      setFormData({
        beverage_preferences: personalData.beverage_preferences || [],
        beverage_notes: personalData.beverage_notes || "",
        
        hair_structure: hairStructure,
        hair_condition: hairCondition,
        hair_thickness: hairThickness,
        hair_types: personalData.hair_types || [],
        
        dye_preferences: personalData.dye_preferences || [],
        root_dye_frequency: personalData.root_dye_frequency || "",
        bleach_tolerance: personalData.bleach_tolerance || false,
        allergy_notes: personalData.allergy_notes || "",
        
        straightener_preference: personalData.straightener_preference || "",
        curling_preference: personalData.curling_preference || "",
        heat_sensitive_hair: personalData.heat_sensitive_hair || false,
        heat_notes: personalData.heat_notes || "",
        
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
        
        // Add children_names from personalData
        children_names: personalData.children_names || [],
      });
    }
  }, [personalData]);

  const updatePersonalDataMutation = useMutation({
    mutationFn: async (data: any) => {
      // Convert radio button selections back to array format
      const hairTypes = [] as string[];
      
      if (data.hair_structure) {
        hairTypes.push(data.hair_structure);
      }
      
      if (data.hair_condition) {
        hairTypes.push(data.hair_condition);
      }
      
      if (data.hair_thickness) {
        hairTypes.push(data.hair_thickness);
      }
      
      // Prepare data for saving
      const dataToSave = {
        ...data,
        hair_types: hairTypes,
        customer_id: customerId.toString(),
      };
      
      console.log("Saving data:", dataToSave);
      
      try {
        await customerPersonalDataService.updateCustomerPersonalData(customerId, dataToSave);
        return true;
      } catch (error) {
        console.error("Error updating personal data:", error);
        throw error;
      }
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
        // Add to array if checked
        return { ...prev, [name]: [...(prev[name as keyof typeof prev] as string[]), value] };
      } else {
        // Remove from array if unchecked
        return { 
          ...prev, 
          [name]: (prev[name as keyof typeof prev] as string[]).filter(item => item !== value)
        };
      }
    });
  };

  const handleBooleanChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleRadioChange = (name: string, value: string) => {
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

  // Check if value is in array helper
  const isSelected = (array: string[], value: string) => {
    return array.includes(value);
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
                    checked={isSelected(formData.beverage_preferences, beverage)}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('beverage_preferences', beverage, checked as boolean)
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
                  value={formData.beverage_notes}
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

      {/* 2. Saç Tipi - Updated to use radio buttons in 3 columns */}
      <div>
        <h3 className="text-lg font-medium mb-4">Saç Tipi</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Hair Structure */}
          <div className="space-y-2">
            <Label className="font-medium">Saç Yapısı</Label>
            {isEditing ? (
              <RadioGroup 
                value={formData.hair_structure} 
                onValueChange={(value) => handleRadioChange('hair_structure', value)}
              >
                {HAIR_TYPE_OPTIONS.structure.map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`structure-${option}`} />
                    <Label htmlFor={`structure-${option}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <p className="p-2 border rounded-md bg-gray-50">
                {formData.hair_structure || "Belirtilmemiş"}
              </p>
            )}
          </div>
          
          {/* Column 2: Hair Condition */}
          <div className="space-y-2">
            <Label className="font-medium">Saç Durumu</Label>
            {isEditing ? (
              <RadioGroup 
                value={formData.hair_condition} 
                onValueChange={(value) => handleRadioChange('hair_condition', value)}
              >
                {HAIR_TYPE_OPTIONS.condition.map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`condition-${option}`} />
                    <Label htmlFor={`condition-${option}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <p className="p-2 border rounded-md bg-gray-50">
                {formData.hair_condition || "Belirtilmemiş"}
              </p>
            )}
          </div>
          
          {/* Column 3: Hair Thickness */}
          <div className="space-y-2">
            <Label className="font-medium">Saç Kalınlığı</Label>
            {isEditing ? (
              <RadioGroup 
                value={formData.hair_thickness} 
                onValueChange={(value) => handleRadioChange('hair_thickness', value)}
              >
                {HAIR_TYPE_OPTIONS.thickness.map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`thickness-${option}`} />
                    <Label htmlFor={`thickness-${option}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <p className="p-2 border rounded-md bg-gray-50">
                {formData.hair_thickness || "Belirtilmemiş"}
              </p>
            )}
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* 3. Boyama Tercihi */}
      <div>
        <h3 className="text-lg font-medium mb-4">Boyama Tercihi</h3>
        <div className="grid gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-4">
              {HAIR_DYE_OPTIONS.map((dyeType) => (
                <div key={dyeType} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`dye-${dyeType}`}
                    checked={isSelected(formData.dye_preferences, dyeType)}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('dye_preferences', dyeType, checked as boolean)
                    }
                    disabled={!isEditing}
                  />
                  <label htmlFor={`dye-${dyeType}`}>{dyeType}</label>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Label>Dip Boya Sıklığı</Label>
              {isEditing ? (
                <Input
                  name="root_dye_frequency"
                  value={formData.root_dye_frequency}
                  onChange={handleChange}
                  placeholder="Örn: 4 haftada bir"
                  className="max-w-md"
                />
              ) : (
                <p className="p-2 border rounded-md bg-gray-50 max-w-md">
                  {formData.root_dye_frequency || "Belirtilmemiş"}
                </p>
              )}
            </div>
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="bleach_tolerance" 
                  checked={formData.bleach_tolerance}
                  onCheckedChange={(checked) => 
                    handleBooleanChange('bleach_tolerance', checked as boolean)
                  }
                  disabled={!isEditing}
                />
                <label htmlFor="bleach_tolerance">Açıcı Toleransı</label>
              </div>
              <div className="mt-2">
                <Label>Alerji Notları</Label>
                {isEditing ? (
                  <Textarea
                    name="allergy_notes"
                    value={formData.allergy_notes}
                    onChange={handleChange}
                    placeholder="Alerjisi varsa belirtin"
                    className="h-20"
                  />
                ) : (
                  <p className="p-2 border rounded-md bg-gray-50 min-h-[40px]">
                    {formData.allergy_notes || "Belirtilmemiş"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* 4. Isı İşlemi Toleransı */}
      <div>
        <h3 className="text-lg font-medium mb-4">Isı İşlemi Toleransı</h3>
        <div className="grid gap-4">
          <div className="space-y-4">
            <div>
              <Label>Düzleştirici Kullanımı</Label>
              {isEditing ? (
                <Select
                  value={formData.straightener_preference}
                  onValueChange={(value) => 
                    setFormData((prev) => ({ ...prev, straightener_preference: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    {HEAT_PREFERENCES.map(pref => (
                      <SelectItem key={pref} value={pref}>{pref}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="p-2 border rounded-md bg-gray-50">
                  {formData.straightener_preference || "Belirtilmemiş"}
                </p>
              )}
            </div>
            
            <div>
              <Label>Maşa / Bigudi Tercihi</Label>
              {isEditing ? (
                <Select
                  value={formData.curling_preference}
                  onValueChange={(value) => 
                    setFormData((prev) => ({ ...prev, curling_preference: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    {STYLING_PREFERENCES.map(pref => (
                      <SelectItem key={pref} value={pref}>{pref}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="p-2 border rounded-md bg-gray-50">
                  {formData.curling_preference || "Belirtilmemiş"}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="heat_sensitive_hair" 
                checked={formData.heat_sensitive_hair}
                onCheckedChange={(checked) => 
                  handleBooleanChange('heat_sensitive_hair', checked as boolean)
                }
                disabled={!isEditing}
              />
              <label htmlFor="heat_sensitive_hair">Isıya Hassas Saç</label>
            </div>

            <div>
              <Label>Isı İşlemi Notları</Label>
              {isEditing ? (
                <Textarea
                  name="heat_notes"
                  value={formData.heat_notes}
                  onChange={handleChange}
                  placeholder="Müşterinin ısı işlemi tercihleri hakkında notlar"
                  className="h-20"
                />
              ) : (
                <p className="p-2 border rounded-md bg-gray-50 min-h-[40px]">
                  {formData.heat_notes || "Belirtilmemiş"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* 5. Bakım Tercihleri */}
      <div>
        <h3 className="text-lg font-medium mb-4">Bakım Tercihleri</h3>
        <div className="grid gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-4">
              {CARE_PREFERENCES.map((care) => (
                <div key={care} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`care-${care}`}
                    checked={isSelected(formData.care_preferences, care)}
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
                  value={formData.care_notes}
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

      {/* 6. Saç Uzunluğu & Hedefi */}
      <div>
        <h3 className="text-lg font-medium mb-4">Saç Uzunluğu & Hedefi</h3>
        <div className="grid gap-4">
          <div className="space-y-4">
            <div>
              <Label>Saç Uzunluğu</Label>
              {isEditing ? (
                <RadioGroup 
                  value={formData.hair_length} 
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
                  value={formData.hair_goal} 
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
                  value={formData.hair_goal_notes}
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

      {/* 7. Kaş/Bıyık/İpek Kirpik Tercihleri */}
      <div>
        <h3 className="text-lg font-medium mb-4">Kaş/Bıyık/İpek Kirpik Tercihleri</h3>
        <div className="grid gap-4">
          <div className="space-y-4">
            <div>
              <Label>Kaş Tercihi</Label>
              {isEditing ? (
                <Select
                  value={formData.brow_preference}
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
                  value={formData.mustache_preference}
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
                checked={formData.waxing_preference}
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
                checked={formData.eyelash_preference}
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
                  value={formData.face_preference_notes}
                  onChange={handleChange}
                  placeholder="Ek açıklamalar"
                  className="h-20"
                />
              ) : (
                <p className="p-2 border rounded-md bg-gray-50 min-h-[40px]">
                  {formData.face_preference_notes || "Belirtilmemiş"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* 8. Hassasiyet / Alerji / Kısıtlar */}
      <div>
        <h3 className="text-lg font-medium mb-4">Hassasiyet / Alerji / Kısıtlar</h3>
        <div className="grid gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-4">
              {SENSITIVITY_OPTIONS.map((sensitivity) => (
                <div key={sensitivity} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`sensitivity-${sensitivity}`}
                    checked={isSelected(formData.sensitivities, sensitivity)}
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
                  value={formData.sensitivity_notes}
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

      {/* 9. Serbest Not Alanı (Kuaför İçin Gözlem Notları) */}
      <div>
        <h3 className="text-lg font-medium mb-4">Kuaför Gözlem Notları</h3>
        <div className="space-y-2">
          {isEditing ? (
            <Textarea
              name="stylist_observations"
              value={formData.stylist_observations}
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
