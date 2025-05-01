import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { musteriServisi, personelIslemleriServisi, randevuServisi } from "@/lib/supabase";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { formatPhoneNumber } from "@/utils/phoneFormatter";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Phone, Clock, CheckCircle2, XCircle } from "lucide-react";

interface CustomerDetailsProps {
  customerId: number;
}

export function CustomerDetails({ customerId }: CustomerDetailsProps) {
  const { data: customer, isLoading: isCustomerLoading } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => musteriServisi.getir(customerId),
    enabled: !!customerId,
  });

  const { data: appointments = [], isLoading: isAppointmentsLoading } = useQuery({
    queryKey: ['customerAppointments', customerId],
    queryFn: () => randevuServisi.getirByMusteriId(customerId),
    enabled: !!customerId,
  });

  const { data: services = [], isLoading: isServicesLoading } = useQuery({
    queryKey: ['customerServices', customerId],
    queryFn: () => personelIslemleriServisi.musteriIslemleriniGetir(customerId),
    enabled: !!customerId,
  });

  // Format date
  const formatDate = (date: string | null | undefined) => {
    if (!date) return "-";
    try {
      return format(new Date(date), "dd MMMM yyyy", { locale: tr });
    } catch (e) {
      return "-";
    }
  };

  // Format appointment status
  const formatStatus = (status: string) => {
    switch (status) {
      case "onaylandi":
        return <span className="text-green-600 flex items-center"><CheckCircle2 className="h-4 w-4 mr-1" /> Onaylandı</span>;
      case "beklemede":
        return <span className="text-yellow-600 flex items-center"><Clock className="h-4 w-4 mr-1" /> Beklemede</span>;
      case "tamamlandi":
        return <span className="text-green-700 flex items-center"><CheckCircle2 className="h-4 w-4 mr-1" /> Tamamlandı</span>;
      case "iptal_edildi":
      case "iptal":
        return <span className="text-red-600 flex items-center"><XCircle className="h-4 w-4 mr-1" /> İptal Edildi</span>;
      default:
        return status;
    }
  };

  if (isCustomerLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[200px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-4 w-[300px]" />
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!customer) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium">Müşteri bulunamadı</h3>
            <p className="text-muted-foreground mt-2">Bu ID ile eşleşen müşteri kaydı bulunmamaktadır.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            {customer.first_name} {customer.last_name || ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customer.phone && (
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{formatPhoneNumber(customer.phone)}</span>
              </div>
            )}
            {customer.birthdate && (
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Doğum Tarihi: {formatDate(customer.birthdate)}</span>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Kayıt Tarihi</p>
              <p>{formatDate(customer.created_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Son Randevular</CardTitle>
        </CardHeader>
        <CardContent>
          {isAppointmentsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.slice(0, 5).map((appointment: any) => (
                <div 
                  key={appointment.id} 
                  className="border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        {format(new Date(appointment.tarih), "dd MMMM yyyy", { locale: tr })}
                        {" "}
                        {appointment.saat ? appointment.saat.substring(0, 5) : ""}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.personel?.ad_soyad || "Personel seçilmedi"}
                      </p>
                    </div>
                    <div>
                      {formatStatus(appointment.durum)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground py-2">Henüz randevu kaydı bulunmamaktadır.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Yapılan İşlemler</CardTitle>
        </CardHeader>
        <CardContent>
          {isServicesLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : services.length > 0 ? (
            <div className="space-y-4">
              {services.slice(0, 5).map((service: any) => (
                <div 
                  key={service.id} 
                  className="border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{service.aciklama}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(service.created_at), "dd MMMM yyyy", { locale: tr })}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">{service.tutar} ₺</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground py-2">Henüz işlem kaydı bulunmamaktadır.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
