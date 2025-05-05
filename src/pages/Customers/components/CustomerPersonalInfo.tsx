import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPhoneNumber } from '@/utils/phoneFormatter';
import { format } from 'date-fns';

interface CustomerPersonalInfoProps {
  customerId: string | number;
  customer?: any;
}

export function CustomerPersonalInfo({ customerId, customer }: CustomerPersonalInfoProps) {
  // Fetch customer data if not provided
  const { data, isLoading, error } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: async () => {
      if (customer) return customer;
      
      const { data, error } = await supabase
        .from('musteriler')
        .select('*')
        .eq('id', customerId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!customerId && !customer,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Müşteri Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Müşteri Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">
            Müşteri bilgileri yüklenirken bir hata oluştu.
          </div>
        </CardContent>
      </Card>
    );
  }

  const customerData = data;
  
  // Handle both Turkish and English field names for compatibility
  const fullName = customerData.ad_soyad || `${customerData.ad || customerData.first_name || ''} ${customerData.soyad || customerData.last_name || ''}`;
  const phone = customerData.telefon || customerData.phone || '';
  const email = customerData.eposta || customerData.email || '';
  const birthDate = customerData.dogum_tarihi || customerData.birthdate;
  const gender = customerData.cinsiyet || customerData.gender || '';
  const address = customerData.adres || customerData.address || '';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Müşteri Bilgileri</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Ad Soyad</p>
              <p>{fullName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Telefon</p>
              <p>{formatPhoneNumber(phone)}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">E-posta</p>
              <p>{email || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Doğum Tarihi</p>
              <p>{birthDate ? format(new Date(birthDate), 'dd.MM.yyyy') : '-'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Cinsiyet</p>
              <p>{gender === 'erkek' ? 'Erkek' : gender === 'kadın' ? 'Kadın' : '-'}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">Adres</p>
            <p className="whitespace-pre-wrap">{address || '-'}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        {/* Edit button or other actions would go here */}
      </CardFooter>
    </Card>
  );
}

export default CustomerPersonalInfo;
