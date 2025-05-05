
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-range-picker-adapter";
import { PhoneInput } from "@/components/ui/phone-input";
import { formatPhoneNumber } from '@/utils/phoneFormatter';

interface CustomerFormFieldsProps {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePhoneChange: (value: string) => void;
  handleDateChange: (field: string, date: Date | undefined) => void;
  errors?: Record<string, string>;
}

export function CustomerFormFields({ 
  formData, 
  handleInputChange, 
  handlePhoneChange,
  handleDateChange,
  errors = {}
}: CustomerFormFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ad */}
        <div>
          <Label htmlFor="ad" className="text-right">
            Ad
          </Label>
          <div className="mt-1">
            <Input
              id="ad"
              value={formData.ad || ''}
              onChange={handleInputChange}
              placeholder="Müşteri adı"
              className={errors.ad ? "border-red-500" : ""}
            />
            {errors.ad && <p className="text-red-500 text-xs mt-1">{errors.ad}</p>}
          </div>
        </div>

        {/* Soyad */}
        <div>
          <Label htmlFor="soyad" className="text-right">
            Soyad
          </Label>
          <div className="mt-1">
            <Input
              id="soyad"
              value={formData.soyad || ''}
              onChange={handleInputChange}
              placeholder="Müşteri soyadı"
              className={errors.soyad ? "border-red-500" : ""}
            />
            {errors.soyad && <p className="text-red-500 text-xs mt-1">{errors.soyad}</p>}
          </div>
        </div>
      </div>

      {/* Telefon */}
      <div>
        <Label htmlFor="telefon" className="text-right">
          Telefon
        </Label>
        <div className="mt-1">
          <PhoneInput
            id="telefon"
            value={formData.telefon || ''}
            onChange={handlePhoneChange}
            placeholder="05XX XXX XX XX"
            className={errors.telefon ? "border-red-500" : ""}
          />
          {errors.telefon && <p className="text-red-500 text-xs mt-1">{errors.telefon}</p>}
        </div>
      </div>

      {/* E-posta */}
      <div>
        <Label htmlFor="eposta" className="text-right">
          E-posta
        </Label>
        <div className="mt-1">
          <Input
            id="eposta"
            type="email"
            value={formData.eposta || ''}
            onChange={handleInputChange}
            placeholder="ornek@email.com"
            className={errors.eposta ? "border-red-500" : ""}
          />
          {errors.eposta && <p className="text-red-500 text-xs mt-1">{errors.eposta}</p>}
        </div>
      </div>

      {/* Doğum Tarihi */}
      <div>
        <Label htmlFor="dogum_tarihi" className="text-right">
          Doğum Tarihi
        </Label>
        <div className="mt-1">
          <DatePicker
            value={formData.dogum_tarihi ? new Date(formData.dogum_tarihi) : undefined}
            onChange={(date) => handleDateChange('dogum_tarihi', date)}
            placeholder="Doğum tarihi seçin"
          />
          {errors.dogum_tarihi && <p className="text-red-500 text-xs mt-1">{errors.dogum_tarihi}</p>}
        </div>
      </div>

      {/* Adres */}
      <div>
        <Label htmlFor="adres" className="text-right">
          Adres
        </Label>
        <div className="mt-1">
          <Input
            id="adres"
            value={formData.adres || ''}
            onChange={handleInputChange}
            placeholder="Adres bilgisi"
          />
        </div>
      </div>
    </div>
  );
}
