
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { School, BookOpen, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

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
  isLoading
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [localData, setLocalData] = useState<EducationData>(educationData);
  const [savingData, setSavingData] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
  useEffect(() => {
    let step = 1;
    if (educationData.ortaokuldurumu === "Mezun") step = 2;
    if (educationData.lisedurumu === "Mezun") step = 3;
    if (educationData.liseturu && ["Çok Programlı Anadolu Lisesi", "Mesleki ve Teknik Anadolu Lisesi"].includes(educationData.liseturu)) step = 4;
    if (educationData.universitedurumu && ["Mezun", "Devam Ediyor"].includes(educationData.universitedurumu)) step = 5;
    
    setCurrentStep(step);
    setLocalData(educationData);
    setIsDirty(false);
  }, [educationData]);

  const handleChange = async (field: keyof EducationData, value: string) => {
    let newData = { ...localData, [field]: value };
    
    if (field === 'liseturu' && !["Çok Programlı Anadolu Lisesi", "Mesleki ve Teknik Anadolu Lisesi"].includes(value)) {
      newData.meslekibrans = "";
    }
    
    if (field === 'meslekibrans') {
      // Only allow letters and spaces
      if (!/^[A-Za-zğüşıöçĞÜŞİÖÇ\s]*$/.test(value)) return;
    }
    
    setLocalData(newData);
    setIsDirty(true);
    
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
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setSavingData(true);
      await onSave(localData);
      toast.success("Eğitim bilgileriniz başarıyla kaydedildi");
      setIsDirty(false);
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Bilgiler kaydedilirken bir hata oluştu");
    } finally {
      setSavingData(false);
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
            {localData.ortaokuldurumu && (
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
                    {statusOptions.map((option) => (
                      <SelectItem key={`lise-${option}`} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Step 3: Lise Türü */}
            {localData.lisedurumu && (
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
            {localData.liseturu && 
              ['Çok Programlı Anadolu Lisesi', 'Mesleki ve Teknik Anadolu Lisesi']
                .includes(localData.liseturu) && (
              <div className="grid gap-2">
                <label className="text-sm font-medium">Mesleki Branş</label>
                <Input
                  value={localData.meslekibrans}
                  onChange={(e) => handleChange("meslekibrans", e.target.value)}
                  placeholder="Örneğin: Kuaförlük, Berberlik, Güzellik Uzmanlığı..."
                  className="text-gray-900"
                />
              </div>
            )}
            
            {/* Step 5: Üniversite Durumu */}
            {localData.lisedurumu && (
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
                    {statusOptions.map((option) => (
                      <SelectItem key={`uni-${option}`} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Step 6: Üniversite Bölümü */}
            {localData.universitedurumu && ['Mezun', 'Devam Ediyor'].includes(localData.universitedurumu) && (
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
                    {DEPARTMENTS.map((dept) => (
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
                onEducationChange(resetData);
                setIsDirty(true);
              }}
            >
              Temizle
            </Button>
            <LoadingButton
              type="submit"
              loading={savingData}
              disabled={!isDirty || savingData}
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
