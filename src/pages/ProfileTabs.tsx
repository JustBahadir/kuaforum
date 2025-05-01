
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

export default function ProfileTabs(props: ProfileTabsProps = {}) {
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
            profile={props.profile || {}}
            handleChange={props.handleChange || (() => {})}
            handleSelectChange={props.handleSelectChange || (() => {})}
            handleAvatarUpload={props.handleAvatarUpload || (async () => {})}
            isLoading={props.isLoading || false}
            updateProfile={props.updateProfile || (async () => {})}
          />
        </Card>
      </TabsContent>
      <TabsContent value="education">
        <Card className="p-6">
          <EducationTab 
            educationData={props.educationData || {}}
            updateEducation={props.updateEducation || (async () => {})}
            isLoading={props.isLoading || false}
          />
        </Card>
      </TabsContent>
      <TabsContent value="history">
        <Card className="p-6">
          <HistoryTab 
            historyData={props.historyData || {}}
            updateHistory={props.updateHistory || (async () => {})}
            isLoading={props.isLoading || false}
            uploadCv={props.uploadCv || (async () => {})}
          />
        </Card>
      </TabsContent>
    </Tabs>
  );
}
