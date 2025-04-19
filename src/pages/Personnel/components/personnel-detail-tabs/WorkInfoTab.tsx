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
    
    // Prepare the data for submission
    const updateData = {
      calisma_sistemi: workSystem === 'maasli' ? paymentPeriod : 'komisyon',
    };
    
    if (workSystem === 'komisyonlu') {
      Object.assign(updateData, {
        prim_yuzdesi: parsedCommission,
        maas: 0 // Set salary to 0 for commission-based workers
      });
    } else {
      Object.assign(updateData, {
        maas: parsedSalary,
        prim_yuzdesi: 0 // Set commission to 0 for salaried workers
      });
    }
    
    updateMutation.mutate(updateData);
  };

  // Similar approach to the PhoneInputField component for handling numeric inputs
  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Only allow digits (no dots, commas or other characters)
    const digitsOnly = value.replace(/\D/g, '');
    
    // Remove leading zeros except for a single zero
    let formattedValue = digitsOnly;
    if (formattedValue.length > 1 && formattedValue.startsWith('0')) {
      formattedValue = formattedValue.replace(/^0+/, '');
    }
    
    // Limit to a reasonable length
    const limitedValue = formattedValue.substring(0, 7);
    
    // Update state with the clean value
    setSalary(limitedValue);
  };

  // Similar approach for commission with added validation for 0-100 range
  const handleCommissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Only allow digits
    const digitsOnly = value.replace(/\D/g, '');
    
    // Remove leading zeros except for a single zero
    let formattedValue = digitsOnly;
    if (formattedValue.length > 1 && formattedValue.startsWith('0')) {
      formattedValue = formattedValue.replace(/^0+/, '');
    }
    
    // Parse as number to check range
    const numValue = parseInt(formattedValue, 10);
    
    // Only update if empty or within 0-100 range
    if (formattedValue === '' || (numValue >= 0 && numValue <= 100)) {
      // Limit to 3 digits (for values like 100)
      const limitedValue = formattedValue.substring(0, 3);
      setCommission(limitedValue);
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
              type="text"
              value={salary}
              onChange={handleSalaryChange}
              placeholder="Maaş tutarını girin (₺)"
              className="placeholder:text-muted-foreground"
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </div>
        </div>
      )}

      {workSystem === 'komisyonlu' && (
        <div className="space-y-2">
          <Label>Prim Yüzdesi (%)</Label>
          <Input
            type="text"
            value={commission}
            onChange={handleCommissionChange}
            placeholder="Prim yüzdesini girin (0-100)"
            className="placeholder:text-muted-foreground"
            inputMode="numeric"
            pattern="[0-9]*"
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
