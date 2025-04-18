
import React from "react";
import { Button } from "@/components/ui/button";
import { Search, User, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export const LoginSection = () => {
  const navigate = useNavigate();

  return (
    <Card className="p-6 shadow-lg border-2">
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              className="flex-1 h-12" 
              variant="outline"
              onClick={() => navigate("/login")}
            >
              <User className="mr-2" />
              Müşteri Girişi
            </Button>
            <Button 
              className="flex-1 h-12"
              onClick={() => navigate("/staff-login")}
            >
              <Users className="mr-2" />
              Kuaför Girişi
            </Button>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Hizmet Ara</h3>
            <div className="space-y-4">
              <div className="flex gap-2 flex-col sm:flex-row">
                <Input placeholder="Hizmet veya salon adı" />
                <Input placeholder="Şehir seçin" />
              </div>
              <Button className="w-full">
                <Search className="mr-2" />
                Ara
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Card>
  );
};
