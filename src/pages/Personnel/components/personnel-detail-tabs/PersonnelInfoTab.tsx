
import React, { useState } from "react";
import { PersonnelForm } from "@/components/operations/PersonnelForm";
import { Button } from "@/components/ui/button";
import { X, Check, Edit, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PersonnelInfoTabProps {
  personnel: any;
  onSave?: () => void;
}

export function PersonnelInfoTab({ personnel, onSave }: PersonnelInfoTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-2">
        {!isEditing ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1"
          >
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline">Düzenle</span>
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">İptal</span>
            </Button>
            <Button 
              variant="default"
              size="sm"
              onClick={() => {
                setIsEditing(false);
                if (onSave) onSave();
              }}
              className="flex items-center gap-1"
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">Kaydet</span>
            </Button>
          </div>
        )}
      </div>
      
      <Card>
        <CardContent className="p-4">
          <PersonnelForm 
            personnel={personnel} 
            readOnly={!isEditing} 
            showWorkInfo={false}
            showPersonalInfo={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
