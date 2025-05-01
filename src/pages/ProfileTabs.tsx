
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import StaffPersonalInfoTab from "./Profile/StaffPersonalInfoTab";
import HistoryTab from "./Profile/HistoryTab";
import EducationTab from "./Profile/EducationTab";

export interface ProfileTabsProps {
  profile?: any;
  handleChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange?: (name: string, value: string) => void;
  handleAvatarUpload?: (file: File) => Promise<void>;
  isLoading?: boolean;
  updateProfile?: (data: any) => Promise<void>;
  educationData?: any;
  updateEducation?: (data: any) => Promise<void>;
  historyData?: any;
  updateHistory?: (data: any) => Promise<void>;
  uploadCv?: (file: File) => Promise<void>;
}

export default function ProfileTabs({
  profile,
  handleChange,
  handleSelectChange,
  handleAvatarUpload,
  isLoading,
  updateProfile,
  educationData,
  updateEducation,
  historyData,
  updateHistory,
  uploadCv
}: ProfileTabsProps = {}) {
  return (
    <Tabs defaultValue="personal" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="personal">Kişisel Bilgiler</TabsTrigger>
        <TabsTrigger value="education">Eğitim</TabsTrigger>
        <TabsTrigger value="history">İş Geçmişi</TabsTrigger>
      </TabsList>
      <TabsContent value="personal">
        <Card className="p-6">
          <StaffPersonalInfoTab 
            profile={profile || {}}
            handleChange={handleChange || (() => {})}
            handleSelectChange={handleSelectChange || (() => {})}
            handleAvatarUpload={handleAvatarUpload || (async () => {})}
            isLoading={isLoading || false}
            updateProfile={updateProfile || (async () => {})}
          />
        </Card>
      </TabsContent>
      <TabsContent value="education">
        <Card className="p-6">
          <EducationTab 
            educationData={educationData || {}}
            // @ts-ignore - Fixing type issues while maintaining compatibility
            updateEducation={updateEducation || (async () => {})}
            isLoading={isLoading || false}
          />
        </Card>
      </TabsContent>
      <TabsContent value="history">
        <Card className="p-6">
          <HistoryTab 
            historyData={historyData || {}}
            // @ts-ignore - Fixing type issues while maintaining compatibility
            updateHistory={updateHistory || (async () => {})}
            isLoading={isLoading || false}
            uploadCv={uploadCv || (async () => {})}
          />
        </Card>
      </TabsContent>
    </Tabs>
  );
}
