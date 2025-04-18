
import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface StaffCardHeaderProps {
  title?: string;
  onBack?: () => void;
}

export function StaffCardHeader({ 
  title = "Personel Girişi", 
  onBack 
}: StaffCardHeaderProps) {
  return (
    <CardHeader className="relative py-6">
      {onBack && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onBack}
          className="absolute left-4 top-4 p-2 h-8 w-8"
        >
          <ChevronLeft size={16} />
        </Button>
      )}
      <CardTitle className="text-center">{title}</CardTitle>
    </CardHeader>
  );
}
