
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { School, BookOpen, GraduationCap } from "lucide-react";

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

const statusOptions = ["Mezun", "Devam Ediyor", "Terk", "Tamamlanmadı"];

const EducationTab: React.FC<EducationTabProps> = ({
  educationData,
  onEducationChange,
  onSave,
  isLoading,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  const handleChange = (field: keyof EducationData, value: string) => {
    const newData = { ...educationData, [field]: value };
    onEducationChange(newData);
    
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
      await onSave(educationData);
    } catch (error) {
      console.error("Save error:", error);
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
                  value={educationData.ortaokuldurumu}
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
                  value={educationData.lisedurumu}
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
            {currentStep >= 3 && (
              <div className="grid gap-2 pt-4 border-t border-gray-100">
                <label className="text-sm font-medium">Lise Türü</label>
                <Select
                  value={educationData.liseturu}
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
                .includes(educationData.liseturu) && (
              <div className="grid gap-2">
                <label className="text-sm font-medium">Mesleki Branş</label>
                <Select
                  value={educationData.meslekibrans}
                  onValueChange={(value) => handleChange("meslekibrans", value)}
                >
                  <SelectTrigger className="text-gray-900">
                    <SelectValue placeholder="Branş seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((branch) => (
                      <SelectItem key={`branch-${branch}`} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
            
            {/* Step 5: Üniversite Durumu */}
            {currentStep >= 5 && (
              <div className="grid gap-2 pt-4 border-t border-gray-100">
                <label className="text-sm font-medium flex items-center gap-2">
                  <GraduationCap size={16} />
                  Üniversite Durumu
                </label>
                <Select
                  value={educationData.universitedurumu}
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
            {currentStep >= 5 && ['Mezun', 'Devam Ediyor'].includes(educationData.universitedurumu) && (
              <div className="grid gap-2 pt-4 border-t border-gray-100">
                <label className="text-sm font-medium">Üniversite Bölümü</label>
                <Select
                  value={educationData.universitebolum}
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
              onClick={() => {
                setCurrentStep(1);
                onEducationChange({
                  ortaokuldurumu: "",
                  lisedurumu: "",
                  liseturu: "",
                  meslekibrans: "",
                  universitedurumu: "",
                  universitebolum: ""
                });
              }}
            >
              İptal
            </Button>
            <LoadingButton
              type="submit"
              loading={isLoading}
              disabled={isLoading}
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
