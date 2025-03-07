
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { musteriServisi } from "@/lib/supabase";
import { formatPhoneNumber } from "@/utils/phoneFormatter";

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
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
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

  // Filter customers based on search query with Turkish character support
  const filteredCustomers = searchQuery === "" 
    ? customers 
    : customers.filter(customer => {
        const searchLower = searchQuery.toLowerCase();
        const fullName = `${customer.first_name} ${customer.last_name || ""}`.toLowerCase();
        const phone = customer.phone || "";
        
        return fullName.includes(searchLower) ||
               phone.includes(searchQuery.replace(/\D/g, ""));
      });

  return (
    <div className="space-y-2">
      <Label>Müşteri Seçin*</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value && selectedCustomer
              ? `${selectedCustomer.first_name} ${selectedCustomer.last_name || ""} ${
                  selectedCustomer.phone ? `(${formatPhoneNumber(selectedCustomer.phone)})` : ""
                }`
              : "Müşteri seçin"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput 
              placeholder="Müşteri ara..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandGroup className="max-h-[300px] overflow-y-auto">
              {filteredCustomers.length === 0 ? (
                <CommandEmpty>
                  <div className="py-6 text-center">
                    <p>Müşteri bulunamadı.</p>
                  </div>
                </CommandEmpty>
              ) : (
                filteredCustomers.map((customer) => (
                  <CommandItem
                    key={customer.id}
                    value={`${customer.id}-${customer.first_name}`}
                    onSelect={() => {
                      onChange(customer.id);
                      setOpen(false);
                    }}
                    className="flex items-center cursor-pointer py-3 px-2"
                  >
                    <div className="flex items-center w-full">
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === customer.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{customer.first_name} {customer.last_name || ""}</span>
                        {customer.phone && (
                          <span className="text-sm text-muted-foreground">
                            {formatPhoneNumber(customer.phone)}
                          </span>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))
              )}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
