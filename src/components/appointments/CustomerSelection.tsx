
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { musteriServisi } from "@/lib/supabase";
import { formatPhoneNumber } from "@/utils/phoneFormatter";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Customer {
  id: number;
  first_name: string;
  last_name: string | null;
  phone: string | null;
}

interface CustomerSelectionProps {
  dukkanId?: number;
  value: number | undefined;
  onChange: (value: number) => void;
}

export function CustomerSelection({ dukkanId, value, onChange }: CustomerSelectionProps) {
  // Fetch customers for the salon
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers", dukkanId],
    queryFn: async () => {
      if (!dukkanId) return [];
      return await musteriServisi.hepsiniGetir(dukkanId);
    },
    enabled: !!dukkanId,
  });

  // Selected customer
  const selectedCustomer = customers.find(
    (customer) => customer.id === value
  );

  // Format the display name for the selected customer
  const getDisplayName = (customer?: Customer) => {
    if (!customer) return "Müşteri seçin";
    
    return `${customer.first_name} ${customer.last_name || ""} ${
      customer.phone ? `(${formatPhoneNumber(customer.phone)})` : ""
    }`.trim();
  };

  return (
    <div className="space-y-2">
      <Label>Müşteri Seçin*</Label>
      <Select
        disabled={isLoading}
        onValueChange={(value) => onChange(parseInt(value))}
        value={value ? value.toString() : undefined}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Müşteri seçin">
            {value ? getDisplayName(selectedCustomer) : "Müşteri seçin"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          <ScrollArea className="h-[300px]">
            {isLoading ? (
              <SelectItem value="loading" disabled>
                Yükleniyor...
              </SelectItem>
            ) : customers && customers.length > 0 ? (
              customers.map((customer) => (
                <SelectItem
                  key={customer.id}
                  value={customer.id.toString()}
                  className="flex py-3"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{customer.first_name} {customer.last_name || ""}</span>
                    {customer.phone && (
                      <span className="text-sm text-muted-foreground">
                        {formatPhoneNumber(customer.phone)}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))
            ) : (
              <SelectItem value="none" disabled>
                Müşteri bulunamadı
              </SelectItem>
            )}
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  );
}
