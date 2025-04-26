
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { School, BookOpen, GraduationCap } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

interface EducationData {
  ortaokuldurumu: string;
  lisedurumu: string;
  liseturu: string;
  meslekibrans: string;
  universitedurumu: string;
  universitebolum: string;
}

interface EducationTabProps {
  educationData: EducationData;
  onEducationChange: (data: EducationData) => void;
  onSave: (data: EducationData) => Promise<void>;
  isLoading: boolean;
}

const HIGH_SCHOOL_TYPES = [
  "Fen Lisesi",
  "Sosyal Bilimler Lisesi",
  "Anadolu Lisesi",
  "Güzel Sanatlar Lisesi",
  "Spor Lisesi",
  "Anadolu İmam Hatip Lisesi",
  "Çok Programlı Anadolu Lisesi",
  "Mesleki ve Teknik Anadolu Lisesi",
  "Akşam Lisesi",
  "Açık Öğretim Lisesi"
];

const DEPARTMENTS = [
  "Saç Bakımı ve Güzellik Hizmetleri",
  "Diğer"
];

const statusOptions = ["Mezun", "Devam Ediyor", "Tamamlanmadı"];

const EducationTab: React.FC<EducationTabProps> = ({
  educationData,
  onEducationChange,
  onSave,
  isLoading,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [localData, setLocalData] = useState<EducationData>(educationData);
  const [savingData, setSavingData] = useState(false);
  
  // Initialize step based on existing data
  useEffect(() => {
    let step = 1;
    
    if (educationData.ortaokuldurumu === "Mezun") {
      step = 2;
    }
    
    if (educationData.lisedurumu === "Mezun") {
      step = 3;
    }
    
    if (educationData.liseturu && ["Çok Programlı Anadolu Lisesi", "Mesleki ve Teknik Anadolu Lisesi"].includes(educationData.liseturu)) {
      step = 4;
    }
    
    if (educationData.universitedurumu && ["Mezun", "Devam Ediyor"].includes(educationData.universitedurumu)) {
      step = 5;
    }
    
    setCurrentStep(step);
    setLocalData(educationData);
  }, [educationData]);
  
  const handleChange = async (field: keyof EducationData, value: string) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
    
    // Handle step progression
    if (field === 'ortaokuldurumu' && value === 'Mezun') {
      setCurrentStep(Math.max(currentStep, 2));
    } else if (field === 'lisedurumu' && value === 'Mezun') {
      setCurrentStep(Math.max(currentStep, 3));
    } else if (field === 'liseturu' && 
      (value === 'Çok Programlı Anadolu Lisesi' || value === 'Mesleki ve Teknik Anadolu Lisesi')) {
      setCurrentStep(Math.max(currentStep, 4));
    } else if (field === 'universitedurumu' && (value === 'Mezun' || value === 'Devam Ediyor')) {
      setCurrentStep(Math.max(currentStep, 5));
    }
    
    // Save data to database directly
    await saveEducationData(updatedData);
  };

  const saveEducationData = async (data: EducationData) => {
    setSavingData(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: personelData } = await supabase
          .from('personel')
          .select('id')
          .eq('auth_id', user.id)
          .maybeSingle();
          
        if (personelData) {
          await supabase
            .from('staff_education')
            .upsert(
              {
                personel_id: personelData.id,
                ...data,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'personel_id' }
            );
            
          // Update local state
          onEducationChange(data);
          toast.success("Eğitim bilgileri kaydedildi");
        } else {
          await createPersonelRecord(user.id, data);
        }
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Eğitim bilgileri kaydedilirken bir hata oluştu");
    } finally {
      setSavingData(false);
    }
  };
  
  // Helper function to create personel record if it doesn't exist
  const createPersonelRecord = async (authId: string, data: EducationData) => {
    try {
      // Get profile data for new personel record
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone, address, avatar_url')
        .eq('id', authId)
        .single();
      
      // Create basic personel record
      const { data: newPersonel, error: createError } = await supabase
        .from('personel')
        .insert([{
          auth_id: authId,
          ad_soyad: profileData ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() : 'Çalışan',
          telefon: profileData?.phone || '-',
          eposta: '-',
          adres: profileData?.address || '-',
          personel_no: `P${Date.now().toString().substring(8)}`,
          calisma_sistemi: 'Tam Zamanlı',
          maas: 0,
          prim_yuzdesi: 0,
          avatar_url: profileData?.avatar_url || null
        }])
        .select('id');

      if (createError) {
        throw createError;
      }
      
      if (newPersonel && newPersonel.length > 0) {
        // Now insert education with the new personel ID
        await supabase
          .from('staff_education')
          .insert([{
            personel_id: newPersonel[0].id,
            ...data
          }]);
          
        toast.success("Eğitim bilgileri kaydedildi");
      }
    } catch (error) {
      console.error("Error creating personel record:", error);
      toast.error("Bilgiler kaydedilirken bir hata oluştu");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await saveEducationData(localData);
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Eğitim bilgileri kaydedilirken bir hata oluştu");
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <School size={18} />
              Eğitim Bilgileri
            </h3>
            
            {/* Step 1: Ortaokul Durumu */}
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Ortaokul Durumu</label>
                <Select
                  value={localData.ortaokuldurumu}
                  onValueChange={(value) => handleChange("ortaokuldurumu", value)}
                >
                  <SelectTrigger className="text-gray-900">
                    <SelectValue placeholder="Ortaokul durumu seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={`ortaokul-${option}`} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Step 2: Lise Durumu */}
            {currentStep >= 2 && (
              <div className="grid gap-2 pt-4 border-t border-gray-100">
                <label className="text-sm font-medium flex items-center gap-2">
                  <BookOpen size={16} />
                  Lise Durumu
                </label>
                <Select
                  value={localData.lisedurumu}
                  onValueChange={(value) => handleChange("lisedurumu", value)}
                >
                  <SelectTrigger className="text-gray-900">
                    <SelectValue placeholder="Lise durumu seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.filter(option => option !== "Terk").map((option) => (
                      <SelectItem key={`lise-${option}`} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Step 3: Lise Türü */}
            {currentStep >= 3 && (
              <div className="grid gap-2 pt-4 border-t border-gray-100">
                <label className="text-sm font-medium">Lise Türü</label>
                <Select
                  value={localData.liseturu}
                  onValueChange={(value) => handleChange("liseturu", value)}
                >
                  <SelectTrigger className="text-gray-900">
                    <SelectValue placeholder="Lise türü seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {HIGH_SCHOOL_TYPES.map((type) => (
                      <SelectItem key={`type-${type}`} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Step 4: Mesleki Branş (only for specific high school types) */}
            {currentStep >= 4 && (
              ['Çok Programlı Anadolu Lisesi', 'Mesleki ve Teknik Anadolu Lisesi']
                .includes(localData.liseturu) && (
              <div className="grid gap-2">
                <label className="text-sm font-medium">Mesleki Branş</label>
                <Select
                  value={localData.meslekibrans}
                  onValueChange={(value) => handleChange("meslekibrans", value)}
                >
                  <SelectTrigger className="text-gray-900">
                    <SelectValue placeholder="Branş seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Saç Bakımı ve Güzellik Hizmetleri", "Diğer"].map((branch) => (
                      <SelectItem key={`branch-${branch}`} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
            
            {/* Step 5: Üniversite Durumu */}
            {currentStep >= 3 && (
              <div className="grid gap-2 pt-4 border-t border-gray-100">
                <label className="text-sm font-medium flex items-center gap-2">
                  <GraduationCap size={16} />
                  Üniversite Durumu
                </label>
                <Select
                  value={localData.universitedurumu}
                  onValueChange={(value) => handleChange("universitedurumu", value)}
                >
                  <SelectTrigger className="text-gray-900">
                    <SelectValue placeholder="Üniversite durumu seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.filter(option => option !== "Terk").map((option) => (
                      <SelectItem key={`uni-${option}`} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Step 6: Üniversite Bölümü */}
            {currentStep >= 3 && ['Mezun', 'Devam Ediyor'].includes(localData.universitedurumu) && (
              <div className="grid gap-2 pt-4 border-t border-gray-100">
                <label className="text-sm font-medium">Üniversite Bölümü</label>
                <Select
                  value={localData.universitebolum}
                  onValueChange={(value) => handleChange("universitebolum", value)}
                >
                  <SelectTrigger className="text-gray-900">
                    <SelectValue placeholder="Bölüm seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Saç Bakımı ve Güzellik Hizmetleri", "Diğer"].map((dept) => (
                      <SelectItem key={`dept-${dept}`} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button" 
              variant="outline"
              onClick={async () => {
                const resetData = {
                  ortaokuldurumu: "",
                  lisedurumu: "",
                  liseturu: "",
                  meslekibrans: "",
                  universitedurumu: "",
                  universitebolum: ""
                };
                setLocalData(resetData);
                setCurrentStep(1);
                await saveEducationData(resetData);
              }}
            >
              Temizle
            </Button>
            <LoadingButton
              type="submit"
              loading={savingData || isLoading}
              disabled={savingData || isLoading}
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              Kaydet
            </LoadingButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EducationTab;
