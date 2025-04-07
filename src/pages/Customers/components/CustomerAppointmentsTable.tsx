
import { useQuery } from "@tanstack/react-query";
import { randevuServisi } from "@/lib/supabase";
import { Card } from "@/components/ui/card";

interface CustomerAppointmentsTableProps {
  customerId: number;
  limitCount?: number;
}

export function CustomerAppointmentsTable({ customerId, limitCount }: CustomerAppointmentsTableProps) {
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['customerAppointments', customerId, limitCount],
    queryFn: async () => {
      // Using the correct method name from randevuServisi
      const data = await randevuServisi.kendiRandevulariniGetir();
      // Filter the appointments by customer ID
      const customerAppointments = data.filter(appointment => appointment.musteri_id === customerId);
      return limitCount ? customerAppointments.slice(0, limitCount) : customerAppointments;
    },
    enabled: !!customerId
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        Henüz randevu kaydı bulunmuyor.
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Saat</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {appointments.map((appointment) => (
            <tr key={appointment.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {new Date(appointment.tarih).toLocaleDateString('tr-TR')}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {appointment.saat}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {/* Placeholder for service name extraction from islemler JSON */}
                {appointment.islemler?.length > 0 ? 'Çeşitli İşlemler' : '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  appointment.durum === 'tamamlandi' ? 'bg-green-100 text-green-800' :
                  appointment.durum === 'iptal' ? 'bg-red-100 text-red-800' :
                  appointment.durum === 'beklemede' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {appointment.durum === 'tamamlandi' ? 'Tamamlandı' :
                   appointment.durum === 'iptal' ? 'İptal' :
                   appointment.durum === 'beklemede' ? 'Beklemede' :
                   'Onaylandı'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
