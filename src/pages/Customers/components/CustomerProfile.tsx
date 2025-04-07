
import { Musteri } from "@/lib/supabase/types";
import { Badge } from "@/components/ui/badge";

interface CustomerProfileProps {
  customer: Musteri;
}

export function CustomerProfile({ customer }: CustomerProfileProps) {
  const getBadgeForCustomer = () => {
    const createdDate = new Date(customer.created_at!);
    const now = new Date();
    const diffMonths = (now.getFullYear() - createdDate.getFullYear()) * 12 + now.getMonth() - createdDate.getMonth();
    
    if (diffMonths < 1) return { label: "Yeni Müşteri", variant: "default" };
    if (diffMonths < 6) return { label: "Düzenli Müşteri", variant: "secondary" };
    return { label: "Sadık Müşteri", variant: "outline" };
  };

  const badge = getBadgeForCustomer();
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Badge variant={badge.variant as any}>{badge.label}</Badge>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="font-medium text-gray-500">İsim</div>
          <div className="col-span-2">{customer.first_name} {customer.last_name || ''}</div>
          
          {customer.phone && (
            <>
              <div className="font-medium text-gray-500">Telefon</div>
              <div className="col-span-2">{customer.phone}</div>
            </>
          )}
          
          {customer.birthdate && (
            <>
              <div className="font-medium text-gray-500">Doğum Tarihi</div>
              <div className="col-span-2">{new Date(customer.birthdate).toLocaleDateString('tr-TR')}</div>
            </>
          )}
          
          <div className="font-medium text-gray-500">Kayıt Tarihi</div>
          <div className="col-span-2">{new Date(customer.created_at!).toLocaleDateString('tr-TR')}</div>
        </div>
      </div>
      
      <div className="pt-4 border-t">
        <h4 className="text-sm font-medium mb-2">Not Ekle</h4>
        <textarea 
          className="w-full p-2 border rounded-md text-sm min-h-[100px]" 
          placeholder="Müşteri hakkında notlarınızı buraya ekleyin..."
        />
        <div className="flex justify-end mt-2">
          <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm">
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
