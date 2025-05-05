
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Musteri } from "@/lib/supabase/types";
import { formatPhoneNumber } from "@/utils/phoneFormatter";

interface CustomerListProps {
  customers: Musteri[];
  loading: boolean;
  onSelectCustomer: (customer: Musteri) => void;
  onAddCustomer?: () => void;
}

export function CustomerList({ customers, loading, onSelectCustomer, onAddCustomer }: CustomerListProps) {
  if (loading) {
    return (
      <Card className="mb-5">
        <CardContent className="p-5">
          <div className="text-center py-4">Müşteriler yükleniyor...</div>
        </CardContent>
      </Card>
    );
  }

  if (customers.length === 0) {
    return (
      <Card className="mb-5">
        <CardContent className="p-5">
          <div className="text-center py-4">
            <p className="mb-4">Henüz müşteri bulunmuyor</p>
            {onAddCustomer && (
              <Button onClick={onAddCustomer}>
                Yeni Müşteri Ekle
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getInitials = (customer: Musteri) => {
    // Backwards compatibility with different field names
    const fullName = customer.ad_soyad || `${customer.first_name || customer.ad || ''} ${customer.last_name || customer.soyad || ''}`;
    return fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase();
  };

  const formatPhone = (customer: Musteri) => {
    // Backwards compatibility with different field names
    const phone = customer.telefon || customer.phone || '';
    return formatPhoneNumber(phone);
  };

  const formatBirthDate = (date?: string) => {
    if (!date) return "Belirtilmemiş";
    
    try {
      const d = new Date(date);
      return d.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (e) {
      return "Geçersiz Tarih";
    }
  };

  return (
    <Card className="mb-5">
      <CardHeader className="pb-2">
        <CardTitle>Müşteriler</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y">
          {customers.map((customer) => (
            <li 
              key={customer.id}
              className="p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => onSelectCustomer(customer)}
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                  {getInitials(customer)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {customer.ad_soyad || `${customer.first_name || customer.ad || ''} ${customer.last_name || customer.soyad || ''}`}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {formatPhone(customer)}
                  </p>
                  <p className="text-xs text-gray-400">
                    Doğum: {formatBirthDate(customer.dogum_tarihi || customer.birthdate)}
                  </p>
                </div>
                <Button 
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCustomer(customer);
                  }}
                  className="flex-shrink-0"
                >
                  Görüntüle
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
