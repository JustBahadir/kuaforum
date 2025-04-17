
import React from "react";

export interface PersonnelImageTabProps {
  personnel: any;
  onSave?: () => void;
}

export function PersonnelImageTab({ personnel, onSave }: PersonnelImageTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        {personnel.avatar_url ? (
          <img 
            src={personnel.avatar_url} 
            alt={personnel.ad_soyad} 
            className="h-48 w-48 object-cover rounded-full"
          />
        ) : (
          <div className="h-48 w-48 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-3xl font-medium text-gray-500">
              {personnel.ad_soyad?.split(' ').map((name: string) => name[0]).join('')}
            </span>
          </div>
        )}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Fotoğraf yükleme özelliği yakında eklenecektir.
      </p>
    </div>
  );
}
