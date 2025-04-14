
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";

export function PersonalProfileLink() {
  const navigate = useNavigate();
  const { userRole } = useCustomerAuth();
  
  const handleProfileClick = () => {
    if (userRole === 'staff' || userRole === 'admin') {
      navigate('/staff-profile');
    }
  };

  if (userRole !== 'staff' && userRole !== 'admin') {
    return null;
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Personel Profilim</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Kişisel profilinizi görüntüleyin ve güncelleyin.
        </p>
        <Button onClick={handleProfileClick} className="w-full">
          <UserCircle className="mr-2 h-4 w-4" />
          Profile Git
        </Button>
      </CardContent>
    </Card>
  );
}
