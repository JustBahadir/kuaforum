
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
        <CardContent className="p-4 md:p-6">
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-3 md:gap-4">
                <Skeleton className="h-10 w-10 md:h-12 md:w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-3 md:h-4 w-[150px] md:w-[200px]" />
                  <Skeleton className="h-3 md:h-4 w-[100px] md:w-[150px]" />
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
      return format(new Date(dateString), "dd.MM.yyyy", { locale: tr });
    } catch (error) {
      return "-";
    }
  };

  // Mobile card view for customers
  const MobileCustomerCard = ({ customer }: { customer: Musteri }) => (
    <div 
      className="p-3 border-b last:border-0 flex items-center gap-3"
      onClick={() => onSelectCustomer && onSelectCustomer(customer)}
    >
      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-medium text-sm">
        {customer.first_name?.[0] || "?"}{customer.last_name?.[0] || ""}
      </div>
      <div>
        <div className="font-medium text-sm">
          {customer.first_name} {customer.last_name || ""}
        </div>
        <div className="text-xs text-gray-500">
          {customer.phone ? formatPhoneNumber(customer.phone) : "-"}
        </div>
        <div className="text-xs text-gray-500">
          Kayıt: {formatDate(customer.created_at)}
        </div>
      </div>
    </div>
  );

  // Show empty state or customer list
  return (
    <Card>
      <CardContent className={customers.length === 0 ? "p-4 md:p-6 text-center text-muted-foreground" : "p-0"}>
        {customers.length === 0 ? (
          <div className="py-6 md:py-8">
            <p className="text-base md:text-lg mb-2">Müşteri bulunamadı</p>
            <p className="text-xs md:text-sm">Hiç müşteri kaydı mevcut değil veya arama kriterlerinize uygun sonuç yok.</p>
          </div>
        ) : (
          <>
            {/* Mobile view */}
            <div className="md:hidden">
              {customers.map((customer) => (
                <MobileCustomerCard key={customer.id} customer={customer} />
              ))}
            </div>

            {/* Desktop view */}
            <div className="hidden md:block">
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
                    <TableRow key={customer.id} 
                      className="cursor-pointer hover:bg-gray-50"
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
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
