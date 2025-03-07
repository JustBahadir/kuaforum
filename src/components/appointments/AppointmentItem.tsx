
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Randevu } from "@/lib/supabase/types";
import { AppointmentStatusBadge } from "./AppointmentStatusBadge";

interface AppointmentItemProps {
  appointment: Randevu;
  currentPersonelId: number | null;
  onCompleteClick: (appointment: Randevu) => void;
  onCancelClick: (appointment: Randevu) => void;
}

export function AppointmentItem({ 
  appointment, 
  currentPersonelId, 
  onCompleteClick, 
  onCancelClick 
}: AppointmentItemProps) {
  const getAppointmentContainerStyle = () => {
    if (currentPersonelId && appointment.personel_id === currentPersonelId) {
      return "flex border-2 border-purple-400 p-4 rounded-lg bg-purple-50";
    }
    return "flex border p-4 rounded-lg";
  };

  return (
    <div key={appointment.id} className={getAppointmentContainerStyle()}>
      <div className="w-20 text-center font-medium">
        {appointment.saat.substring(0, 5)}
      </div>
      <div className="flex-1 border-l pl-4">
        <div className="flex justify-between">
          <div>
            <p className="font-medium">
              {appointment.musteri?.first_name} {appointment.musteri?.last_name}
            </p>
            <p className="text-sm text-gray-500">
              {appointment.personel?.ad_soyad || "Personel atanmadı"}
            </p>
          </div>
          <AppointmentStatusBadge status={appointment.durum} />
        </div>
        {appointment.islemler && appointment.islemler.length > 0 && (
          <div className="mt-2 text-sm">
            <p className="font-medium">İşlemler:</p>
            <ul className="list-disc pl-5">
              {appointment.islemler.map((islemId, index) => (
                <li key={index}>{islemId}</li>
              ))}
            </ul>
          </div>
        )}
        {appointment.notlar && (
          <p className="mt-2 text-sm">
            <span className="font-medium">Not:</span> {appointment.notlar}
          </p>
        )}
        
        {appointment.durum !== 'tamamlandi' && appointment.durum !== 'iptal_edildi' && (
          <div className="flex gap-2 mt-3">
            <Button 
              size="sm" 
              variant="outline"
              className="bg-green-50 text-green-600 hover:text-green-700 hover:bg-green-100 border-green-200"
              onClick={() => onCompleteClick(appointment)}
            >
              <Check className="h-4 w-4 mr-1" />
              İşlem Gerçekleşti
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="bg-red-50 text-red-600 hover:text-red-700 hover:bg-red-100 border-red-200"
              onClick={() => onCancelClick(appointment)}
            >
              <X className="h-4 w-4 mr-1" />
              İptal Et
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
