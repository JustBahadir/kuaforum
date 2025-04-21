import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CustomerAppointmentsTable } from "./CustomerAppointmentsTable";
import { CustomerOperationsTable } from "./CustomerOperationsTable";
import { CustomerLoyaltyCard } from "./CustomerLoyaltyCard";
import { CustomerProfile } from "./CustomerProfile";
import { useQuery } from "@tanstack/react-query";
import { musteriServisi, islemServisi } from "@/lib/supabase";
import { useParams, useNavigate } from "react-router-dom";
import { CustomerPersonalData } from "./CustomerPersonalData";
import { CustomerPhotoGallery } from "./CustomerPhotoGallery";
import { customerPersonalDataService } from "@/lib/supabase/services/customerPersonalDataService";
import { PhoneInputField } from "./FormFields/PhoneInputField";
import { Input } from "@/components/ui/input";

interface CustomerDetailsProps {
  customerId?: number;
}

export function CustomerDetails(props: any) {
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [isEditing, setIsEditing] = useState(false);

  const params = useParams<{ id: string }>();
  const navigate = useNavigate();

  const customerId = props.customerId !== undefined ? props.customerId : params.id ? parseInt(params.id) : undefined;

  const { 
    data: customer, 
    isLoading: isLoadingCustomer,
    error: customerError
  } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: async () => {
      if (!customerId) throw new Error("No customer ID provided");
      return musteriServisi.getirById(customerId);
    },
    enabled: !!customerId,
  });

  const {
    data: personalData,
    isLoading: isLoadingPersonalData
  } = useQuery({
    queryKey: ['customer-personal-data', customerId],
    queryFn: async () => {
      if (!customerId) throw new Error("No customer ID provided");
      return customerPersonalDataService.getCustomerPersonalData(customerId);
    },
    enabled: !!customerId
  });

  const customerWithPersonalData = customer ? {
    ...customer,
    ...(personalData || {})
  } : undefined;

  const { data: services = [] } = useQuery({
    queryKey: ['islemler'],
    queryFn: islemServisi.hepsiniGetir,
  });

  const isPointSystemEnabled = services.some((service: any) => service.puan > 0);

  const [formData, setFormData] = useState({
    firstName: customerWithPersonalData?.first_name || "",
    lastName: customerWithPersonalData?.last_name || "",
    phone: customerWithPersonalData?.phone || "",
    birthdate: customerWithPersonalData?.birthdate
      ? new Date(customerWithPersonalData.birthdate).toISOString().split('T')[0]
      : "",
    spouseName: customerWithPersonalData?.spouse_name || "",
    spouseBirthdate: customerWithPersonalData?.spouse_birthdate
      ? new Date(customerWithPersonalData.spouse_birthdate).toISOString().split('T')[0]
      : "",
    anniversaryDate: customerWithPersonalData?.anniversary_date
      ? new Date(customerWithPersonalData.anniversary_date).toISOString().split('T')[0]
      : "",
    childrenNames: customerWithPersonalData?.children_names || []
  });

  const [newChildName, setNewChildName] = useState("");

  useEffect(() => {
    setFormData({
      firstName: customerWithPersonalData?.first_name || "",
      lastName: customerWithPersonalData?.last_name || "",
      phone: customerWithPersonalData?.phone || "",
      birthdate: customerWithPersonalData?.birthdate
        ? new Date(customerWithPersonalData.birthdate).toISOString().split('T')[0]
        : "",
      spouseName: customerWithPersonalData?.spouse_name || "",
      spouseBirthdate: customerWithPersonalData?.spouse_birthdate
        ? new Date(customerWithPersonalData.spouse_birthdate).toISOString().split('T')[0]
        : "",
      anniversaryDate: customerWithPersonalData?.anniversary_date
        ? new Date(customerWithPersonalData.anniversary_date).toISOString().split('T')[0]
        : "",
      childrenNames: customerWithPersonalData?.children_names || []
    });
    setNewChildName("");
  }, [customerWithPersonalData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (value: string) => {
    setFormData(prev => ({ ...prev, phone: value }));
  };

  const handleAddChild = () => {
    if (newChildName.trim() === "") return;
    setFormData(prev => ({
      ...prev,
      childrenNames: [...prev.childrenNames, newChildName.trim()]
    }));
    setNewChildName("");
  };

  const handleRemoveChild = (index: number) => {
    setFormData(prev => ({
      ...prev,
      childrenNames: prev.childrenNames.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    try {
      setIsEditing(false);

      const phoneDigitsOnly = formData.phone.replace(/\D/g, '');

      const birthdateValue = formData.birthdate && /^\d{4}-\d{2}-\d{2}$/.test(formData.birthdate)
        ? formData.birthdate
        : null;

      const spouseBirthdateValue = formData.spouseBirthdate && /^\d{4}-\d{2}-\d{2}$/.test(formData.spouseBirthdate)
        ? formData.spouseBirthdate
        : null;

      const anniversaryDateValue = formData.anniversaryDate && /^\d{4}-\d{2}-\d{2}$/.test(formData.anniversaryDate)
        ? formData.anniversaryDate
        : null;

      await musteriServisi.guncelle(customer!.id, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: phoneDigitsOnly,
        birthdate: birthdateValue,
      });

      await customerPersonalDataService.updateCustomerPersonalData(customer!.id, {
        customer_id: customer!.id.toString(),
        spouse_name: formData.spouseName || null,
        spouse_birthdate: spouseBirthdateValue,
        anniversary_date: anniversaryDateValue,
        children_names: formData.childrenNames || []
      });
    } catch (error) {
      console.error("Müşteri güncelleme hatası:", error);
    }
  };

  const handleCreateAppointment = () => {
    if (customerId) {
      navigate(`/appointments?customerId=${customerId.toString()}&newAppointment=true`);
    }
  };

  if (isLoadingCustomer || isLoadingPersonalData) {
    return (
      <div className="flex justify-center p-6">
        <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (customerError || !customerWithPersonalData) {
    return (
      <div className="p-4 md:p-6 border border-gray-200 rounded-md bg-gray-50">
        <h3 className="text-lg font-medium text-gray-900">Müşteri Bulunamadı</h3>
        <p className="mt-1 text-sm text-gray-500">Bu müşteri bulunamadı veya bir hata oluştu.</p>
      </div>
    );
  }

  const customerName = `${String(formData.firstName || '')} ${String(formData.lastName || '')}`.trim();

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">{customerName || 'İsimsiz Müşteri'}</h2>
          <p className="text-sm text-gray-500">Müşteri #: {customerId}</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => {}}>
            Mesaj Gönder
          </Button>
          <Button size="sm" onClick={handleCreateAppointment}>Randevu Oluştur</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 md:grid-cols-5 mb-4">
          <TabsTrigger value="basic">Temel Bilgiler</TabsTrigger>
          <TabsTrigger value="detailed">Detaylı Bilgiler</TabsTrigger>
          <TabsTrigger value="operations">İşlem Geçmişi</TabsTrigger>
          <TabsTrigger value="photos">Fotoğraflar</TabsTrigger>
          {isPointSystemEnabled && <TabsTrigger value="loyalty">Sadakat & Puanlar</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Müşteri Bilgileri</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 items-center border-b py-2">
                    <div className="font-medium">İsim</div>
                    <div className="col-span-2 grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        name="firstName"
                        className="border rounded p-2 w-full"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Ad"
                        autoComplete="given-name"
                      />
                      <input
                        type="text"
                        name="lastName"
                        className="border rounded p-2 w-full"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Soyad"
                        autoComplete="family-name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center border-b py-2">
                    <div className="font-medium">Telefon</div>
                    <div className="col-span-2">
                      <PhoneInputField 
                        value={formData.phone} 
                        onChange={handlePhoneChange} 
                        placeholder="05xx xxx xx xx" 
                        id="phone"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center border-b py-2">
                    <div className="font-medium">Doğum Tarihi</div>
                    <div className="col-span-2">
                      <input
                        type="date"
                        name="birthdate"
                        className="border rounded p-2 w-full"
                        value={formData.birthdate}
                        onChange={handleInputChange}
                        autoComplete="bday"
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center border-b py-2">
                    <div className="font-medium">Kayıt Tarihi</div>
                    <div className="col-span-2">
                      {new Date(customerWithPersonalData.created_at).toLocaleDateString('tr-TR')}
                    </div>
                  </div>

                  <div className="pt-4">
                    <h4 className="font-medium text-md mb-2">Aile Bilgileri</h4>
                  </div>

                  <div className="grid grid-cols-3 items-center border-b py-2">
                    <div className="font-medium">Eş İsmi</div>
                    <div className="col-span-2">
                      <input
                        id="spouseName"
                        name="spouseName"
                        type="text"
                        className="border rounded p-2 w-full"
                        value={formData.spouseName}
                        onChange={handleInputChange}
                        placeholder="Eş adı"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center border-b py-2">
                    <div className="font-medium">Eş Doğum Tarihi</div>
                    <div className="col-span-2">
                      <input
                        id="spouseBirthdate"
                        name="spouseBirthdate"
                        type="date"
                        className="border rounded p-2 w-full"
                        value={formData.spouseBirthdate || ""}
                        onChange={handleInputChange}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center border-b py-2">
                    <div className="font-medium">Evlilik Yıldönümü</div>
                    <div className="col-span-2">
                      <input
                        id="anniversaryDate"
                        name="anniversaryDate"
                        type="date"
                        className="border rounded p-2 w-full"
                        value={formData.anniversaryDate || ""}
                        onChange={handleInputChange}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-start border-b py-2">
                    <div className="font-medium pt-2">Çocuklar</div>
                    <div className="col-span-2 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          id="addChildInput"
                          className="border rounded p-2 w-full"
                          placeholder="Çocuk adı"
                          value={newChildName}
                          onChange={(e) => setNewChildName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (newChildName.trim() !== "") {
                                handleAddChild();
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-primary px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                          onClick={() => {
                            if(newChildName.trim() !== "") {
                              handleAddChild();
                            }
                          }}
                        >
                          Ekle
                        </button>
                      </div>
                      <div className="space-y-1 max-h-40 overflow-auto border border-gray-200 rounded p-2">
                        {formData.childrenNames.length > 0 ? (
                          formData.childrenNames.map((name, index) => (
                            <div
                              key={index}
                              className="flex justify-between bg-gray-50 rounded px-2 py-1 items-center"
                            >
                              <span>{name}</span>
                              <button
                                type="button"
                                className="text-red-600 hover:text-red-800"
                                aria-label={`Remove child ${name}`}
                                onClick={() => handleRemoveChild(index)}
                              >
                                &times;
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-600">Henüz çocuk eklenmemiş</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>İptal</Button>
                    <Button size="sm" onClick={handleSave}>Kaydet</Button>
                  </div>
                </div>
              ) : (
                <CustomerProfile customer={customerWithPersonalData} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed">
          <Card>
            <CardHeader>
              <CardTitle>Detaylı Bilgiler</CardTitle>
            </CardHeader>
            <CardContent>
              {customerId && <CustomerPersonalData customerId={customerId} isEditing={isEditing} setIsEditing={setIsEditing} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations">
          {customerId && <CustomerOperationsTable customerId={customerId} />}
        </TabsContent>

        <TabsContent value="photos">
          <Card>
            <CardHeader>
              <CardTitle>Müşteri Fotoğrafları</CardTitle>
            </CardHeader>
            <CardContent>
              {customerId && <CustomerPhotoGallery customerId={customerId} />}
            </CardContent>
          </Card>
        </TabsContent>

        {isPointSystemEnabled && (
          <TabsContent value="loyalty">
            <Card>
              <CardHeader>
                <CardTitle>Sadakat Programı ve Puanlar</CardTitle>
              </CardHeader>
              <CardContent>
                {customerId && <CustomerLoyaltyCard customerId={customerId} expanded={true} />}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
