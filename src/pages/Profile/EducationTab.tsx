
import { useState } from "react";
import { FormField } from "@/components/ui/form-elements";
import { LoadingButton } from "@/components/ui/loading-button";

export interface EducationTabProps {
  educationData?: any;
  updateEducation?: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export default function EducationTab({ 
  educationData = {}, 
  updateEducation = async () => {},
  isLoading = false 
}: EducationTabProps) {
  const [formData, setFormData] = useState({
    highestEducation: educationData.highestEducation || '',
    schoolName: educationData.schoolName || '',
    graduationYear: educationData.graduationYear || '',
    fieldOfStudy: educationData.fieldOfStudy || '',
    additionalCourses: educationData.additionalCourses || '',
    specialTrainings: educationData.specialTrainings || '',
    languages: educationData.languages || {
      english: educationData.languages?.english || '',
      german: educationData.languages?.german || '',
      french: educationData.languages?.french || '',
      spanish: educationData.languages?.spanish || '',
      other: educationData.languages?.other || ''
    },
    skills: educationData.skills || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle nested objects like languages
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      await updateEducation(formData);
    } catch (error) {
      console.error("Error updating education:", error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Eğitim Bilgileri</h2>
      
      <FormField
        id="highestEducation"
        label="En Yüksek Eğitim Seviyesi"
        placeholder="Örn: Lise, Üniversite, Master, vb."
        value={formData.highestEducation}
        onChange={handleChange}
      />
      
      <FormField
        id="schoolName"
        label="Okul/Kurum Adı"
        placeholder="Mezun olduğunuz okul"
        value={formData.schoolName}
        onChange={handleChange}
      />
      
      <FormField
        id="graduationYear"
        label="Mezuniyet Yılı"
        placeholder="Örn: 2015"
        type="number"
        value={formData.graduationYear}
        onChange={handleChange}
      />
      
      <FormField
        id="fieldOfStudy"
        label="Çalışma Alanı"
        placeholder="Örn: Kuaförlük, Güzellik Uzmanlığı, vb."
        value={formData.fieldOfStudy}
        onChange={handleChange}
      />
      
      <FormField
        id="additionalCourses"
        label="Ek Kurslar"
        placeholder="Katıldığınız ek kurslar"
        value={formData.additionalCourses}
        onChange={handleChange}
      />
      
      <FormField
        id="specialTrainings"
        label="Özel Eğitimler"
        placeholder="Aldığınız özel eğitimler"
        value={formData.specialTrainings}
        onChange={handleChange}
      />
      
      <h3 className="text-xl font-semibold">Yabancı Dil Bilgisi</h3>
      
      <FormField
        id="languages.english"
        label="İngilizce"
        placeholder="Seviyeniz (A1, A2, B1, B2, C1, C2)"
        value={formData.languages.english}
        onChange={handleChange}
      />
      
      <FormField
        id="languages.german"
        label="Almanca"
        placeholder="Seviyeniz (A1, A2, B1, B2, C1, C2)"
        value={formData.languages.german}
        onChange={handleChange}
      />
      
      <FormField
        id="languages.french"
        label="Fransızca"
        placeholder="Seviyeniz (A1, A2, B1, B2, C1, C2)"
        value={formData.languages.french}
        onChange={handleChange}
      />
      
      <FormField
        id="languages.spanish"
        label="İspanyolca"
        placeholder="Seviyeniz (A1, A2, B1, B2, C1, C2)"
        value={formData.languages.spanish}
        onChange={handleChange}
      />
      
      <FormField
        id="languages.other"
        label="Diğer"
        placeholder="Diğer diller ve seviyeleri"
        value={formData.languages.other}
        onChange={handleChange}
      />
      
      <FormField
        id="skills"
        label="Beceriler"
        placeholder="Sahip olduğunuz diğer beceriler"
        value={formData.skills}
        onChange={handleChange}
      />
      
      <div className="flex justify-end">
        <LoadingButton 
          onClick={handleSubmit} 
          loading={isLoading}
        >
          Kaydet
        </LoadingButton>
      </div>
    </div>
  );
}
