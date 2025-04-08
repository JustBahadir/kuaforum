
import React from "react";
import { ProfileDisplay } from "@/components/customer-profile/ProfileDisplay";

interface CustomerProfileProps {
  customer: any;
}

export function CustomerProfile({ customer }: CustomerProfileProps) {
  // Format customer data to match ProfileDisplay props
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 gap-2">
        <div className="grid grid-cols-3 items-center border-b py-2">
          <div className="font-medium">İsim</div>
          <div className="col-span-2">{customer.first_name} {customer.last_name}</div>
        </div>
        
        <div className="grid grid-cols-3 items-center border-b py-2">
          <div className="font-medium">Telefon</div>
          <div className="col-span-2">{customer.phone || "Belirtilmemiş"}</div>
        </div>
        
        <div className="grid grid-cols-3 items-center border-b py-2">
          <div className="font-medium">Doğum Tarihi</div>
          <div className="col-span-2">{customer.birthdate || "Belirtilmemiş"}</div>
        </div>
        
        <div className="grid grid-cols-3 items-center border-b py-2">
          <div className="font-medium">Kayıt Tarihi</div>
          <div className="col-span-2">{customer.created_at ? new Date(customer.created_at).toLocaleDateString('tr-TR') : "Belirtilmemiş"}</div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-1 mt-4">
          <div className="font-medium">Not Ekle</div>
          <textarea
            className="w-full border p-2 rounded-md mt-1"
            rows={4}
            placeholder="Müşteri hakkında notlarınızı buraya ekleyin..."
          ></textarea>
          <div className="flex justify-end mt-2">
            <button className="px-4 py-1 bg-gray-200 rounded-md text-sm">Kaydet</button>
          </div>
        </div>
      </div>
    </div>
  );
}
