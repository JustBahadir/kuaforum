
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  Checkbox,
  CheckboxIndicator,
} from "@radix-ui/react-checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CustomerPreferencesProps {
  customerId: string;
}

interface Preference {
  cologne_preference: string | null;
  razor_preference: string | null;
  ear_burning: boolean;
  custom_preferences: {
    beverages?: string[];
    beverageNotes?: string;
    hairType?: string[];
    colorPreferences?: {
      permanent?: boolean;
      temporary?: boolean;
      rootFrequency?: string;
      lighteningTolerance?: boolean;
      allergies?: string;
    };
    heatTreatment?: {
      straightener?: string;
      curling?: string;
      heatSensitive?: boolean;
      notes?: string;
    };
    careTreatments?: string[];
    careNotes?: string;
    hairLength?: string;
    hairGoal?: string;
    hairCutNotes?: string;
    facialTreatments?: string[];
    sensitivities?: string[];
    sensitivityNotes?: string;
    observationNotes?: string;
    [key: string]: any;
  } | null;
}

interface CheckboxItemProps {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

function CheckboxItem({ id, label, checked, onCheckedChange, disabled = false }: CheckboxItemProps) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="h-4 w-4 border border-gray-300 rounded bg-white data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
      >
        <CheckboxIndicator className="flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M8 3L4 7L2 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </CheckboxIndicator>
      </Checkbox>
      <label htmlFor={id} className="text-sm leading-none cursor-pointer">
        {label}
      </label>
    </div>
  );
}

