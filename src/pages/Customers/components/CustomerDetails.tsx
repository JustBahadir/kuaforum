
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { musteriServisi } from "@/lib/supabase/services/musteriServisi";
import { islemServisi } from "@/lib/supabase/services/islemServisi";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerInfo } from "./CustomerInfo";
import { CustomerAppointmentsTable } from "./CustomerAppointmentsTable";
import { CustomerOperationsTable } from "./CustomerOperationsTable";

interface CustomerDetailsProps {
  customerId: number;
}

export function CustomerDetails({ customerId }: CustomerDetailsProps) {
  const [activeTab, setActiveTab] = useState("info");

  const { data: customer, isLoading } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: async () => {
      return await musteriServisi.getir(customerId);
    },
    enabled: !!customerId,
  });

  const { data: operations = [] } = useQuery({
    queryKey: ["customerOperations", customerId],
    queryFn: async () => {
      return await islemServisi.musteriIslemleriniGetir(customerId);
    },
    enabled: !!customerId,
  });

  if (isLoading) {
    return <CustomerLoadingState />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div>
            {customer?.first_name} {customer?.last_name}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              {customer?.phone && `· ${customer.phone}`}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Müşteri Bilgileri</TabsTrigger>
            <TabsTrigger value="appointments">Randevu Geçmişi</TabsTrigger>
            <TabsTrigger value="operations">İşlem Geçmişi</TabsTrigger>
          </TabsList>
          <div className="mt-6">
            <TabsContent value="info">
              <CustomerInfo customer={customer} />
            </TabsContent>
            <TabsContent value="appointments">
              <CustomerAppointmentsTable customerId={customerId} />
            </TabsContent>
            <TabsContent value="operations">
              <CustomerOperationsTable operations={operations} />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function CustomerLoadingState() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-64" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
