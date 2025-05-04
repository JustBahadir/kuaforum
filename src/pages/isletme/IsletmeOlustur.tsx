
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const IsletmeOlustur = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">İşletme Bilgilerinizi Tamamlayın</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Bu sayfa yapım aşamasındadır. İşletmenizin diğer detayları burada tamamlanacaktır.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default IsletmeOlustur;
