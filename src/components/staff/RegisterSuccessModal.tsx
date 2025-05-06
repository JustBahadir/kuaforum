
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface RegisterSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function RegisterSuccessModal({ open, onOpenChange, onSuccess }: RegisterSuccessModalProps) {
  const handleClose = () => {
    onOpenChange(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Personel Kaydı Başarılı</DialogTitle>
        </DialogHeader>
        <p className="py-4">
          Personel kaydı başarıyla oluşturulmuştur. Personelin sisteme giriş yapabilmesi için hesabını oluşturması gerekmektedir. Bu işlem için bir davetiye e-postası gönderilmiştir.
        </p>
        <DialogFooter>
          <Button onClick={handleClose} className="w-full">
            Tamam
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
