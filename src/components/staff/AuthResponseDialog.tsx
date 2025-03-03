
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";

interface AuthResponseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  responseData: any;
}

export function AuthResponseDialog({ 
  open, 
  onOpenChange, 
  responseData 
}: AuthResponseDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Auth Yanıt Detayları</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="bg-gray-100 p-3 rounded text-xs font-mono overflow-auto max-h-64">
              {JSON.stringify(responseData, null, 2)}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>Kapat</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
