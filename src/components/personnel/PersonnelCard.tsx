
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Mail, Phone } from "lucide-react";

interface PersonnelCardProps {
  personnel: any;
  onClick?: () => void;
  onDelete?: () => void;
  showDeleteButton?: boolean;
}

export function PersonnelCard({
  personnel,
  onClick,
  onDelete,
  showDeleteButton = false,
}: PersonnelCardProps) {
  if (!personnel) return null;

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete();
  };

  return (
    <Card
      className={`relative hover:shadow-md transition-shadow ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      {showDeleteButton && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-7 w-7"
          onClick={handleDeleteClick}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}

      <CardContent className="pt-6 pb-4 px-4">
        <div className="flex flex-col items-center justify-center space-y-2 mb-3">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={personnel.avatar_url}
              alt={personnel.ad_soyad}
            />
            <AvatarFallback>{getInitials(personnel.ad_soyad)}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <div className="font-medium">{personnel.ad_soyad}</div>
          </div>
        </div>

        <div className="mt-3 space-y-2 text-sm">
          {personnel.telefon && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{personnel.telefon}</span>
            </div>
          )}
          {personnel.eposta && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{personnel.eposta}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
