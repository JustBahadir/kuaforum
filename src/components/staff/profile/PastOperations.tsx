
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

export function PastOperations() {
  const [operations, setOperations] = useState<any[]>([]);

  useEffect(() => {
    const getOperations = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        const { data: personelData } = await supabase
          .from('personel')
          .select('id')
          .eq('auth_id', user.id)
          .single();
          
        if (personelData?.id) {
          const { data } = await supabase
            .from('personel_islemleri')
            .select('*')
            .eq('personel_id', personelData.id)
            .order('created_at', { ascending: false });
            
          if (data) {
            setOperations(data);
          }
        }
      }
    };
    
    getOperations();
  }, []);

  return (
    <Card>
      <CardContent className="p-4">
        {operations.length > 0 ? (
          <div className="space-y-4">
            {operations.map((op) => (
              <div key={op.id} className="border-b pb-4">
                <p className="font-medium">{op.aciklama}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(op.created_at).toLocaleString('tr-TR')}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            Henüz işlem geçmişi bulunmuyor
          </p>
        )}
      </CardContent>
    </Card>
  );
}
