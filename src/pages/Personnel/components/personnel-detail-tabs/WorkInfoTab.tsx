
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BriefcaseIcon, PercentIcon, Banknote } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface WorkInfoTabProps {
  personnel: any;
  onEdit?: () => void;
  canEdit?: boolean;
}

export function WorkInfoTab({ personnel, onEdit, canEdit = true }: WorkInfoTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [workSystem, setWorkSystem] = useState(personnel.calisma_sistemi === 'komisyon' ? 'komisyonlu' : 'maasli');
  const [paymentPeriod, setPaymentPeriod] = useState(personnel.calisma_sistemi || 'aylik');
  const [salary, setSalary] = useState(personnel.maas || 0);
  const [commission, setCommission] = useState(personnel.prim_yuzdesi || 0);

  const handleSave = () => {
    // TODO: Implement save functionality
    setIsEditing(false);
  };

  const EditableContent = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>Çalışma Sistemi</Label>
        <RadioGroup
          value={workSystem}
          onValueChange={setWorkSystem}
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="maasli" id="maasli" />
            <Label htmlFor="maasli">Maaşlı</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="komisyonlu" id="komisyonlu" />
            <Label htmlFor="komisyonlu">Komisyonlu</Label>
          </div>
        </RadioGroup>
      </div>

      {workSystem === 'maasli' && (
        <div className="space-y-4">
          <Label>Maaş Dönemi</Label>
          <RadioGroup
            value={paymentPeriod}
            onValueChange={setPaymentPeriod}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="aylik" id="aylik" />
              <Label htmlFor="aylik">Aylık</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="haftalik" id="haftalik" />
              <Label htmlFor="haftalik">Haftalık</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="gunluk" id="gunluk" />
              <Label htmlFor="gunluk">Günlük</Label>
            </div>
          </RadioGroup>

          <div className="space-y-2">
            <Label>Maaş Tutarı</Label>
            <Input
              type="number"
              value={salary}
              onChange={(e) => setSalary(Number(e.target.value))}
              placeholder="Maaş tutarını girin"
            />
          </div>
        </div>
      )}

      {workSystem === 'komisyonlu' && (
        <div className="space-y-2">
          <Label>Prim Yüzdesi (%)</Label>
          <Input
            type="number"
            value={commission}
            onChange={(e) => setCommission(Number(e.target.value))}
            placeholder="Prim yüzdesini girin"
          />
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => setIsEditing(false)}>
          İptal
        </Button>
        <Button onClick={handleSave}>
          Kaydet
        </Button>
      </div>
    </div>
  );

  const DisplayContent = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Çalışma Sistemi</p>
          <div className="flex items-center mt-1">
            <BriefcaseIcon className="h-4 w-4 mr-2 text-muted-foreground" />
            <p className="text-base capitalize">
              {workSystem === 'komisyonlu' ? 'Komisyonlu' : `${paymentPeriod} Maaş`}
            </p>
          </div>
        </div>
        
        {workSystem === 'maasli' && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">Maaş</p>
            <div className="flex items-center mt-1">
              <Banknote className="h-4 w-4 mr-2 text-muted-foreground" />
              <p className="text-base">{formatCurrency(salary)}</p>
            </div>
          </div>
        )}
        
        {workSystem === 'komisyonlu' && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">Prim Yüzdesi</p>
            <div className="flex items-center mt-1">
              <PercentIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              <p className="text-base">%{commission}</p>
            </div>
          </div>
        )}
      </div>

      {canEdit && !isEditing && (
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            Düzenle
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          {isEditing ? <EditableContent /> : <DisplayContent />}
        </CardContent>
      </Card>
    </div>
  );
}
