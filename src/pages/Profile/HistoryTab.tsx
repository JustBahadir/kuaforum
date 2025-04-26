
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingButton } from "@/components/ui/loading-button";
import { Plus, Briefcase, FileText, Award } from "lucide-react";
import { StaffExperienceTable } from "@/components/staff-profile/history/StaffExperienceTable";
import { StaffCertificatesTable } from "@/components/staff-profile/history/StaffCertificatesTable";
import { StaffCompetitionsTable } from "@/components/staff-profile/history/StaffCompetitionsTable";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

interface WorkExperience {
  workplace: string;
  position: string;
  duration: string;
}

interface HistoryData {
  isyerleri: string;
  gorevpozisyon: string;
  belgeler: string;
  yarismalar: string;
  cv: string;
}

interface HistoryTabProps {
  historyData: HistoryData;
  onHistoryChange: (data: HistoryData) => void;
  onSave: (data: HistoryData) => Promise<void>;
  isLoading: boolean;
}

const HistoryTab: React.FC<HistoryTabProps> = ({
  historyData,
  onHistoryChange,
  onSave,
  isLoading,
}) => {
  // State for form values
  const [newWorkplace, setNewWorkplace] = useState<WorkExperience>({
    workplace: "",
    position: "",
    duration: ""
  });
  const [newCertificate, setNewCertificate] = useState("");
  const [newCompetition, setNewCompetition] = useState("");
  const [cvText, setCvText] = useState(historyData.cv || "");
  const [savingCv, setSavingCv] = useState(false);
  
  // State for edited items
  const [editCertificateIndex, setEditCertificateIndex] = useState<number | null>(null);
  const [editCompetitionIndex, setEditCompetitionIndex] = useState<number | null>(null);
  const [editExperienceIndex, setEditExperienceIndex] = useState<number | null>(null);
  
  // Parse stored data into arrays for tables
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [certificates, setCertificates] = useState<string[]>([]);
  const [competitions, setCompetitions] = useState<string[]>([]);

  // Load data when component mounts or historyData changes
  useEffect(() => {
    // Parse experiences from stored string
    if (historyData.isyerleri) {
      try {
        const expLines = historyData.isyerleri.split('\n');
        const parsedExperiences: WorkExperience[] = [];
        
        expLines.forEach(line => {
          // Format: workplace | position | duration
          const parts = line.split('|').map(part => part.trim());
          if (parts.length >= 3) {
            parsedExperiences.push({
              workplace: parts[0],
              position: parts[1],
              duration: parts[2]
            });
          }
        });
        
        setExperiences(parsedExperiences);
      } catch (error) {
        console.error("Error parsing experiences:", error);
      }
    }
    
    // Parse certificates
    if (historyData.belgeler) {
      setCertificates(historyData.belgeler.split('\n').filter(cert => cert.trim()));
    }
    
    // Parse competitions
    if (historyData.yarismalar) {
      setCompetitions(historyData.yarismalar.split('\n').filter(comp => comp.trim()));
    }
    
    // Set CV text
    setCvText(historyData.cv || "");
  }, [historyData]);

  // Handle experience form submission
  const addExperience = async () => {
    if (!newWorkplace.workplace || !newWorkplace.position || !newWorkplace.duration) {
      toast.error("Lütfen tüm alanları doldurunuz");
      return;
    }
    
    let updatedExperiences: WorkExperience[];
    
    if (editExperienceIndex !== null) {
      // Update existing experience
      updatedExperiences = [...experiences];
      updatedExperiences[editExperienceIndex] = newWorkplace;
      setEditExperienceIndex(null);
    } else {
      // Add new experience
      updatedExperiences = [...experiences, newWorkplace];
    }
    
    setExperiences(updatedExperiences);
    
    // Format experiences for storage
    const formattedExperiences = updatedExperiences.map(exp => 
      `${exp.workplace} | ${exp.position} | ${exp.duration}`
    ).join('\n');
    
    try {
      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: personelData } = await supabase
          .from('personel')
          .select('id')
          .eq('auth_id', user.id)
          .maybeSingle();
          
        if (personelData) {
          await supabase
            .from('staff_history')
            .upsert({
              personel_id: personelData.id,
              isyerleri: formattedExperiences,
              gorevpozisyon: historyData.gorevpozisyon,
              belgeler: historyData.belgeler,
              yarismalar: historyData.yarismalar,
              cv: historyData.cv,
              updated_at: new Date().toISOString()
            }, { onConflict: 'personel_id' });
            
          // Update local state
          onHistoryChange({
            ...historyData,
            isyerleri: formattedExperiences
          });
          
          toast.success(editExperienceIndex !== null ? "İş deneyimi güncellendi" : "İş deneyimi eklendi");
        } else {
          createPersonelRecord(user.id, {
            ...historyData,
            isyerleri: formattedExperiences
          });
        }
      }
    } catch (error) {
      console.error("Error saving experience:", error);
      toast.error("İş deneyimi kaydedilirken bir hata oluştu");
    }
    
    setNewWorkplace({ workplace: "", position: "", duration: "" });
  };

  // Handle certificate form submission
  const addCertificate = async () => {
    if (!newCertificate) {
      toast.error("Lütfen belge adını giriniz");
      return;
    }
    
    let updatedCertificates: string[];
    
    if (editCertificateIndex !== null) {
      // Update existing certificate
      updatedCertificates = [...certificates];
      updatedCertificates[editCertificateIndex] = newCertificate;
      setEditCertificateIndex(null);
    } else {
      // Add new certificate
      updatedCertificates = [...certificates, newCertificate];
    }
    
    setCertificates(updatedCertificates);
    
    // Format certificates for storage
    const formattedCertificates = updatedCertificates.join('\n');
    
    try {
      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: personelData } = await supabase
          .from('personel')
          .select('id')
          .eq('auth_id', user.id)
          .maybeSingle();
          
        if (personelData) {
          await supabase
            .from('staff_history')
            .upsert({
              personel_id: personelData.id,
              isyerleri: historyData.isyerleri,
              gorevpozisyon: historyData.gorevpozisyon,
              belgeler: formattedCertificates,
              yarismalar: historyData.yarismalar,
              cv: historyData.cv,
              updated_at: new Date().toISOString()
            }, { onConflict: 'personel_id' });
            
          // Update local state
          onHistoryChange({
            ...historyData,
            belgeler: formattedCertificates
          });
          
          toast.success(editCertificateIndex !== null ? "Belge güncellendi" : "Belge eklendi");
        } else {
          createPersonelRecord(user.id, {
            ...historyData,
            belgeler: formattedCertificates
          });
        }
      }
    } catch (error) {
      console.error("Error saving certificate:", error);
      toast.error("Belge kaydedilirken bir hata oluştu");
    }
    
    setNewCertificate("");
  };

  // Handle competition form submission
  const addCompetition = async () => {
    if (!newCompetition) {
      toast.error("Lütfen yarışma adını giriniz");
      return;
    }
    
    let updatedCompetitions: string[];
    
    if (editCompetitionIndex !== null) {
      // Update existing competition
      updatedCompetitions = [...competitions];
      updatedCompetitions[editCompetitionIndex] = newCompetition;
      setEditCompetitionIndex(null);
    } else {
      // Add new competition
      updatedCompetitions = [...competitions, newCompetition];
    }
    
    setCompetitions(updatedCompetitions);
    
    // Format competitions for storage
    const formattedCompetitions = updatedCompetitions.join('\n');
    
    try {
      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: personelData } = await supabase
          .from('personel')
          .select('id')
          .eq('auth_id', user.id)
          .maybeSingle();
          
        if (personelData) {
          await supabase
            .from('staff_history')
            .upsert({
              personel_id: personelData.id,
              isyerleri: historyData.isyerleri,
              gorevpozisyon: historyData.gorevpozisyon,
              belgeler: historyData.belgeler,
              yarismalar: formattedCompetitions,
              cv: historyData.cv,
              updated_at: new Date().toISOString()
            }, { onConflict: 'personel_id' });
            
          // Update local state
          onHistoryChange({
            ...historyData,
            yarismalar: formattedCompetitions
          });
          
          toast.success(editCompetitionIndex !== null ? "Yarışma güncellendi" : "Yarışma eklendi");
        } else {
          createPersonelRecord(user.id, {
            ...historyData,
            yarismalar: formattedCompetitions
          });
        }
      }
    } catch (error) {
      console.error("Error saving competition:", error);
      toast.error("Yarışma kaydedilirken bir hata oluştu");
    }
    
    setNewCompetition("");
  };

  // Handle CV text change and save
  const handleCvChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCvText(e.target.value);
  };
  
  const saveCv = async () => {
    setSavingCv(true);
    try {
      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: personelData } = await supabase
          .from('personel')
          .select('id')
          .eq('auth_id', user.id)
          .maybeSingle();
          
        if (personelData) {
          await supabase
            .from('staff_history')
            .upsert({
              personel_id: personelData.id,
              isyerleri: historyData.isyerleri,
              gorevpozisyon: historyData.gorevpozisyon,
              belgeler: historyData.belgeler,
              yarismalar: historyData.yarismalar,
              cv: cvText,
              updated_at: new Date().toISOString()
            }, { onConflict: 'personel_id' });
            
          // Update local state
          onHistoryChange({
            ...historyData,
            cv: cvText
          });
          
          toast.success("Özgeçmiş kaydedildi");
        } else {
          createPersonelRecord(user.id, {
            ...historyData,
            cv: cvText
          });
        }
      }
    } catch (error) {
      console.error("Error saving CV:", error);
      toast.error("Özgeçmiş kaydedilirken bir hata oluştu");
    } finally {
      setSavingCv(false);
    }
  };
  
  // Helper function to create personel record if it doesn't exist
  const createPersonelRecord = async (authId: string, updatedHistoryData: HistoryData) => {
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
        // Now insert history with the new personel ID
        await supabase
          .from('staff_history')
          .insert([{
            personel_id: newPersonel[0].id,
            isyerleri: updatedHistoryData.isyerleri || '',
            gorevpozisyon: updatedHistoryData.gorevpozisyon || '',
            belgeler: updatedHistoryData.belgeler || '',
            yarismalar: updatedHistoryData.yarismalar || '',
            cv: updatedHistoryData.cv || ''
          }]);
          
        toast.success("Bilgiler kaydedildi");
      }
    } catch (error) {
      console.error("Error creating personel record:", error);
      toast.error("Bilgiler kaydedilirken bir hata oluştu");
    }
  };
  
  // Handle delete actions
  const handleDeleteExperience = async (index: number) => {
    const updatedExperiences = [...experiences];
    updatedExperiences.splice(index, 1);
    setExperiences(updatedExperiences);
    
    const formattedExperiences = updatedExperiences.map(exp => 
      `${exp.workplace} | ${exp.position} | ${exp.duration}`
    ).join('\n');
    
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
            .from('staff_history')
            .update({ 
              isyerleri: formattedExperiences,
              updated_at: new Date().toISOString() 
            })
            .eq('personel_id', personelData.id);
            
          onHistoryChange({
            ...historyData,
            isyerleri: formattedExperiences
          });
          
          toast.success("İş deneyimi silindi");
        }
      }
    } catch (error) {
      console.error("Error deleting experience:", error);
      toast.error("İş deneyimi silinirken bir hata oluştu");
    }
  };

  // Handle edit actions
  const handleEditExperience = (index: number) => {
    const experience = experiences[index];
    setNewWorkplace({
      workplace: experience.workplace,
      position: experience.position,
      duration: experience.duration
    });
    setEditExperienceIndex(index);
  };
  
  const handleEditCertificate = (index: number) => {
    setNewCertificate(certificates[index]);
    setEditCertificateIndex(index);
  };
  
  const handleEditCompetition = (index: number) => {
    setNewCompetition(competitions[index]);
    setEditCompetitionIndex(index);
  };
  
  // Handle delete certificate
  const handleDeleteCertificate = async (index: number) => {
    const updatedCertificates = [...certificates];
    updatedCertificates.splice(index, 1);
    setCertificates(updatedCertificates);
    
    const formattedCertificates = updatedCertificates.join('\n');
    
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
            .from('staff_history')
            .update({ 
              belgeler: formattedCertificates,
              updated_at: new Date().toISOString() 
            })
            .eq('personel_id', personelData.id);
            
          onHistoryChange({
            ...historyData,
            belgeler: formattedCertificates
          });
          
          toast.success("Belge silindi");
        }
      }
    } catch (error) {
      console.error("Error deleting certificate:", error);
      toast.error("Belge silinirken bir hata oluştu");
    }
  };
  
  // Handle delete competition
  const handleDeleteCompetition = async (index: number) => {
    const updatedCompetitions = [...competitions];
    updatedCompetitions.splice(index, 1);
    setCompetitions(updatedCompetitions);
    
    const formattedCompetitions = updatedCompetitions.join('\n');
    
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
            .from('staff_history')
            .update({ 
              yarismalar: formattedCompetitions,
              updated_at: new Date().toISOString() 
            })
            .eq('personel_id', personelData.id);
            
          onHistoryChange({
            ...historyData,
            yarismalar: formattedCompetitions
          });
          
          toast.success("Yarışma silindi");
        }
      }
    } catch (error) {
      console.error("Error deleting competition:", error);
      toast.error("Yarışma silinirken bir hata oluştu");
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* İş Tecrübeleri */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Briefcase size={18} />
              İş Yerleri ve Görevler
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="İş Yeri"
                value={newWorkplace.workplace}
                onChange={(e) => setNewWorkplace({...newWorkplace, workplace: e.target.value})}
                className="text-gray-900"
              />
              <Input
                placeholder="Görev / Pozisyon"
                value={newWorkplace.position}
                onChange={(e) => setNewWorkplace({...newWorkplace, position: e.target.value})}
                className="text-gray-900"
              />
              <Input
                placeholder="Çalışma Süresi"
                value={newWorkplace.duration}
                onChange={(e) => setNewWorkplace({...newWorkplace, duration: e.target.value})}
                className="text-gray-900"
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="button"
                onClick={addExperience}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <Plus size={16} className="mr-1" /> 
                {editExperienceIndex !== null ? "Güncelle" : "Tecrübe Ekle"}
              </Button>
            </div>
            
            <StaffExperienceTable
              experiences={experiences}
              onDelete={handleDeleteExperience}
              onEdit={handleEditExperience}
            />
          </div>

          {/* Belgeler */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <FileText size={18} />
              Belgeler
            </h3>
            
            <div className="flex gap-2">
              <Input
                placeholder="Belge adını giriniz..."
                value={newCertificate}
                onChange={(e) => setNewCertificate(e.target.value)}
                className="text-gray-900"
              />
              <Button 
                type="button" 
                onClick={addCertificate}
                className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap"
                size="sm"
              >
                <Plus size={16} className="mr-1" /> 
                {editCertificateIndex !== null ? "Güncelle" : "Belge Ekle"}
              </Button>
            </div>
            
            <StaffCertificatesTable
              certificates={certificates}
              onDelete={handleDeleteCertificate}
              onEdit={handleEditCertificate}
            />
          </div>

          {/* Yarışmalar */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Award size={18} />
              Yarışmalar
            </h3>
            
            <div className="flex gap-2">
              <Input
                placeholder="Yarışma adını giriniz..."
                value={newCompetition}
                onChange={(e) => setNewCompetition(e.target.value)}
                className="text-gray-900"
              />
              <Button 
                type="button" 
                onClick={addCompetition}
                className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap"
                size="sm"
              >
                <Plus size={16} className="mr-1" /> 
                {editCompetitionIndex !== null ? "Güncelle" : "Yarışma Ekle"}
              </Button>
            </div>
            
            <StaffCompetitionsTable
              competitions={competitions}
              onDelete={handleDeleteCompetition}
              onEdit={handleEditCompetition}
            />
          </div>

          {/* Özgeçmiş */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Özgeçmiş</h3>
            <div>
              <Textarea
                value={cvText}
                onChange={handleCvChange}
                placeholder="Kendiniz hakkında belirtmek istedikleriniz, hedefleriniz, kariyer planlarınız ve hayallerinizi yazabilirsiniz."
                rows={6}
                className="text-gray-900"
              />
            </div>
            <div className="flex justify-end">
              <LoadingButton
                onClick={saveCv}
                loading={savingCv}
                className="bg-purple-600 text-white hover:bg-purple-700"
                size="sm"
              >
                Kaydet
              </LoadingButton>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HistoryTab;
