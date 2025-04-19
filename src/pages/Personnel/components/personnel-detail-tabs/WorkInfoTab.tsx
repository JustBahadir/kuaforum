
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BriefcaseIcon, PercentIcon, Banknote } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { personelServisi } from "@/lib/supabase";

interface WorkInfoTabProps {
  personnel: any;
  onEdit?: () => void;
  canEdit?: boolean;
}

export function WorkInfoTab({ personnel, onEdit, canEdit = true }: WorkInfoTabProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [workSystem, setWorkSystem] = useState(personnel.calisma_sistemi === 'komisyon' ? 'komisyonlu' : 'maasli');
  const [paymentPeriod, setPaymentPeriod] = useState(personnel.calisma_sistemi || 'aylik');
  
  // Initialize with empty strings instead of converting to string
  const [salary, setSalary] = useState(personnel.maas && personnel.maas > 0 ? personnel.maas.toString() : '');
  const [commission, setCommission] = useState(personnel.prim_yuzdesi && personnel.prim_yuzdesi > 0 ? personnel.prim_yuzdesi.toString() : '');

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Updating personnel with data:", data);
      return await personelServisi.guncelle(personnel.id, data);
    },
    onSuccess: () => {
      toast.success("Personel bilgileri başarıyla güncellendi!");
      queryClient.invalidateQueries({ queryKey: ["personeller"] });
      queryClient.invalidateQueries({ queryKey: ["personel-list"] });
      queryClient.invalidateQueries({ queryKey: ["personel"] });
      setIsEditing(false);
      if (onEdit) onEdit();
    },
    onError: (error) => {
      console.error(error);
      toast.error("Personel güncellenirken bir hata oluştu.");
    },
  });

  const handleSave = () => {
    // Parse the string values to numbers, defaulting to 0 if empty
    const parsedSalary = salary ? parseInt(salary, 10) : 0;
    const parsedCommission = commission ? parseInt(commission, 10) : 0;
    
    // Validate input values before submission
    if (workSystem === 'komisyonlu' && (parsedCommission < 0 || parsedCommission > 100)) {
      toast.error("Prim yüzdesi 0-100 arasında olmalıdır.");
      return;
    }
    
    if (workSystem === 'maasli' && parsedSalary < 0) {
      toast.error("Maaş tutarı sıfırdan büyük olmalıdır.");
      return;
    }
    
    // Prepare the data for submission
    const updateData: Record<string, any> = {};
    
    // Map 'maasli' and 'komisyonlu' workSystem values to the actual database values
    if (workSystem === 'komisyonlu') {
      updateData.calisma_sistemi = 'komisyon';
      updateData.prim_yuzdesi = parsedCommission;
      updateData.maas = 0; // Set salary to 0 for commission-based workers
    } else {
      updateData.calisma_sistemi = paymentPeriod; // aylik, haftalik, gunluk
      updateData.maas = parsedSalary;
      updateData.prim_yuzdesi = 0; // Set commission to 0 for salaried workers
    }
    
    console.log("Submitting update data:", updateData);
    updateMutation.mutate(updateData);
  };

  // Input handler for numeric inputs that preserves focus
  const handleNumericInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    setValue: React.Dispatch<React.SetStateAction<string>>,
    minValue = 0,
    maxValue?: number
  ) => {
    const inputValue = e.target.value;
    
    // Allow empty input for UX reasons
    if (inputValue === '') {
      setValue('');
      return;
    }
    
    // Only allow digits
    if (!/^\d*$/.test(inputValue)) {
      return;
    }
    
    // Remove leading zeros except for a single zero
    let formattedValue = inputValue;
    if (formattedValue.length > 1 && formattedValue.startsWith('0')) {
      formattedValue = formattedValue.replace(/^0+/, '');
    }
    
    // Check against min/max values if specified
    const numValue = parseInt(formattedValue, 10);
    
    if (formattedValue === '' || !isNaN(numValue)) {
      if (maxValue !== undefined && numValue > maxValue) {
        setValue(maxValue.toString());
      } else if (numValue < minValue) {
        setValue(minValue.toString());
      } else {
        setValue(formattedValue);
      }
    }
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
              value={salary}
              onChange={(e) => handleNumericInput(e, setSalary, 0)}
              placeholder="Maaş tutarını girin (₺)"
              className="placeholder:text-muted-foreground"
              inputMode="numeric"
            />
          </div>
        </div>
      )}

      {workSystem === 'komisyonlu' && (
        <div className="space-y-2">
          <Label>Prim Yüzdesi (%)</Label>
          <Input
            value={commission}
            onChange={(e) => handleNumericInput(e, setCommission, 0, 100)}
            placeholder="Prim yüzdesini girin (0-100)"
            className="placeholder:text-muted-foreground"
            inputMode="numeric"
          />
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => setIsEditing(false)}>
          İptal
        </Button>
        <Button onClick={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </div>
    </div>
  );

  const DisplayContent = () => {
    // For display purposes, don't show zero values
    const displaySalary = salary !== '' ? parseInt(salary, 10) : null;
    const displayCommission = commission !== '' ? parseInt(commission, 10) : null;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Çalışma Sistemi</p>
            <div className="flex items-center mt-1">
              <BriefcaseIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              <p className="text-base capitalize">
                {workSystem === 'komisyonlu' ? 'Komisyonlu' : `${paymentPeriod === 'aylik' ? 'Aylık' : paymentPeriod === 'haftalik' ? 'Haftalık' : 'Günlük'} Maaş`}
              </p>
            </div>
          </div>
          
          {workSystem === 'maasli' && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Maaş</p>
              <div className="flex items-center mt-1">
                <Banknote className="h-4 w-4 mr-2 text-muted-foreground" />
                {displaySalary !== null ? (
                  <p className="text-base">{formatCurrency(displaySalary)}</p>
                ) : (
                  <p className="text-base text-muted-foreground">Belirtilmemiş</p>
                )}
              </div>
            </div>
          )}
          
          {workSystem === 'komisyonlu' && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Prim Yüzdesi</p>
              <div className="flex items-center mt-1">
                <PercentIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                {displayCommission !== null ? (
                  <p className="text-base">%{displayCommission}</p>
                ) : (
                  <p className="text-base text-muted-foreground">Belirtilmemiş</p>
                )}
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
  };

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
