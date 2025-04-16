
import React, { useState } from "react";
import { PersonnelForm } from "@/components/operations/PersonnelForm";
import { Button } from "@/components/ui/button";
import { X, Check } from "lucide-react";

interface PersonnelInfoTabProps {
  personnel: any;
  onSave?: () => void;
}

export function PersonnelInfoTab({ personnel, onSave }: PersonnelInfoTabProps) {
  // This is a read-only view for personnel info
  return (
    <div className="space-y-6">
      <PersonnelForm 
        personnel={personnel} 
        readOnly={true} 
        showWorkInfo={false}
        showPersonalInfo={true}
      />
    </div>
  );
}
