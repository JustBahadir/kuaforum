
import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/ui/file-upload';

export interface EducationData {
  ortaokuldurumu: string;
  lisedurumu: string;
  liseturu: string;
  universitedurumu: string;
  universitebolum: string;
  meslekibrans: string;
}

export interface HistoryData {
  isyerleri: string;
  gorevpozisyon: string;
  yarismalar: string;
  belgeler: string;
  cv: string;
}

interface ProfileComponentProps {
  activeTab: string;
  userProfile: any;
  loading: boolean;
  handleLogout: () => void;
  handleSave: () => void;
  handleAvatarUpload: (file: File | string) => Promise<void>;
  isUploading: boolean;
  educationData: EducationData;
  historyData: HistoryData;
  setEducationData: (data: EducationData) => void;
  setHistoryData: (data: HistoryData) => void;
}

export const ProfileComponent = ({ 
  activeTab = 'personal',
  userProfile,
  loading,
  handleLogout,
  handleSave,
  handleAvatarUpload,
  isUploading,
  educationData,
  historyData,
  setEducationData,
  setHistoryData
}: ProfileComponentProps) => {
  const [currentTab, setCurrentTab] = useState(activeTab);
  
  const handleEducationChange = (field: keyof EducationData, value: string) => {
    setEducationData({ ...educationData, [field]: value });
  };
  
  const handleHistoryChange = (field: keyof HistoryData, value: string) => {
    setHistoryData({ ...historyData, [field]: value });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profil Sayfası</h1>
        <p className="text-muted-foreground">Kişisel bilgilerini düzenleyebilirsin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Avatar and Actions */}
        <div className="col-span-1">
          <Card>
            <CardContent className="flex flex-col items-center py-6">
              <div className="mb-4 relative w-32 h-32">
                {userProfile?.avatar_url ? (
                  <img 
                    src={userProfile.avatar_url} 
                    alt="Profile" 
                    className="rounded-full w-full h-full object-cover border-4 border-primary/20"
                  />
                ) : (
                  <div className="bg-primary/10 rounded-full w-full h-full flex items-center justify-center text-2xl font-bold text-primary">
                    {userProfile?.first_name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                
                <div className="absolute bottom-0 right-0">
                  <FileUpload 
                    onUploadComplete={handleAvatarUpload}
                    acceptedFileTypes="image/*"
                    label="Profil Fotoğrafı Yükle"
                    currentImageUrl={userProfile?.avatar_url}
                    isUploading={isUploading}
                  />
                </div>
              </div>

              <h2 className="text-xl font-bold mt-2">
                {userProfile?.first_name} {userProfile?.last_name}
              </h2>
              
              <p className="text-muted-foreground text-sm">
                {userProfile?.email}
              </p>
              
              <div className="flex justify-center w-full mt-6">
                <Button onClick={handleLogout} variant="outline" className="w-full">
                  Çıkış Yap
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Side: Tabs */}
        <div className="col-span-1 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Profil Bilgileri</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={currentTab} onValueChange={setCurrentTab}>
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="personal">Kişisel</TabsTrigger>
                  <TabsTrigger value="education">Eğitim</TabsTrigger>
                  <TabsTrigger value="history">Çalışma Geçmişi</TabsTrigger>
                </TabsList>
                
                <TabsContent value="personal" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="text-sm font-medium">
                        Ad
                      </label>
                      <Input 
                        id="firstName" 
                        placeholder="Ad" 
                        value={userProfile?.first_name || ''}
                        readOnly
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="text-sm font-medium">
                        Soyad
                      </label>
                      <Input 
                        id="lastName" 
                        placeholder="Soyad" 
                        value={userProfile?.last_name || ''}
                        readOnly
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      E-posta
                    </label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="E-posta" 
                      value={userProfile?.email || ''}
                      readOnly
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">
                      Telefon
                    </label>
                    <Input 
                      id="phone" 
                      placeholder="Telefon Numarası" 
                      value={userProfile?.phone || ''}
                      readOnly
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="address" className="text-sm font-medium">
                      Adres
                    </label>
                    <Textarea 
                      id="address" 
                      placeholder="Adres" 
                      className="min-h-[80px]"
                      value={userProfile?.address || ''}
                      readOnly
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="education" className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="ortaokuldurumu" className="text-sm font-medium">
                      Ortaokul Durumu
                    </label>
                    <Input 
                      id="ortaokuldurumu" 
                      value={educationData.ortaokuldurumu || ''}
                      onChange={(e) => handleEducationChange('ortaokuldurumu', e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="lisedurumu" className="text-sm font-medium">
                        Lise Durumu
                      </label>
                      <Input 
                        id="lisedurumu" 
                        value={educationData.lisedurumu || ''}
                        onChange={(e) => handleEducationChange('lisedurumu', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="liseturu" className="text-sm font-medium">
                        Lise Türü
                      </label>
                      <Input 
                        id="liseturu" 
                        value={educationData.liseturu || ''}
                        onChange={(e) => handleEducationChange('liseturu', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="universitedurumu" className="text-sm font-medium">
                        Üniversite Durumu
                      </label>
                      <Input 
                        id="universitedurumu" 
                        value={educationData.universitedurumu || ''}
                        onChange={(e) => handleEducationChange('universitedurumu', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="universitebolum" className="text-sm font-medium">
                        Üniversite Bölüm
                      </label>
                      <Input 
                        id="universitebolum" 
                        value={educationData.universitebolum || ''}
                        onChange={(e) => handleEducationChange('universitebolum', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="meslekibrans" className="text-sm font-medium">
                      Mesleki Branş
                    </label>
                    <Input 
                      id="meslekibrans" 
                      value={educationData.meslekibrans || ''}
                      onChange={(e) => handleEducationChange('meslekibrans', e.target.value)}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="history" className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="isyerleri" className="text-sm font-medium">
                      Çalıştığı İşyerleri
                    </label>
                    <Textarea 
                      id="isyerleri" 
                      className="min-h-[80px]"
                      value={historyData.isyerleri || ''}
                      onChange={(e) => handleHistoryChange('isyerleri', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="gorevpozisyon" className="text-sm font-medium">
                      Görev ve Pozisyon
                    </label>
                    <Input 
                      id="gorevpozisyon" 
                      value={historyData.gorevpozisyon || ''}
                      onChange={(e) => handleHistoryChange('gorevpozisyon', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="yarismalar" className="text-sm font-medium">
                      Katıldığı Yarışmalar
                    </label>
                    <Textarea 
                      id="yarismalar" 
                      className="min-h-[80px]"
                      value={historyData.yarismalar || ''}
                      onChange={(e) => handleHistoryChange('yarismalar', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="belgeler" className="text-sm font-medium">
                      Sertifika ve Belgeler
                    </label>
                    <Textarea 
                      id="belgeler" 
                      className="min-h-[80px]"
                      value={historyData.belgeler || ''}
                      onChange={(e) => handleHistoryChange('belgeler', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="cv" className="text-sm font-medium">
                      Özgeçmiş
                    </label>
                    <Textarea 
                      id="cv" 
                      className="min-h-[120px]"
                      value={historyData.cv || ''}
                      onChange={(e) => handleHistoryChange('cv', e.target.value)}
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              {(currentTab === 'education' || currentTab === 'history') && (
                <div className="flex justify-end mt-6">
                  <Button onClick={handleSave}>
                    Kaydet
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
