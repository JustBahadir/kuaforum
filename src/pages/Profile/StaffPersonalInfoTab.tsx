
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { CalendarIcon, Loader2, Upload } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export interface StaffPersonalInfoTabProps {
  profile: any;
  handleChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange?: (name: string, value: string) => void;
  handleAvatarUpload?: (file: File) => Promise<void>;
  isLoading?: boolean;
  updateProfile?: (data: any) => Promise<void>;
}

export default function StaffPersonalInfoTab({
  profile = {},
  handleChange = () => {},
  handleSelectChange = () => {},
  handleAvatarUpload = async () => {},
  isLoading = false,
  updateProfile = async () => {},
}: StaffPersonalInfoTabProps) {
  const [date, setDate] = useState<Date | undefined>(
    profile.birthdate ? new Date(profile.birthdate) : undefined
  );

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate) {
      handleSelectChange('birthdate', format(newDate, 'yyyy-MM-dd'));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleAvatarUpload(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(profile);
  };

  const getNameInitials = () => {
    const firstName = profile.first_name || '';
    const lastName = profile.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Avatar className="h-24 w-24">
            {profile.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt={profile.first_name} />
            ) : (
              <AvatarFallback>{getNameInitials() || 'U'}</AvatarFallback>
            )}
          </Avatar>
          <div className="absolute bottom-0 right-0">
            <label htmlFor="avatar-upload" className="cursor-pointer">
              <div className="bg-primary text-primary-foreground rounded-full p-2 shadow-sm">
                <Upload className="h-4 w-4" />
              </div>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={isLoading}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="first_name">Ad</Label>
          <Input
            id="first_name"
            name="first_name"
            value={profile.first_name || ''}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Soyad</Label>
          <Input
            id="last_name"
            name="last_name"
            value={profile.last_name || ''}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="birthdate">Doğum Tarihi</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
                disabled={isLoading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP", { locale: tr }) : <span>Bir tarih seçin</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateChange}
                locale={tr}
                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefon</Label>
          <Input
            id="phone"
            name="phone"
            value={profile.phone || ''}
            onChange={handleChange}
            placeholder="05xx xxx xx xx"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="gender">Cinsiyet</Label>
        <div className="grid grid-cols-2 gap-4">
          <Button 
            type="button"
            variant={profile.gender === 'erkek' ? 'default' : 'outline'} 
            className="w-full"
            onClick={() => handleSelectChange('gender', 'erkek')}
            disabled={isLoading}
          >
            Erkek
          </Button>
          <Button 
            type="button"
            variant={profile.gender === 'kadın' ? 'default' : 'outline'} 
            className="w-full"
            onClick={() => handleSelectChange('gender', 'kadın')}
            disabled={isLoading}
          >
            Kadın
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Adres</Label>
        <Textarea
          id="address"
          name="address"
          value={profile.address || ''}
          onChange={handleChange}
          disabled={isLoading}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="iban">IBAN</Label>
        <Input
          id="iban"
          name="iban"
          value={profile.iban || ''}
          onChange={handleChange}
          placeholder="TR00 0000 0000 0000 0000 0000 00"
          disabled={isLoading}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Kaydediliyor
            </>
          ) : (
            'Bilgileri Kaydet'
          )}
        </Button>
      </div>
    </form>
  );
}
