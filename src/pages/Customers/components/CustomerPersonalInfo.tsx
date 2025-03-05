
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, PlusCircle, X, Save } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Musteri } from "@/lib/supabase";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CustomerPersonalInfoProps {
  customerId: string;
  customer: Musteri;
  editMode: boolean;
}

interface CustomerPersonalData {
  id?: number;
  customer_id: string;
  birth_date?: string | null;
  anniversary_date?: string | null;
  children_names?: string[] | null;
  horoscope?: string | null;
  horoscope_description?: string | null;
  custom_notes?: string | null;
}

// Helper function to determine horoscope from birth date
function getHoroscope(birthDate: Date | null): string {
  if (!birthDate) return '';
  
  const day = birthDate.getDate();
  const month = birthDate.getMonth() + 1; // getMonth is zero-based
  
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "kova";
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "balık";
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "koç";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "boğa";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "ikizler";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "yengeç";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "aslan";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "başak";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "terazi";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "akrep";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "yay";
  return "oğlak";
}

// Helper function to convert horoscope to displayable name
function getHoroscopeName(horoscope: string): string {
  const horoscopeMap: Record<string, string> = {
    'koç': 'Koç',
    'boğa': 'Boğa',
    'ikizler': 'İkizler',
    'yengeç': 'Yengeç',
    'aslan': 'Aslan',
    'başak': 'Başak',
    'terazi': 'Terazi',
    'akrep': 'Akrep',
    'yay': 'Yay',
    'oğlak': 'Oğlak',
    'kova': 'Kova',
    'balık': 'Balık'
  };
  
  return horoscopeMap[horoscope] || horoscope;
}

