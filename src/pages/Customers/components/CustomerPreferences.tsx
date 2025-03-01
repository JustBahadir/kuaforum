import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Gift, Scissors, Droplet, Flame } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface CustomerPreference {
  id?: number;
  customer_id: string;
  birth_date?: string | null;
  special_date?: string | null;
  special_date_description?: string | null;
  cologne_preference?: string | null;
  razor_preference?: string | null;
  ear_burning?: boolean;
  custom_preferences?: Record<string, string | boolean> | null;
}

interface CustomerPreferencesProps {
  customerId: string;
}

export function CustomerPreferences({ customerId }: CustomerPreferencesProps) {
  const queryClient = useQueryClient();
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [specialDate, setSpecialDate] = useState<Date | undefined>(undefined);
  const [specialDateDesc, setSpecialDateDesc] = useState("");
  const [colognePreference, setColognePreference] = useState("");
  const [razorPreference, setRazorPreference] = useState("");
  const [earBurning, setEarBurning] = useState(false);
  const [customPreferences, setCustomPreferences] = useState<Record<string, string | boolean>>({});
  const [newCustomPreferenceKey, setNewCustomPreferenceKey] = useState("");
  const [newCustomPreferenceValue, setNewCustomPreferenceValue] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['customerPreferences', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_preferences')
        .select('*')
        .eq('customer_id', customerId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data as CustomerPreference | null;
    }
  });

  const { mutate: savePreferences, isPending: isSaving } = useMutation({
    mutationFn: async (newPreferences: CustomerPreference) => {
      if (preferences?.id) {
        const { data, error } = await supabase
          .from('customer_preferences')
          .update(newPreferences)
          .eq('id', preferences.id)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('customer_preferences')
          .insert([newPreferences])
          .select()
          .single();
          
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerPreferences', customerId] });
      toast({
        title: "Başarılı",
        description: "Müşteri tercihleri kaydedildi.",
      });
      setIsEditMode(false);
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Müşteri tercihleri kaydedilirken bir hata oluştu.",
        variant: "destructive",
      });
      console.error("Preferences save error:", error);
    }
  });

  useEffect(() => {
    if (preferences) {
      if (preferences.birth_date) {
        setBirthDate(new Date(preferences.birth_date));
      }
      if (preferences.special_date) {
        setSpecialDate(new Date(preferences.special_date));
      }
      setSpecialDateDesc(preferences.special_date_description || "");
      setColognePreference(preferences.cologne_preference || "");
      setRazorPreference(preferences.razor_preference || "");
      setEarBurning(preferences.ear_burning || false);
      setCustomPreferences(preferences.custom_preferences || {});
    }
  }, [preferences]);

  const handleSave = () => {
    const newPreferences: CustomerPreference = {
      customer_id: customerId,
      birth_date: birthDate ? format(birthDate, 'yyyy-MM-dd') : null,
      special_date: specialDate ? format(specialDate, 'yyyy-MM-dd') : null,
      special_date_description: specialDateDesc || null,
      cologne_preference: colognePreference || null,
      razor_preference: razorPreference || null,
      ear_burning: earBurning,
      custom_preferences: Object.keys(customPreferences).length > 0 ? customPreferences : null
    };
    
    savePreferences(newPreferences);
  };

  const handleAddCustomPreference = () => {
    if (newCustomPreferenceKey.trim() && newCustomPreferenceValue.trim()) {
      setCustomPreferences(prev => ({
        ...prev,
        [newCustomPreferenceKey]: newCustomPreferenceValue
      }));
      setNewCustomPreferenceKey("");
      setNewCustomPreferenceValue("");
    }
  };

  const handleRemoveCustomPreference = (key: string) => {
    setCustomPreferences(prev => {
      const newPrefs = { ...prev };
      delete newPrefs[key];
      return newPrefs;
    });
  };

  if (isLoading) {
    return <div className="p-4 text-center">Yükleniyor...</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Kişisel Tercihler</h3>
        {!isEditMode ? (
          <Button onClick={() => setIsEditMode(true)}>Düzenle</Button>
        ) : (
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setIsEditMode(false)}>İptal</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4 border p-4 rounded-md">
          <h4 className="font-medium flex items-center">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Kişisel Bilgiler
          </h4>
          
          <div className="space-y-2">
            <Label htmlFor="birthdate">Doğum Tarihi</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="birthdate"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !birthDate && "text-muted-foreground"
                  )}
                  disabled={!isEditMode}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {birthDate ? format(birthDate, "dd/MM/yyyy") : "Tarih seçiniz"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={birthDate}
                  onSelect={setBirthDate}
                  disabled={!isEditMode}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialdate">Özel Gün</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="specialdate"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !specialDate && "text-muted-foreground"
                  )}
                  disabled={!isEditMode}
                >
                  <Gift className="mr-2 h-4 w-4" />
                  {specialDate ? format(specialDate, "dd/MM/yyyy") : "Tarih seçiniz"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={specialDate}
                  onSelect={setSpecialDate}
                  disabled={!isEditMode}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialdatedesc">Özel Gün Açıklaması</Label>
            <Input
              id="specialdatedesc"
              placeholder="Örn: Evlilik Yıldönümü"
              value={specialDateDesc}
              onChange={(e) => setSpecialDateDesc(e.target.value)}
              disabled={!isEditMode}
            />
          </div>
        </div>

        <div className="space-y-4 border p-4 rounded-md">
          <h4 className="font-medium flex items-center">
            <Scissors className="mr-2 h-4 w-4" />
            Traş Tercihleri
          </h4>
          
          <div className="space-y-2">
            <Label htmlFor="cologne">Traş Kolonyası Tercihi</Label>
            <Select
              value={colognePreference}
              onValueChange={setColognePreference}
              disabled={!isEditMode}
            >
              <SelectTrigger id="cologne" className="w-full">
                <SelectValue placeholder="Seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="limon">Limon</SelectItem>
                <SelectItem value="tütün">Tütün</SelectItem>
                <SelectItem value="lavanta">Lavanta</SelectItem>
                <SelectItem value="odun">Odun</SelectItem>
                <SelectItem value="yok">Kolonya İstemiyorum</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="razor">Jilet/Ustura Tercihi</Label>
            <Select
              value={razorPreference}
              onValueChange={setRazorPreference}
              disabled={!isEditMode}
            >
              <SelectTrigger id="razor" className="w-full">
                <SelectValue placeholder="Seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jilet">Jilet</SelectItem>
                <SelectItem value="ustura">Ustura</SelectItem>
                <SelectItem value="makas">Sadece Makas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="ear-burning"
              checked={earBurning}
              onCheckedChange={setEarBurning}
              disabled={!isEditMode}
            />
            <Label htmlFor="ear-burning" className="flex items-center">
              <Flame className="mr-2 h-4 w-4 text-orange-500" />
              Kulak Yakma Tercihi
            </Label>
          </div>
        </div>
      </div>

      <div className="border p-4 rounded-md">
        <h4 className="font-medium mb-4">Özel Tercihler</h4>
        
        {Object.entries(customPreferences).length > 0 ? (
          <div className="space-y-2 mb-4">
            {Object.entries(customPreferences).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between border p-2 rounded">
                <div>
                  <span className="font-medium">{key}: </span>
                  <span>{value.toString()}</span>
                </div>
                {isEditMode && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemoveCustomPreference(key)}
                  >
                    Kaldır
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground mb-4">Henüz özel tercih eklenmemiş.</div>
        )}
        
        {isEditMode && (
          <div className="border-t pt-4">
            <h5 className="text-sm font-medium mb-2">Yeni Özel Tercih Ekle</h5>
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  placeholder="Tercih Adı (Örn: Saç Kremi)"
                  value={newCustomPreferenceKey}
                  onChange={(e) => setNewCustomPreferenceKey(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Input
                  placeholder="Değer (Örn: Argan Yağlı)"
                  value={newCustomPreferenceValue}
                  onChange={(e) => setNewCustomPreferenceValue(e.target.value)}
                />
              </div>
              <Button onClick={handleAddCustomPreference}>Ekle</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
