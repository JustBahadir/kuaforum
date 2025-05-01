
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface EducationTabProps {
  personnel: any;
  onRefresh?: () => void;
  onClose: () => void;
}

export function EducationTab({ personnel, onRefresh, onClose }: EducationTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Eğitim Bilgileri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ortaokul">Ortaokul Durumu</Label>
              <Input id="ortaokul" defaultValue={personnel?.education?.ortaokuldurumu || ""} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lise">Lise Durumu</Label>
              <Input id="lise" defaultValue={personnel?.education?.lisedurumu || ""} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="liseturu">Lise Türü</Label>
              <Input id="liseturu" defaultValue={personnel?.education?.liseturu || ""} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="universite">Üniversite Durumu</Label>
              <Input id="universite" defaultValue={personnel?.education?.universitedurumu || ""} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bolum">Üniversite Bölümü</Label>
              <Input id="bolum" defaultValue={personnel?.education?.universitebolum || ""} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meslek">Mesleki Branş</Label>
              <Input id="meslek" defaultValue={personnel?.education?.meslekibrans || ""} readOnly />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Kapat
        </Button>
      </div>
    </div>
  );
}