export function CustomerPersonalInfo({ customerId, customer, editMode }: CustomerPersonalInfoProps) {
  const queryClient = useQueryClient();
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [anniversaryDate, setAnniversaryDate] = useState<Date | undefined>(undefined);
  const [horoscope, setHoroscope] = useState("");
  const [horoscopeDescription, setHoroscopeDescription] = useState("");
  const [childrenNames, setChildrenNames] = useState<string[]>([]);
  const [newChildName, setNewChildName] = useState("");
  const [customNotes, setCustomNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch daily horoscope
  useEffect(() => {
    if (horoscope) {
      const fetchHoroscope = async () => {
        try {
          // For demonstration purposes, we'll use a placeholder horoscope description
          // In production, you would fetch this from the actual API
          setHoroscopeDescription("Bugün kendinizi enerjik ve yaratıcı hissedebilirsiniz. İş hayatında olumlu gelişmeler yaşanabilir.");
          
          // Actual API integration would be like this:
          // const response = await fetch(`https://api.example.com/horoscope/${horoscope}/today`);
          // const data = await response.json();
          // setHoroscopeDescription(data.description);
        } catch (error) {
          console.error("Error fetching horoscope:", error);
          setHoroscopeDescription("Horoscope bilgisi şu anda yüklenemiyor.");
        }
      };
      
      fetchHoroscope();
    }
  }, [horoscope]);

  // Fetch customer personal data
  const { data: personalData, isLoading: isDataLoading } = useQuery({
    queryKey: ['customerPersonalData', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_personal_data')
        .select('*')
        .eq('customer_id', customerId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data as CustomerPersonalData | null;
    }
  });

  // Setup mutation for saving data
  const { mutate: savePersonalData } = useMutation({
    mutationFn: async (data: CustomerPersonalData) => {
      if (personalData?.id) {
        const { data: updated, error } = await supabase
          .from('customer_personal_data')
          .update(data)
          .eq('id', personalData.id)
          .select()
          .single();
          
        if (error) throw error;
        return updated;
      } else {
        const { data: created, error } = await supabase
          .from('customer_personal_data')
          .insert([data])
          .select()
          .single();
          
        if (error) throw error;
        return created;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerPersonalData', customerId] });
      toast({
        title: "Başarılı",
        description: "Kişisel bilgiler kaydedildi.",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Kişisel bilgiler kaydedilirken bir hata oluştu.",
        variant: "destructive",
      });
      console.error("Save error:", error);
    }
  });

  // Initialize form with fetched data
  useEffect(() => {
    if (personalData) {
      if (personalData.birth_date) {
        setBirthDate(new Date(personalData.birth_date));
        const horoscopeSign = getHoroscope(new Date(personalData.birth_date));
        setHoroscope(horoscopeSign);
      }
      
      if (personalData.anniversary_date) {
        setAnniversaryDate(new Date(personalData.anniversary_date));
      }
      
      if (personalData.children_names && Array.isArray(personalData.children_names)) {
        setChildrenNames(personalData.children_names);
      }
      
      if (personalData.custom_notes) {
        setCustomNotes(personalData.custom_notes);
      }
    }
  }, [personalData]);

  // Update horoscope when birth date changes
  useEffect(() => {
    if (birthDate) {
      const horoscopeSign = getHoroscope(birthDate);
      setHoroscope(horoscopeSign);
    }
  }, [birthDate]);

  const handleAddChild = () => {
    if (newChildName.trim()) {
      setChildrenNames([...childrenNames, newChildName.trim()]);
      setNewChildName("");
    }
  };

  const handleRemoveChild = (index: number) => {
    const updatedChildren = [...childrenNames];
    updatedChildren.splice(index, 1);
    setChildrenNames(updatedChildren);
  };

  const handleSave = () => {
    setIsLoading(true);
    
    const newData: CustomerPersonalData = {
      customer_id: customerId,
      birth_date: birthDate ? format(birthDate, 'yyyy-MM-dd') : null,
      anniversary_date: anniversaryDate ? format(anniversaryDate, 'yyyy-MM-dd') : null,
      children_names: childrenNames.length > 0 ? childrenNames : null,
      horoscope: horoscope || null,
      horoscope_description: horoscopeDescription || null,
      custom_notes: customNotes || null
    };
    
    savePersonalData(newData);
    setIsLoading(false);
  };

  if (isDataLoading) {
    return <div className="p-4 text-center">Yükleniyor...</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium border-b pb-2">Temel Bilgiler</h3>
          
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
                  disabled={!editMode}
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
                  disabled={!editMode}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="anniversary">Evlilik Yıldönümü</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="anniversary"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !anniversaryDate && "text-muted-foreground"
                  )}
                  disabled={!editMode}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {anniversaryDate ? format(anniversaryDate, "dd/MM/yyyy") : "Tarih seçiniz"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={anniversaryDate}
                  onSelect={setAnniversaryDate}
                  disabled={!editMode}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="children">Çocukların İsimleri</Label>
            {childrenNames.length > 0 ? (
              <div className="space-y-2 mb-2">
                {childrenNames.map((name, index) => (
                  <div key={index} className="flex items-center justify-between border p-2 rounded">
                    <span>{name}</span>
                    {editMode && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveChild(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Henüz çocuk eklenmemiş.</p>
            )}
            
            {editMode && (
              <div className="flex gap-2 mt-2">
                <Input
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  placeholder="Çocuk adı girin"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddChild}
                  className="flex-shrink-0"
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Ekle
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium border-b pb-2">Burç Bilgileri</h3>
          
          {birthDate ? (
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-gray-500">BURÇ</Label>
                <p className="font-medium text-lg">{getHoroscopeName(horoscope)}</p>
              </div>
              
              <div>
                <Label className="text-sm text-gray-500">GÜNLÜK BURÇ YORUMU</Label>
                <div className="mt-1 p-3 border rounded-md bg-gray-50">
                  <p className="italic">{horoscopeDescription || "Burç yorumu yüklenemedi."}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Burç bilgisi için doğum tarihi girmelisiniz.</p>
            </div>
          )}

          <div className="mt-6 space-y-2">
            <Label htmlFor="notes">Özel Notlar</Label>
            <textarea
              id="notes"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              disabled={!editMode}
              className="w-full min-h-[120px] p-2 border rounded-md"
              placeholder="Müşteri hakkında özel notlar..."
            />
          </div>
        </div>
      </div>

      {editMode && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isLoading} className="gap-1">
            <Save className="h-4 w-4" />
            {isLoading ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      )}
    </div>
  );
}
