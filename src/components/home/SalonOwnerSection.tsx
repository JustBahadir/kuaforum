
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Settings, BarChart3 } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

export const SalonOwnerSection = () => {
  return (
    <div className="lg:w-[35%]">
      <Card className="shadow-lg border-t-4 border-t-purple-500 h-full">
        <CardHeader>
          <CardTitle className="text-2xl text-purple-700">Salon Sahipleri İçin</CardTitle>
          <CardDescription>
            İşletmenizi daha verimli yönetin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg flex items-start space-x-3">
              <Calendar className="text-purple-500 shrink-0 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Randevu Yönetimi</h3>
                <p className="text-sm text-gray-600">Randevuları tek bir yerden yönetin</p>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg flex items-start space-x-3">
              <Users className="text-purple-500 shrink-0 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Müşteri Yönetimi</h3>
                <p className="text-sm text-gray-600">Müşteri bilgilerini saklayın ve analiz edin</p>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg flex items-start space-x-3">
              <Settings className="text-purple-500 shrink-0 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Hizmet Yönetimi</h3>
                <p className="text-sm text-gray-600">Hizmetlerinizi ve fiyatlarınızı kolayca güncelleyin</p>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg flex items-start space-x-3">
              <BarChart3 className="text-purple-500 shrink-0 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">İstatistikler</h3>
                <p className="text-sm text-gray-600">Salonunuzun performansını takip edin</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col md:flex-row gap-4 justify-between border-t pt-6">
          <Link to="/admin" className="w-full md:w-auto">
            <Button variant="outline" className="w-full">Giriş Yap</Button>
          </Link>
          <Link to="/admin/register" className="w-full md:w-auto">
            <Button className="w-full">Hemen Kaydolun</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};
