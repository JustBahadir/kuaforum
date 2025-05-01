
import React from 'react';
import { formatPhoneNumber } from "@/utils/phoneFormatter";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface CustomerInfoProps {
  customer: any;
}

export function CustomerInfo({ customer }: CustomerInfoProps) {
  if (!customer) {
    return <div>Müşteri bilgisi bulunamadı</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-500">Temel Bilgiler</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div>
            <p className="text-sm text-gray-500">İsim</p>
            <p>{customer.first_name} {customer.last_name || ""}</p>
          </div>
          {customer.phone && (
            <div>
              <p className="text-sm text-gray-500">Telefon</p>
              <p>{formatPhoneNumber(customer.phone)}</p>
            </div>
          )}
          {customer.birthdate && (
            <div>
              <p className="text-sm text-gray-500">Doğum Tarihi</p>
              <p>{format(new Date(customer.birthdate), "d MMMM yyyy", { locale: tr })}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-500">Kayıt Tarihi</p>
            <p>{format(new Date(customer.created_at), "d MMMM yyyy", { locale: tr })}</p>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-500">İstatistikler</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          <div className="p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">Toplam Randevu</p>
            <p className="text-xl font-medium">0</p>
          </div>
          <div className="p-3 bg-green-50 rounded-md">
            <p className="text-sm text-green-800">Toplam Hizmet</p>
            <p className="text-xl font-medium">0</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-md">
            <p className="text-sm text-purple-800">Toplam Harcama</p>
            <p className="text-xl font-medium">0 ₺</p>
          </div>
        </div>
      </div>
    </div>
  );
}
