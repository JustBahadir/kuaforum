
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { personelServisi } from "@/lib/supabase";
import { Check, X, Edit, Mail, Phone, CalendarIcon, MapPin, User } from "lucide-react";

interface PersonnelInfoTabProps {
  personnel: any;
  onSave: () => void;
}

export function PersonnelInfoTab({ personnel, onSave }: PersonnelInfoTabProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    ad_soyad: personnel.ad_soyad || "",
    telefon: personnel.telefon || "",
    eposta: personnel.eposta || "",
    adres: personnel.adres || "",
    birth_date: personnel.birth_date || "",
    iban: personnel.iban || "",
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return await personelServisi.guncelle(personnel.id, data);
    },
    onSuccess: () => {
      toast.success("Personel bilgileri başarıyla güncellendi!");
      queryClient.invalidateQueries({ queryKey: ["personeller"] });
      queryClient.invalidateQueries({ queryKey: ["personel-list"] });
      queryClient.invalidateQueries({ queryKey: ["personnel-detail", personnel.id] });
      setIsEditing(false);
      if (onSave) onSave();
    },
    onError: (error) => {
      console.error("Update error:", error);
      toast.error("Personel güncellenirken bir hata oluştu.");
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      ad_soyad: personnel.ad_soyad || "",
      telefon: personnel.telefon || "",
      eposta: personnel.eposta || "",
      adres: personnel.adres || "",
      birth_date: personnel.birth_date || "",
      iban: personnel.iban || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Ad Soyad</h3>
          {!isEditing ? (
            <div className="flex items-center text-base font-normal">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{personnel.ad_soyad}</span>
            </div>
          ) : (
            <Input
              value={formData.ad_soyad}
              onChange={(e) => setFormData(prev => ({ ...prev, ad_soyad: e.target.value }))}
              placeholder="Ad Soyad"
            />
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Telefon</h3>
          {!isEditing ? (
            <div className="flex items-center text-base font-normal">
              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{personnel.telefon}</span>
            </div>
          ) : (
            <Input
              value={formData.telefon}
              onChange={(e) => setFormData(prev => ({ ...prev, telefon: e.target.value }))}
              placeholder="Telefon"
            />
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">E-posta</h3>
          {!isEditing ? (
            <div className="flex items-center text-base font-normal">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{personnel.eposta}</span>
            </div>
          ) : (
            <Input
              value={formData.eposta}
              onChange={(e) => setFormData(prev => ({ ...prev, eposta: e.target.value }))}
              placeholder="E-posta"
              type="email"
            />
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Doğum Tarihi</h3>
          {!isEditing ? (
            <div className="flex items-center text-base font-normal">
              <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{personnel.birth_date ? new Date(personnel.birth_date).toLocaleDateString('tr-TR') : 'Belirtilmedi'}</span>
            </div>
          ) : (
            <Input
              value={formData.birth_date}
              onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
              placeholder="YYYY-MM-DD"
              type="date"
            />
          )}
        </div>
        
        <div className="md:col-span-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">IBAN</h3>
          {!isEditing ? (
            <div className="text-base font-normal">
              {personnel.iban || 'Belirtilmedi'}
            </div>
          ) : (
            <Input
              value={formData.iban}
              onChange={(e) => setFormData(prev => ({ ...prev, iban: e.target.value }))}
              placeholder="IBAN"
              className="font-mono"
            />
          )}
        </div>

        <div className="md:col-span-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Adres</h3>
          {!isEditing ? (
            <div className="flex items-start">
              <MapPin className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
              <div className="text-base font-normal whitespace-pre-wrap">{personnel.adres}</div>
            </div>
          ) : (
            <Textarea
              value={formData.adres}
              onChange={(e) => setFormData(prev => ({ ...prev, adres: e.target.value }))}
              placeholder="Adres"
              rows={3}
            />
          )}
        </div>
      </div>

      {isEditing && (
        <div className="flex justify-end space-x-3">
          <Button variant="outline" size="sm" onClick={handleCancel} className="gap-1">
            <X className="h-4 w-4" />
            İptal
          </Button>
          <Button 
            size="sm" 
            onClick={handleSave} 
            disabled={updateMutation.isPending}
            className="gap-1"
          >
            <Check className="h-4 w-4" />
            {updateMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      )}

      {!isEditing && (
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsEditing(true)}
            className="gap-1"
          >
            <Edit className="h-4 w-4" />
            Düzenle
          </Button>
        </div>
      )}
    </div>
  );
}
