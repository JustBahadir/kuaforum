
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatPhoneNumber } from "@/utils/phoneFormatter";

interface ShopPersonnelCardProps {
  personelListesi: any[];
  userRole: string;
}

export function ShopPersonnelCard({ personelListesi, userRole }: ShopPersonnelCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Uzman Personeller</CardTitle>
        {userRole === 'admin' && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.href = "/personnel"}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Personel Ekle
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {personelListesi.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            Henüz personel bulunmuyor.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {personelListesi.map((personel: any) => (
              <div key={personel.id} className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                <Avatar>
                  <AvatarImage src={personel.avatar_url} />
                  <AvatarFallback className="bg-purple-100 text-purple-600">
                    {personel.ad_soyad.split(' ').map((name: string) => name[0]).join('').substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{personel.ad_soyad}</h3>
                  {/* Only show phone numbers to admins */}
                  {userRole === 'admin' && personel.telefon && (
                    <p className="text-sm text-muted-foreground">
                      {formatPhoneNumber(personel.telefon)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
