
import { cn } from "@/lib/utils";

type AppointmentStatus = 'beklemede' | 'onaylandi' | 'iptal_edildi' | 'tamamlandi';

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
  className?: string;
}

export function AppointmentStatusBadge({ status, className }: AppointmentStatusBadgeProps) {
  const getStatusStyle = (status: AppointmentStatus) => {
    switch(status) {
      case 'beklemede':
        return 'bg-yellow-100 text-yellow-800';
      case 'onaylandi':
        return 'bg-green-100 text-green-800';
      case 'iptal_edildi':
        return 'bg-red-100 text-red-800';
      case 'tamamlandi':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={cn(`text-xs px-2 py-1 rounded ${getStatusStyle(status)}`, className)}>
      {status}
    </span>
  );
}
