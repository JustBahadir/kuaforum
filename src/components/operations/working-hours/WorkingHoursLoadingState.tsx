
import { Skeleton } from "@/components/ui/skeleton";

export function WorkingHoursLoadingState() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-9 w-24" />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted p-4 flex">
          <Skeleton className="h-6 w-24 mr-auto" />
          <Skeleton className="h-6 w-24 mx-auto" />
          <Skeleton className="h-6 w-24 ml-auto" />
        </div>
        
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="p-4 border-t flex items-center">
            <Skeleton className="h-6 w-24 mr-auto" />
            <Skeleton className="h-6 w-24 mx-auto" />
            <Skeleton className="h-6 w-24 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
