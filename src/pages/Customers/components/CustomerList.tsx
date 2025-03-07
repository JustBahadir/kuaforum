
import { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Musteri } from "@/lib/supabase/types";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { formatPhoneNumber } from "@/utils/phoneFormatter";

interface CustomerListProps {
  customers: Musteri[];
  isLoading: boolean;
  onSelectCustomer?: (customer: Musteri) => void;
}

export function CustomerList({ customers, isLoading, onSelectCustomer }: CustomerListProps) {
  // Show loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format date for display
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: tr });
    } catch (error) {
      return "-";
    }
  };

  // Show empty state or customer list
  return (
    <Card>
      <CardContent className={customers.length === 0 ? "p-6 text-center text-muted-foreground" : "p-0"}>
        {customers.length === 0 ? (
          <div className="py-8">
            <p className="text-lg mb-2">Müşteri bulunamadı</p>
            <p className="text-sm">Hiç müşteri kaydı mevcut değil veya arama kriterlerinize uygun sonuç yok.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>İsim Soyisim</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Doğum Tarihi</TableHead>
                <TableHead>Kayıt Tarihi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id} className="cursor-pointer hover:bg-gray-50"
                  onClick={() => onSelectCustomer && onSelectCustomer(customer)}>
                  <TableCell className="font-medium">
                    {customer.first_name} {customer.last_name || ""}
                  </TableCell>
                  <TableCell>{customer.phone ? formatPhoneNumber(customer.phone) : "-"}</TableCell>
                  <TableCell>{formatDate(customer.birthdate)}</TableCell>
                  <TableCell>{formatDate(customer.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
