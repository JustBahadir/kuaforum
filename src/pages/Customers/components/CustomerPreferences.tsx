import { useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

interface CustomerPreferencesProps {
  customerId?: string;
  children?: ReactNode;
}

interface Preference {
  cologne_preference: string | null;
  razor_preference: string | null;
  ear_burning: boolean;
  custom_preferences: Record<string, any> | null;
}

export function CustomerPreferences({ customerId, children }: CustomerPreferencesProps) {
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [preferences, setPreferences] = useState<Preference>({
    cologne_preference: null,
    razor_preference: null,
    ear_burning: false,
    custom_preferences: null
  });

  // Fetch customer preferences only if customerId is provided
  const { data: existingPreferences, isLoading } = useQuery({
    queryKey: ['customer_preferences', customerId],
    queryFn: async () => {
      if (!customerId) return null;
      
      const { data, error } = await supabase
        .from('customer_preferences')
        .select('*')
        .eq('customer_id', customerId)
        .maybeSingle();
        
      if (error) throw error;
      return data;
    },
    enabled: !!customerId
  });

  // Prefill form with existing data
  useEffect(() => {
    if (existingPreferences) {
      setPreferences({
        cologne_preference: existingPreferences.cologne_preference,
        razor_preference: existingPreferences.razor_preference,
        ear_burning: existingPreferences.ear_burning || false,
        custom_preferences: existingPreferences.custom_preferences
      });
    }
  }, [existingPreferences]);

  // Update or create preferences
  const mutation = useMutation({
    mutationFn: async (data: Preference) => {
      if (!customerId) return null;
      
      if (existingPreferences) {
        // Update existing preferences
        const { error } = await supabase
          .from('customer_preferences')
          .update({
            cologne_preference: data.cologne_preference,
            razor_preference: data.razor_preference,
            ear_burning: data.ear_burning,
            custom_preferences: data.custom_preferences,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingPreferences.id);
          
        if (error) throw error;
      } else {
        // Create new preferences
        const { error } = await supabase
          .from('customer_preferences')
          .insert({
            customer_id: customerId,
            cologne_preference: data.cologne_preference,
            razor_preference: data.razor_preference,
            ear_burning: data.ear_burning,
            custom_preferences: data.custom_preferences
          });
          
        if (error) throw error;
      }
    },
    onSuccess: () => {
      if (customerId) {
        queryClient.invalidateQueries({
          queryKey: ['customer_preferences', customerId]
        });
      }
      setEditMode(false);
      toast.success("Müşteri tercihleri kaydedildi");
    },
    onError: (error) => {
      console.error("Müşteri tercihleri kaydedilemedi:", error);
      toast.error("Müşteri tercihleri kaydedilemedi");
    }
  });

  const handleSave = () => {
    mutation.mutate(preferences);
  };

  const handleInputChange = (field: keyof Preference, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // If children are provided, just render them
  if (children) {
    return <div className="p-6 space-y-6">{children}</div>;
  }

  // Otherwise render the full preference editor (only when customerId is available)
  if (!customerId) {
    return <div className="p-6 text-center">Müşteri ID gereklidir</div>;
  }

  if (isLoading) {
    return <div className="p-6 text-center">Tercihler yükleniyor...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Müşteri Tercihleri</h3>
        <Button 
          variant="outline" 
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? "İptal" : "Düzenle"}
        </Button>
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Label htmlFor="cologne">Kolonya Tercihi</Label>
            <Input
              id="cologne"
              placeholder="Limon, Lavanta, vb."
              value={preferences.cologne_preference || ""}
              onChange={(e) => handleInputChange('cologne_preference', e.target.value)}
              disabled={!editMode}
            />
          </div>
          
          <div className="space-y-4">
            <Label htmlFor="razor">Jilet/Ustura Tercihi</Label>
            <Input
              id="razor"
              placeholder="Jilet markası, ustura tipi, vb."
              value={preferences.razor_preference || ""}
              onChange={(e) => handleInputChange('razor_preference', e.target.value)}
              disabled={!editMode}
            />
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="ear_burning" className="cursor-pointer">
              Kulak Yakma İster
            </Label>
            <Switch
              id="ear_burning"
              checked={preferences.ear_burning}
              onCheckedChange={(checked) => handleInputChange('ear_burning', checked)}
              disabled={!editMode}
            />
          </div>
        </div>
        
        {editMode && (
          <div className="flex justify-end">
            <Button 
              onClick={handleSave}
              disabled={mutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {mutation.isPending ? "Kaydediliyor..." : "Tercihleri Kaydet"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
