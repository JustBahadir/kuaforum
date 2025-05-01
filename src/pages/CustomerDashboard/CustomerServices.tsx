
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function CustomerServices() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hizmetlerimiz</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Size özel hizmetlerimizi keşfedin ve hemen randevu alın.
          </p>
          <Button 
            onClick={() => navigate('/dashboard/appointments/new')}
            className="bg-purple-600 hover:bg-purple-700 text-white w-full"
          >
            Randevu Al
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