export function CustomerPreferences({ customerId }: CustomerPreferencesProps) {
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [preferences, setPreferences] = useState<Preference>({
    cologne_preference: null,
    razor_preference: null,
    ear_burning: false,
    custom_preferences: {
      beverages: [],
      beverageNotes: "",
      hairType: [],
      colorPreferences: {
        permanent: false,
        temporary: false,
        rootFrequency: "",
        lighteningTolerance: false,
        allergies: ""
      },
      heatTreatment: {
        straightener: "",
        curling: "",
        heatSensitive: false,
        notes: ""
      },
      careTreatments: [],
      careNotes: "",
      hairLength: "",
      hairGoal: "",
      hairCutNotes: "",
      facialTreatments: [],
      sensitivities: [],
      sensitivityNotes: "",
      observationNotes: ""
    }
  });

  // Fetch customer preferences
  const { data: existingPreferences, isLoading } = useQuery({
    queryKey: ['customer_preferences', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_preferences')
        .select('*')
        .eq('customer_id', customerId)
        .maybeSingle();
        
      if (error) throw error;
      return data;
    }
  });

  // Prefill form with existing data
  useEffect(() => {
    if (existingPreferences) {
      setPreferences({
        cologne_preference: existingPreferences.cologne_preference,
        razor_preference: existingPreferences.razor_preference,
        ear_burning: existingPreferences.ear_burning || false,
        custom_preferences: existingPreferences.custom_preferences || {
          beverages: [],
          beverageNotes: "",
          hairType: [],
          colorPreferences: {
            permanent: false,
            temporary: false,
            rootFrequency: "",
            lighteningTolerance: false,
            allergies: ""
          },
          heatTreatment: {
            straightener: "",
            curling: "",
            heatSensitive: false,
            notes: ""
          },
          careTreatments: [],
          careNotes: "",
          hairLength: "",
          hairGoal: "",
          hairCutNotes: "",
          facialTreatments: [],
          sensitivities: [],
          sensitivityNotes: "",
          observationNotes: ""
        }
      });
    }
  }, [existingPreferences]);

  // Update or create preferences
  const mutation = useMutation({
    mutationFn: async (data: Preference) => {
      if (existingPreferences) {
        // Update existing preferences
        const { error } = await supabase
          .from('customer_preferences')
          .update({
            cologne_preference: data.cologne_preference,
            razor_preference: data.razor_preference,
            ear_burning: data.ear_burning,
            custom_preferences: data.custom_preferences,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingPreferences.id);
          
        if (error) throw error;
      } else {
        // Create new preferences
        const { error } = await supabase
          .from('customer_preferences')
          .insert({
            customer_id: customerId,
            cologne_preference: data.cologne_preference,
            razor_preference: data.razor_preference,
            ear_burning: data.ear_burning,
            custom_preferences: data.custom_preferences
          });
          
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['customer_preferences', customerId]
      });
      setEditMode(false);
      toast.success("Müşteri tercihleri kaydedildi");
    },
    onError: (error) => {
      console.error("Müşteri tercihleri kaydedilemedi:", error);
      toast.error("Müşteri tercihleri kaydedilemedi");
    }
  });

  const handleSave = () => {
    mutation.mutate(preferences);
  };

  const updateCustomPreference = (path: string[], value: any) => {
    setPreferences(prev => {
      const newPreferences = { ...prev };
      let target = newPreferences.custom_preferences || {};
      
      // Navigate to the target object
      for (let i = 0; i < path.length - 1; i++) {
        if (!target[path[i]]) {
          target[path[i]] = {};
        }
        target = target[path[i]];
      }
      
      // Set the value
      target[path[path.length - 1]] = value;
      newPreferences.custom_preferences = newPreferences.custom_preferences || {};
      
      return newPreferences;
    });
  };

  const toggleArrayItem = (path: string[], item: string) => {
    setPreferences(prev => {
      const newPreferences = { ...prev };
      let customPref = newPreferences.custom_preferences || {};
      
      // Navigate to the target array
      let current = customPref;
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) {
          current[path[i]] = {};
        }
        current = current[path[i]];
      }
      
      // Get the array
      const arrayKey = path[path.length - 1];
      const array = current[arrayKey] || [];
      
      // Toggle the item
      if (array.includes(item)) {
        current[arrayKey] = array.filter((i: string) => i !== item);
      } else {
        current[arrayKey] = [...array, item];
      }
      
      newPreferences.custom_preferences = customPref;
      return newPreferences;
    });
  };

  const isArrayItemSelected = (path: string[], item: string): boolean => {
    let current = preferences.custom_preferences;
    if (!current) return false;
    
    // Navigate to the target array
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) return false;
      current = current[path[i]];
    }
    
    // Check if item exists in array
    const array = current[path[path.length - 1]];
    return Array.isArray(array) && array.includes(item);
  };

  if (isLoading) {
    return <div className="p-6 text-center">Tercihler yükleniyor...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Müşteri Tercihleri</h3>
        <Button 
          variant="outline" 
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? "İptal" : "Düzenle"}
        </Button>
      </div>
      
      <div className="space-y-6">
        {/* 1. İçecek Tercihi */}
        <div className="space-y-4">
          <h4 className="font-medium text-base border-l-4 border-purple-500 pl-2">İçecek Tercihi</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <CheckboxItem 
              id="beverage-coffee" 
              label="Kahve" 
              checked={isArrayItemSelected(['beverages'], 'Kahve')} 
              onCheckedChange={() => toggleArrayItem(['beverages'], 'Kahve')}
              disabled={!editMode}
            />
            <CheckboxItem 
              id="beverage-tea" 
              label="Çay" 
              checked={isArrayItemSelected(['beverages'], 'Çay')} 
              onCheckedChange={() => toggleArrayItem(['beverages'], 'Çay')}
              disabled={!editMode}
            />
            <CheckboxItem 
              id="beverage-water" 
              label="Su" 
              checked={isArrayItemSelected(['beverages'], 'Su')} 
              onCheckedChange={() => toggleArrayItem(['beverages'], 'Su')}
              disabled={!editMode}
            />
            <CheckboxItem 
              id="beverage-cold" 
              label="Soğuk İçecekler" 
              checked={isArrayItemSelected(['beverages'], 'Soğuk İçecekler')} 
              onCheckedChange={() => toggleArrayItem(['beverages'], 'Soğuk İçecekler')}
              disabled={!editMode}
            />
          </div>
          <div>
            <Label htmlFor="beverage-notes">Detaylı İçecek Notu</Label>
            <Input
              id="beverage-notes"
              placeholder="Örn: şekersiz filtre kahve"
              value={preferences.custom_preferences?.beverageNotes || ""}
              onChange={(e) => updateCustomPreference(['beverageNotes'], e.target.value)}
              disabled={!editMode}
              className="mt-1"
            />
          </div>
        </div>
        
        <Separator />
        
        {/* 2. Saç Tipi */}
        <div className="space-y-4">
          <h4 className="font-medium text-base border-l-4 border-purple-500 pl-2">Saç Tipi</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <CheckboxItem 
              id="hair-straight" 
              label="Düz" 
              checked={isArrayItemSelected(['hairType'], 'Düz')} 
              onCheckedChange={() => toggleArrayItem(['hairType'], 'Düz')}
              disabled={!editMode}
            />
            <CheckboxItem 
              id="hair-wavy" 
              label="Dalgalı" 
              checked={isArrayItemSelected(['hairType'], 'Dalgalı')} 
              onCheckedChange={() => toggleArrayItem(['hairType'], 'Dalgalı')}
              disabled={!editMode}
            />
            <CheckboxItem 
              id="hair-curly" 
              label="Kıvırcık" 
              checked={isArrayItemSelected(['hairType'], 'Kıvırcık')} 
              onCheckedChange={() => toggleArrayItem(['hairType'], 'Kıvırcık')}
              disabled={!editMode}
            />
            <CheckboxItem 
              id="hair-thin" 
              label="İnce Telli" 
              checked={isArrayItemSelected(['hairType'], 'İnce Telli')} 
              onCheckedChange={() => toggleArrayItem(['hairType'], 'İnce Telli')}
              disabled={!editMode}
            />
            <CheckboxItem 
              id="hair-thick" 
              label="Kalın Telli" 
              checked={isArrayItemSelected(['hairType'], 'Kalın Telli')} 
              onCheckedChange={() => toggleArrayItem(['hairType'], 'Kalın Telli')}
              disabled={!editMode}
            />
            <CheckboxItem 
              id="hair-oily" 
              label="Yağlı" 
              checked={isArrayItemSelected(['hairType'], 'Yağlı')} 
              onCheckedChange={() => toggleArrayItem(['hairType'], 'Yağlı')}
              disabled={!editMode}
            />
            <CheckboxItem 
              id="hair-dry" 
              label="Kuru" 
              checked={isArrayItemSelected(['hairType'], 'Kuru')} 
              onCheckedChange={() => toggleArrayItem(['hairType'], 'Kuru')}
              disabled={!editMode}
            />
            <CheckboxItem 
              id="hair-normal" 
              label="Normal" 
              checked={isArrayItemSelected(['hairType'], 'Normal')} 
              onCheckedChange={() => toggleArrayItem(['hairType'], 'Normal')}
              disabled={!editMode}
            />
          </div>
        </div>
        
        <Separator />
        
        {/* 3. Boyama Tercihi */}
        <div className="space-y-4">
          <h4 className="font-medium text-base border-l-4 border-purple-500 pl-2">Boyama Tercihi</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="color-permanent"
                  checked={preferences.custom_preferences?.colorPreferences?.permanent || false}
                  onCheckedChange={(checked) => updateCustomPreference(['colorPreferences', 'permanent'], !!checked)}
                  disabled={!editMode}
                  className="h-4 w-4 border border-gray-300 rounded"
                >
                  <CheckboxIndicator/>
                </Checkbox>
                <Label htmlFor="color-permanent">Kalıcı Boya</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="color-temporary"
                  checked={preferences.custom_preferences?.colorPreferences?.temporary || false}
                  onCheckedChange={(checked) => updateCustomPreference(['colorPreferences', 'temporary'], !!checked)}
                  disabled={!editMode}
                  className="h-4 w-4 border border-gray-300 rounded"
                >
                  <CheckboxIndicator/>
                </Checkbox>
                <Label htmlFor="color-temporary">Geçici Boya</Label>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="color-root-frequency">Dip Boya Sıklığı</Label>
              <Input
                id="color-root-frequency"
                placeholder="Örn: 4 haftada bir"
                value={preferences.custom_preferences?.colorPreferences?.rootFrequency || ""}
                onChange={(e) => updateCustomPreference(['colorPreferences', 'rootFrequency'], e.target.value)}
                disabled={!editMode}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="color-lightening"
                checked={preferences.custom_preferences?.colorPreferences?.lighteningTolerance || false}
                onCheckedChange={(checked) => updateCustomPreference(['colorPreferences', 'lighteningTolerance'], !!checked)}
                disabled={!editMode}
                className="h-4 w-4 border border-gray-300 rounded"
              >
                <CheckboxIndicator/>
              </Checkbox>
              <Label htmlFor="color-lightening">Açıcı Toleransı</Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="color-allergies">Alerji Notları</Label>
              <Input
                id="color-allergies"
                placeholder="Alerjisi varsa belirtin"
                value={preferences.custom_preferences?.colorPreferences?.allergies || ""}
                onChange={(e) => updateCustomPreference(['colorPreferences', 'allergies'], e.target.value)}
                disabled={!editMode}
              />
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* 4. Isı İşlemi Toleransı */}
        <div className="space-y-4">
          <h4 className="font-medium text-base border-l-4 border-purple-500 pl-2">Isı İşlemi Toleransı</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="heat-straightener">Düzleştirici Kullanımı</Label>
              <Select
                value={preferences.custom_preferences?.heatTreatment?.straightener || ""}
                onValueChange={(value) => updateCustomPreference(['heatTreatment', 'straightener'], value)}
                disabled={!editMode}
              >
                <SelectTrigger id="heat-straightener">
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seviyor">Seviyor</SelectItem>
                  <SelectItem value="sevmiyor">Sevmiyor</SelectItem>
                  <SelectItem value="farketsiz">Farketmez</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="heat-curling">Maşa / Bigudi Tercihi</Label>
              <Select
                value={preferences.custom_preferences?.heatTreatment?.curling || ""}
                onValueChange={(value) => updateCustomPreference(['heatTreatment', 'curling'], value)}
                disabled={!editMode}
              >
                <SelectTrigger id="heat-curling">
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maşa">Maşa Tercih Eder</SelectItem>
                  <SelectItem value="bigudi">Bigudi Tercih Eder</SelectItem>
                  <SelectItem value="her ikisi">Her İkisi de Uygun</SelectItem>
                  <SelectItem value="hiçbiri">Hiçbiri Tercih Edilmez</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="heat-sensitive"
              checked={preferences.custom_preferences?.heatTreatment?.heatSensitive || false}
              onCheckedChange={(checked) => updateCustomPreference(['heatTreatment', 'heatSensitive'], !!checked)}
              disabled={!editMode}
              className="h-4 w-4 border border-gray-300 rounded"
            >
              <CheckboxIndicator/>
            </Checkbox>
            <Label htmlFor="heat-sensitive">Isıya Hassas Saç</Label>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="heat-notes">Isı İşlemi Notları</Label>
            <Textarea
              id="heat-notes"
              placeholder="Müşterinin ısı işlemi tercihleri hakkında notlar"
              value={preferences.custom_preferences?.heatTreatment?.notes || ""}
              onChange={(e) => updateCustomPreference(['heatTreatment', 'notes'], e.target.value)}
              disabled={!editMode}
              className="min-h-[80px]"
            />
          </div>
        </div>
        
        <Separator />
        
        {/* 5. Bakım Tercihleri */}
        <div className="space-y-4">
          <h4 className="font-medium text-base border-l-4 border-purple-500 pl-2">Bakım Tercihleri</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <CheckboxItem 
              id="care-keratin" 
              label="Keratin Bakımı" 
              checked={isArrayItemSelected(['careTreatments'], 'Keratin Bakımı')} 
              onCheckedChange={() => toggleArrayItem(['careTreatments'], 'Keratin Bakımı')}
              disabled={!editMode}
            />
            <CheckboxItem 
              id="care-botox" 
              label="Saç Botoksu" 
              checked={isArrayItemSelected(['careTreatments'], 'Saç Botoksu')} 
              onCheckedChange={() => toggleArrayItem(['careTreatments'], 'Saç Botoksu')}
              disabled={!editMode}
            />
            <CheckboxItem 
              id="care-herbal" 
              label="Bitkisel İçerikli Ürün" 
              checked={isArrayItemSelected(['careTreatments'], 'Bitkisel İçerikli Ürün')} 
              onCheckedChange={() => toggleArrayItem(['careTreatments'], 'Bitkisel İçerikli Ürün')}
              disabled={!editMode}
            />
            <CheckboxItem 
              id="care-vegan" 
              label="Vegan / Hayvan Deneysiz Ürün" 
              checked={isArrayItemSelected(['careTreatments'], 'Vegan / Hayvan Deneysiz Ürün')} 
              onCheckedChange={() => toggleArrayItem(['careTreatments'], 'Vegan / Hayvan Deneysiz Ürün')}
              disabled={!editMode}
            />
            <CheckboxItem 
              id="care-perfume-free" 
              label="Parfümsüz Ürün Tercih Eder" 
              checked={isArrayItemSelected(['careTreatments'], 'Parfümsüz Ürün Tercih Eder')} 
              onCheckedChange={() => toggleArrayItem(['careTreatments'], 'Parfümsüz Ürün Tercih Eder')}
              disabled={!editMode}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="care-notes">Bakım Notları</Label>
            <Textarea
              id="care-notes"
              placeholder="Bakım tercihleri hakkında notlar"
              value={preferences.custom_preferences?.careNotes || ""}
              onChange={(e) => updateCustomPreference(['careNotes'], e.target.value)}
              disabled={!editMode}
              className="min-h-[80px]"
            />
          </div>
        </div>
        
        <Separator />
        
        {/* 6. Saç Uzunluğu & Hedefi */}
        <div className="space-y-4">
          <h4 className="font-medium text-base border-l-4 border-purple-500 pl-2">Saç Uzunluğu & Hedefi</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hair-length">Şu Anki Saç Uzunluğu</Label>
              <Select
                value={preferences.custom_preferences?.hairLength || ""}
                onValueChange={(value) => updateCustomPreference(['hairLength'], value)}
                disabled={!editMode}
              >
                <SelectTrigger id="hair-length">
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kısa">Kısa</SelectItem>
                  <SelectItem value="orta">Orta</SelectItem>
                  <SelectItem value="uzun">Uzun</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hair-goal">Saç Hedefi</Label>
              <Select
                value={preferences.custom_preferences?.hairGoal || ""}
                onValueChange={(value) => updateCustomPreference(['hairGoal'], value)}
                disabled={!editMode}
              >
                <SelectTrigger id="hair-goal">
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uzatmak">Uzatmak İstiyor</SelectItem>
                  <SelectItem value="kestirmek">Düzenli Kestiriyor</SelectItem>
                  <SelectItem value="mevcut-korumak">Mevcut Uzunluğu Korumak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="haircut-notes">Saç Kesimi Notları</Label>
            <Input
              id="haircut-notes"
              placeholder="Örn: Saç uçları kesilmesin ister"
              value={preferences.custom_preferences?.hairCutNotes || ""}
              onChange={(e) => updateCustomPreference(['hairCutNotes'], e.target.value)}
              disabled={!editMode}
            />
          </div>
        </div>
        
        <Separator />
        
        {/* 7. Kaş/Bıyık/İpek Kirpik Tercihleri */}
        <div className="space-y-4">
          <h4 className="font-medium text-base border-l-4 border-purple-500 pl-2">Yüz Bakım Tercihleri</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <CheckboxItem 
              id="facial-eyebrow" 
              label="Kaş Aldırır" 
              checked={isArrayItemSelected(['facialTreatments'], 'Kaş Aldırır')} 
              onCheckedChange={() => toggleArrayItem(['facialTreatments'], 'Kaş Aldırır')}
              disabled={!editMode}
            />
            <CheckboxItem 
              id="facial-mustache" 
              label="Bıyık Temizliği İster" 
              checked={isArrayItemSelected(['facialTreatments'], 'Bıyık Temizliği İster')} 
              onCheckedChange={() => toggleArrayItem(['facialTreatments'], 'Bıyık Temizliği İster')}
              disabled={!editMode}
            />
            <CheckboxItem 
              id="facial-wax" 
              label="Sir Ağda Yaptırır" 
              checked={isArrayItemSelected(['facialTreatments'], 'Sir Ağda Yaptırır')} 
              onCheckedChange={() => toggleArrayItem(['facialTreatments'], 'Sir Ağda Yaptırır')}
              disabled={!editMode}
            />
            <CheckboxItem 
              id="facial-lashes" 
              label="Kirpik Uzatma / İpek Kirpik Tercihi" 
              checked={isArrayItemSelected(['facialTreatments'], 'Kirpik Uzatma / İpek Kirpik Tercihi')} 
              onCheckedChange={() => toggleArrayItem(['facialTreatments'], 'Kirpik Uzatma / İpek Kirpik Tercihi')}
              disabled={!editMode}
            />
          </div>
        </div>
        
        <Separator />
        
        {/* 8. Hassasiyet / Alerji / Kısıtlar */}
        <div className="space-y-4">
          <h4 className="font-medium text-base border-l-4 border-purple-500 pl-2">Hassasiyet / Alerji / Kısıtlar</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <CheckboxItem 
              id="sensitivity-scalp" 
              label="Saç Derisi Hassasiyeti" 
              checked={isArrayItemSelected(['sensitivities'], 'Saç Derisi Hassasiyeti')} 
              onCheckedChange={() => toggleArrayItem(['sensitivities'], 'Saç Derisi Hassasiyeti')}
              disabled={!editMode}
            />
            <CheckboxItem 
              id="sensitivity-chemical" 
              label="Kimyasallara Alerji" 
              checked={isArrayItemSelected(['sensitivities'], 'Kimyasallara Alerji')} 
              onCheckedChange={() => toggleArrayItem(['sensitivities'], 'Kimyasallara Alerji')}
              disabled={!editMode}
            />
            <CheckboxItem 
              id="sensitivity-back" 
              label="Bel/Omurga Rahatsızlığı" 
              checked={isArrayItemSelected(['sensitivities'], 'Bel/Omurga Rahatsızlığı')} 
              onCheckedChange={() => toggleArrayItem(['sensitivities'], 'Bel/Omurga Rahatsızlığı')}
              disabled={!editMode}
            />
            <CheckboxItem 
              id="sensitivity-sitting" 
              label="Uzun Süre Oturamama" 
              checked={isArrayItemSelected(['sensitivities'], 'Uzun Süre Oturamama')} 
              onCheckedChange={() => toggleArrayItem(['sensitivities'], 'Uzun Süre Oturamama')}
              disabled={!editMode}
            />
            <CheckboxItem 
              id="sensitivity-smell" 
              label="Boya Kokusuna Hassasiyet" 
              checked={isArrayItemSelected(['sensitivities'], 'Boya Kokusuna Hassasiyet')} 
              onCheckedChange={() => toggleArrayItem(['sensitivities'], 'Boya Kokusuna Hassasiyet')}
              disabled={!editMode}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sensitivity-notes">Hassasiyet Notları</Label>
            <Textarea
              id="sensitivity-notes"
              placeholder="Müşterinin hassasiyetleri hakkında detayları notlar"
              value={preferences.custom_preferences?.sensitivityNotes || ""}
              onChange={(e) => updateCustomPreference(['sensitivityNotes'], e.target.value)}
              disabled={!editMode}
              className="min-h-[80px]"
            />
          </div>
        </div>
        
        <Separator />
        
        {/* 9. Serbest Notlar */}
        <div className="space-y-4">
          <h4 className="font-medium text-base border-l-4 border-purple-500 pl-2">Kuaför Gözlem Notları</h4>
          <div className="space-y-2">
            <Label htmlFor="observation-notes">Kuaför İçin Gözlem Notları</Label>
            <Textarea
              id="observation-notes"
              placeholder="Örn: 'Çok konuşkan', 'Sessiz ortam sever', 'Bekletilmekten hoşlanmaz'"
              value={preferences.custom_preferences?.observationNotes || ""}
              onChange={(e) => updateCustomPreference(['observationNotes'], e.target.value)}
              disabled={!editMode}
              className="min-h-[120px]"
            />
          </div>
        </div>
        
        {/* Kolonya ve Ustura Tercihleri */}
        <Separator />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Label htmlFor="cologne" className="font-medium">Kolonya Tercihi</Label>
            <Input
              id="cologne"
              placeholder="Limon, Lavanta, vb."
              value={preferences.cologne_preference || ""}
              onChange={(e) => setPreferences(prev => ({ ...prev, cologne_preference: e.target.value }))}
              disabled={!editMode}
            />
          </div>
          
          <div className="space-y-4">
            <Label htmlFor="razor" className="font-medium">Jilet/Ustura Tercihi</Label>
            <Input
              id="razor"
              placeholder="Jilet markası, ustura tipi, vb."
              value={preferences.razor_preference || ""}
              onChange={(e) => setPreferences(prev => ({ ...prev, razor_preference: e.target.value }))}
              disabled={!editMode}
            />
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="ear_burning" className="cursor-pointer font-medium">
              Kulak Yakma İster
            </Label>
            <Switch
              id="ear_burning"
              checked={preferences.ear_burning}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, ear_burning: checked }))}
              disabled={!editMode}
            />
          </div>
        </div>
        
        {editMode && (
          <div className="flex justify-end">
            <Button 
              onClick={handleSave}
              disabled={mutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {mutation.isPending ? "Kaydediliyor..." : "Tercihleri Kaydet"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
