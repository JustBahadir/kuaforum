
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerOperationsTable } from "./CustomerOperationsTable";
import { CustomerPreferences } from "./CustomerPreferences";
import { Musteri } from "@/lib/supabase/types";
import { formatPhoneNumber } from "@/utils/phoneFormatter";
import { Button } from "@/components/ui/button";
import { Pencil, User, Calendar, Gift, Star } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface CustomerDetailsProps {
  customer: Musteri;
  onEdit?: () => void;
}

export function CustomerDetails({ customer, onEdit }: CustomerDetailsProps) {
  const [activeTab, setActiveTab] = useState<string>("info");

  // Format date for display
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: tr });
    } catch (error) {
      return "-";
    }
  };

  // Calculate customer's initials for avatar
  const getInitials = () => {
    if (!customer.first_name) return "?";
    return `${customer.first_name.charAt(0)}${customer.last_name ? customer.last_name.charAt(0) : ''}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center">
            <span>Müşteri Bilgileri</span>
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-1" />
              Düzenle
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
            </Avatar>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6 flex-1">
              <div>
                <h3 className="text-sm font-medium text-gray-500">AD SOYAD</h3>
                <p className="mt-1 text-base">
                  {customer.first_name} {customer.last_name || ''} 
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">TELEFON</h3>
                <p className="mt-1 text-base">
                  {customer.phone && formatPhoneNumber(customer.phone) || '-'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">DOĞUM TARİHİ</h3>
                <p className="mt-1 text-base">{formatDate(customer.birthdate)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">KAYIT TARİHİ</h3>
                <p className="mt-1 text-base">{formatDate(customer.created_at)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="info" className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            Kişisel Bilgiler
          </TabsTrigger>
          <TabsTrigger value="operations" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            İşlem Geçmişi
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center">
            <Star className="h-4 w-4 mr-2" />
            Tercihler
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kişisel Detaylar</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerPersonalInfo customerId={customer.id} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="operations" className="space-y-4">
          <CustomerOperationsTable customerId={customer.id.toString()} />
        </TabsContent>
        
        <TabsContent value="preferences" className="space-y-4">
          <CustomerPreferences customerId={customer.id.toString()} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CustomerPersonalInfo({ customerId }: { customerId: number }) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">Bu müşteri için ek kişisel bilgi kaydedilmemiş.</p>
    </div>
  );
}
