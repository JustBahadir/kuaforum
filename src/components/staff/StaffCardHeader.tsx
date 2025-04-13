
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

interface StaffCardHeaderProps {
  onBack: () => void;
}

export function StaffCardHeader({ onBack }: StaffCardHeaderProps) {
  return (
    <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onBack}
        className="text-white hover:text-white/80 hover:bg-white/10 absolute top-2 left-2 p-2"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <CardTitle className="text-center text-2xl">Kuaför Girişi</CardTitle>
    </CardHeader>
  );
}
