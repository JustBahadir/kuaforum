
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, User, Scissors, Star } from "lucide-react";

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
      
      {/* Salon görüntüsü ve karşılama mesajı */}
      <div className="relative rounded-xl overflow-hidden h-56 mb-8">
        <img 
          src="/lovable-uploads/f7293d7f-094b-4699-9925-97ef8c28d7b6.png" 
          alt="Kuaför Salonu" 
          className="w-full h-full object-cover brightness-75"
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-4 text-center">
          <h2 className="text-3xl font-bold mb-2 drop-shadow-lg">Profesyonel Bakım</h2>
          <p className="text-xl max-w-md drop-shadow-md">
            Uzman ekibimiz ile saç ve cilt bakımınız için en iyi hizmeti sunuyoruz
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-purple-500">
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

        <Card className="border-l-4 border-l-blue-500">
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

        <Card className="border-l-4 border-l-green-500">
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

      {/* Özel içerik bölümü */}
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 flex flex-col md:flex-row items-center gap-4">
          <img 
            src="/lovable-uploads/de9d072c-d555-475a-93c2-9619d672aab3.png" 
            alt="Profesyonel Hizmet" 
            className="w-20 h-20 rounded-full object-cover"
          />
          <div>
            <h3 className="text-lg font-semibold mb-1">Profesyonel Saç Bakımı</h3>
            <p className="text-sm text-gray-600">En yeni trendler ve kişiye özel saç modelleri ile her zaman şık görünün.</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl p-6 flex flex-col md:flex-row items-center gap-4">
          <img 
            src="/lovable-uploads/92dfa3e0-73fb-43d6-9a4f-f5a0b8c98823.png" 
            alt="Özel Bakım" 
            className="w-20 h-20 rounded-full object-cover"
          />
          <div>
            <h3 className="text-lg font-semibold mb-1">Uzman Ekip</h3>
            <p className="text-sm text-gray-600">Deneyimli ve profesyonel ekibimiz ile memnuniyet garantili hizmet sunuyoruz.</p>
          </div>
        </div>
      </div>

      <Card className="mt-4 border-2 border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="text-center text-xl">Yeni Randevu Oluştur</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-4">
            İstediğiniz hizmeti seçerek hızlıca randevu oluşturabilirsiniz.
          </p>
          <div className="flex justify-center">
            <Star className="text-yellow-500 h-6 w-6" />
            <Star className="text-yellow-500 h-6 w-6" />
            <Star className="text-yellow-500 h-6 w-6" />
            <Star className="text-yellow-500 h-6 w-6" />
            <Star className="text-yellow-500 h-6 w-6" />
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link to="/appointments" className="w-full max-w-xs">
            <Button className="w-full bg-purple-700 hover:bg-purple-800">Yeni Randevu Oluştur</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
