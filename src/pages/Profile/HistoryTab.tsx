
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-elements";
import { LoadingButton } from "@/components/ui/loading-button";

export interface HistoryTabProps {
  historyData?: any;
  updateHistory?: (data: any) => Promise<void>;
  isLoading?: boolean;
  uploadCv?: (file: File) => Promise<void>;
}

export default function HistoryTab({ 
  historyData = {}, 
  updateHistory = async () => {}, 
  isLoading = false,
  uploadCv = async () => {}
}: HistoryTabProps) {
  const [formData, setFormData] = useState({
    experience: historyData.experience || '',
    certifications: historyData.certifications || '',
    competitions: historyData.competitions || '',
    socialMediaLinks: historyData.socialMediaLinks || { 
      instagram: '', 
      facebook: '', 
      twitter: '',
      youtube: '',
      tiktok: ''
    },
    previousWorkplace: historyData.previousWorkplace || '',
    specialties: historyData.specialties || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle nested objects like socialMediaLinks
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
      await updateHistory(formData);
    } catch (error) {
      console.error("Error updating history:", error);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    try {
      const file = e.target.files[0];
      await uploadCv(file);
    } catch (error) {
      console.error("Error uploading CV:", error);
    }
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">İş Geçmişi</h2>
      
      <FormField
        id="experience"
        label="Deneyim"
        placeholder="Yıl olarak deneyiminiz"
        value={formData.experience}
        onChange={handleChange}
      />
      
      <FormField
        id="certifications"
        label="Sertifikalar"
        placeholder="Sahip olduğunuz sertifikalar"
        value={formData.certifications}
        onChange={handleChange}
      />
      
      <FormField
        id="competitions"
        label="Katıldığınız Yarışmalar"
        placeholder="Ödül aldığınız ya da katıldığınız yarışmalar"
        value={formData.competitions}
        onChange={handleChange}
      />

      <FormField
        id="previousWorkplace"
        label="Önceki İş Yeri"
        placeholder="Daha önce çalıştığınız yer"
        value={formData.previousWorkplace}
        onChange={handleChange}
      />

      <FormField
        id="specialties"
        label="Uzmanlık Alanları"
        placeholder="Uzmanlık alanlarınız (örn: Renklendirme, Kesim, vb.)"
        value={formData.specialties}
        onChange={handleChange}
      />
      
      <h3 className="text-xl font-semibold">Sosyal Medya</h3>
      
      <FormField
        id="socialMediaLinks.instagram"
        label="Instagram"
        placeholder="Instagram kullanıcı adınız"
        value={formData.socialMediaLinks.instagram}
        onChange={handleChange}
      />
      
      <FormField
        id="socialMediaLinks.facebook"
        label="Facebook"
        placeholder="Facebook kullanıcı adınız"
        value={formData.socialMediaLinks.facebook}
        onChange={handleChange}
      />
      
      <FormField
        id="socialMediaLinks.youtube"
        label="Youtube"
        placeholder="Youtube kanalınız"
        value={formData.socialMediaLinks.youtube}
        onChange={handleChange}
      />
      
      <FormField
        id="socialMediaLinks.tiktok"
        label="TikTok"
        placeholder="TikTok kullanıcı adınız"
        value={formData.socialMediaLinks.tiktok}
        onChange={handleChange}
      />
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">CV Yükle</label>
        <Input type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
        <p className="text-xs text-gray-500">PDF, DOC veya DOCX formatında CV'nizi yükleyin</p>
      </div>

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
