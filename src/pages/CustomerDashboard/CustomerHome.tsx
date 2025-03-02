
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, User, Scissors } from "lucide-react";

export default function CustomerHome() {
  const [userName, setUserName] = useState("");
  const [appointmentCount, setAppointmentCount] = useState(0);
  
  useEffect(() => {
    async function fetchUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();
          
        if (profile) {
          setUserName(`${profile.first_name || ''} ${profile.last_name || ''}`.trim());
        }

        // Get appointment count
        const { data: appointments, error } = await supabase
          .from('randevular')
          .select('id')
          .eq('customer_id', user.id);
          
        if (error) {
          console.error("Error fetching appointments:", error);
        } else {
          setAppointmentCount(appointments?.length || 0);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }

    fetchUserData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold">Hoş Geldiniz {userName ? userName : "Değerli Müşterimiz"}</h1>
        <p className="text-gray-600 mt-1">Kişisel kuaför hesabınızı yönetin ve randevularınızı takip edin.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-purple-500" />
              Randevularım
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{appointmentCount}</p>
            <p className="text-sm text-gray-500">Toplam randevunuz bulunmaktadır</p>
          </CardContent>
          <CardFooter>
            <Link to="/customer-dashboard/appointments" className="w-full">
              <Button variant="outline" className="w-full">Randevularımı Görüntüle</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <User className="mr-2 h-5 w-5 text-blue-500" />
              Profil Bilgilerim
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Kişisel bilgilerinizi güncelleyin ve iletişim tercihlerinizi yönetin
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/customer-dashboard/profile" className="w-full">
              <Button variant="outline" className="w-full">Profil Bilgilerimi Düzenle</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Scissors className="mr-2 h-5 w-5 text-green-500" />
              Hizmetlerimiz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Salon hizmetlerimizi görüntüleyin ve yeni randevu oluşturun
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/customer-dashboard/services" className="w-full">
              <Button variant="outline" className="w-full">Hizmetleri Görüntüle</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Yeni Randevu Oluştur</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-600">
          <p>İstediğiniz hizmeti seçerek hızlıca randevu oluşturabilirsiniz.</p>
        </CardContent>
        <CardFooter>
          <Link to="/appointments" className="w-full">
            <Button className="w-full">Yeni Randevu Oluştur</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
