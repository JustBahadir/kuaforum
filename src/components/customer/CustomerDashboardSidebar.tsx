
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from '@/utils/currencyFormatter';

export function CustomerDashboardSidebar() {
  const { user } = useAuth();
  
  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="font-medium text-lg mb-2">Kullanıcı Bilgileri</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm text-muted-foreground">E-posta</h3>
            <p>{user?.email}</p>
          </div>
          
          <div>
            <h3 className="text-sm text-muted-foreground">Son Randevu</h3>
            <p>Henüz randevu alınmamış</p>
          </div>

          <div className="pt-4 border-t">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.href = '/dashboard/appointments/new'}
            >
              Yeni Randevu
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
