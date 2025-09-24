import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/header";
import { ArrowLeft, Plus, MapPin, Trash2, Star, Edit3, Building2 } from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Address, InsertAddress } from "@shared/schema";

// Use Address type directly - it already includes corporate fields

export default function AddressesPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  // Fetch addresses
  const { data: addresses = [], isLoading } = useQuery<Address[]>({
    queryKey: [`/api/addresses/${user?.id}`],
    enabled: !!user?.id,
  });

  const addAddressMutation = useMutation({
    mutationFn: async (data: Omit<InsertAddress, 'userId'>) => {
      // Don't send userId in request body - server will get it from session
      const addressData = { ...data };
      delete (addressData as any).userId;
      return await apiRequest("/api/addresses", "POST", addressData);
    },
    onSuccess: () => {
      toast({
        title: "Başarılı!",
        description: "Adres başarıyla eklendi",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/addresses/${user?.id}`] });
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      console.error("Address creation error:", error);
      toast({
        title: "Hata",
        description: error.message || "Adres eklenemedi",
        variant: "destructive",
      });
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (addressId: string) => {
      return await apiRequest(`/api/addresses/${addressId}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Başarılı!",
        description: "Adres silindi",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/addresses/${user?.id}`] });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Adres silinemedi",
        variant: "destructive",
      });
    },
  });

  const setDefaultAddressMutation = useMutation({
    mutationFn: async (addressId: string) => {
      return await apiRequest(`/api/addresses/${addressId}/set-default`, "PUT");
    },
    onSuccess: () => {
      toast({
        title: "Başarılı!",
        description: "Varsayılan adres güncellendi",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/addresses/${user?.id}`] });
    },
    onError: (error) => {
      toast({
        title: "Hata", 
        description: "Varsayılan adres ayarlanamadı",
        variant: "destructive",
      });
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Omit<InsertAddress, 'userId'> }) => {
      // Don't send userId in request body - server will get it from session
      const addressData = { ...data };
      delete (addressData as any).userId;
      return await apiRequest(`/api/addresses/${id}`, "PATCH", addressData);
    },
    onSuccess: () => {
      toast({
        title: "Başarılı!",
        description: "Adres başarıyla güncellendi",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/addresses/${user?.id}`] });
      setEditingAddress(null);
    },
    onError: (error) => {
      console.error("Address update error:", error);
      toast({
        title: "Hata",
        description: error.message || "Adres güncellenemedi",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setLocation("/account")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Hesabıma Dön
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Adreslerim</h1>
                <p className="text-gray-600">Teslimat adreslerinizi yönetin</p>
              </div>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Adres Ekle
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Yeni Adres Ekle</DialogTitle>
                  <DialogDescription>
                    Yeni teslimat adresi bilgilerini girin
                  </DialogDescription>
                </DialogHeader>
                <AddressForm 
                  onSubmit={(data) => addAddressMutation.mutate(data)}
                  onCancel={() => setIsAddDialogOpen(false)}
                  isLoading={addAddressMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Addresses List */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-gray-600">Adresler yükleniyor...</p>
            </div>
          ) : addresses.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Henüz adres eklememişsiniz
                </h3>
                <p className="text-gray-600 mb-6">
                  Teslimat için adres ekleyerek başlayın
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  İlk Adresimi Ekle
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {addresses.map((address: Address) => (
                <Card key={address.id} className={address.isDefault ? "ring-2 ring-primary" : ""}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3 flex-1">
                        {address.addressType === "kurumsal" ? (
                          <Building2 className="w-5 h-5 text-blue-600 mt-1" />
                        ) : (
                          <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{address.title}</h3>
                            {address.addressType === "kurumsal" && (
                              <Badge className="bg-orange-100 text-orange-800">
                                Kurumsal
                              </Badge>
                            )}
                            {address.isDefault && (
                              <Badge className="bg-primary text-white">
                                <Star className="h-3 w-3 mr-1" />
                                Varsayılan
                              </Badge>
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            <p className="font-medium">{address.fullName}</p>
                            <p>{address.phone}</p>
                            {address.addressType === "kurumsal" && address.taxNumber && (
                              <p className="text-xs text-gray-500">
                                VN: {address.taxNumber} - {address.taxOffice}
                              </p>
                            )}
                            <p>{address.address}</p>
                            <p>{address.district}, {address.city}</p>
                            {address.postalCode && <p>Posta Kodu: {address.postalCode}</p>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        {!address.isDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDefaultAddressMutation.mutate(address.id)}
                            disabled={setDefaultAddressMutation.isPending}
                          >
                            <Star className="h-3 w-3 mr-1" />
                            Varsayılan Yap
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingAddress(address)}
                        >
                          <Edit3 className="h-3 w-3 mr-1" />
                          Düzenle
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteAddressMutation.mutate(address.id)}
                          disabled={deleteAddressMutation.isPending}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Sil
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Address Dialog */}
      {editingAddress && (
        <Dialog open={!!editingAddress} onOpenChange={() => setEditingAddress(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adresi Düzenle</DialogTitle>
              <DialogDescription>
                Adres bilgilerini güncelleyin
              </DialogDescription>
            </DialogHeader>
            <AddressForm 
              initialData={editingAddress}
              onSubmit={(data) => {
                updateAddressMutation.mutate({ 
                  id: editingAddress.id, 
                  data 
                });
              }}
              onCancel={() => setEditingAddress(null)}
              isLoading={updateAddressMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

interface AddressFormProps {
  initialData?: Address;
  onSubmit: (data: Omit<InsertAddress, 'userId'>) => void;
  onCancel: () => void;
  isLoading: boolean;
}

function AddressForm({ initialData, onSubmit, onCancel, isLoading }: AddressFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    addressType: (initialData as any)?.addressType || "bireysel",
    fullName: initialData?.fullName || "",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
    district: initialData?.district || "",
    city: initialData?.city || "",
    postalCode: initialData?.postalCode || "",
    // Kurumsal adres alanları
    companyName: (initialData as any)?.companyName || "",
    taxNumber: (initialData as any)?.taxNumber || "",
    taxOffice: (initialData as any)?.taxOffice || "",
    isDefault: initialData?.isDefault || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasyon: temel alanlar
    if (!formData.title || !formData.phone || !formData.address || !formData.district || !formData.city) {
      return;
    }
    
    // Kurumsal adres için özel validasyon
    if (formData.addressType === "kurumsal") {
      if (!formData.companyName || !formData.taxNumber || !formData.taxOffice) {
        return;
      }
    } else {
      // Bireysel adres için fullName gerekli
      if (!formData.fullName) {
        return;
      }
    }

    // Kurumsal adres için fullName'i companyName'den al
    const submitData = {
      ...formData,
      fullName: formData.addressType === "kurumsal" ? formData.companyName : formData.fullName
    };

    // Don't include userId in form data - server gets it from session
    onSubmit(submitData as any);
  };

  const addressTitles = [
    { value: "Ev", label: "Ev" },
    { value: "İş", label: "İş" },
    { value: "Kurumsal", label: "Kurumsal" },
    { value: "Diğer", label: "Diğer" },
  ];

  const turkishCities = [
    "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin",
    "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur",
    "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ",
    "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkâri", "Hatay", "Iğdır", "Isparta",
    "İstanbul", "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kırıkkale", "Kırklareli",
    "Kırşehir", "Kilis", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Mardin", "Mersin", "Muğla",
    "Muş", "Nevşehir", "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop",
    "Sivas", "Şanlıurfa", "Şırnak", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova",
    "Yozgat", "Zonguldak"
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Adres Başlığı</Label>
          <Select value={formData.title} onValueChange={(value) => setFormData({ ...formData, title: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Adres başlığı seçin" />
            </SelectTrigger>
            <SelectContent>
              {addressTitles.map((title) => (
                <SelectItem key={title.value} value={title.value}>
                  {title.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Adres Tipi</Label>
          <RadioGroup value={formData.addressType} onValueChange={(value) => setFormData({ ...formData, addressType: value })} className="flex gap-6">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="bireysel" id="bireysel" />
              <Label htmlFor="bireysel">Bireysel</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="kurumsal" id="kurumsal" />
              <Label htmlFor="kurumsal">Kurumsal</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Kurumsal adres alanları */}
      {formData.addressType === "kurumsal" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label>Ünvan / Şirket Adı *</Label>
            <Input
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="Şirket Ünvanı"
              required
            />
          </div>
          <div>
            <Label>Vergi Numarası *</Label>
            <Input
              value={formData.taxNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ''); // Sadece rakam
                if (value.length <= 11) {
                  setFormData({ ...formData, taxNumber: value });
                }
              }}
              placeholder="12345678901"
              maxLength={11}
              required
            />
          </div>
          <div>
            <Label>Vergi Dairesi *</Label>
            <Input
              value={formData.taxOffice}
              onChange={(e) => setFormData({ ...formData, taxOffice: e.target.value })}
              placeholder="Kadıköy"
              required
            />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Label>Ad Soyad</Label>
          <Input
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="Alıcı ad soyad"
            required={formData.addressType === "bireysel"}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label>Telefon</Label>
        <Input
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="05XX XXX XX XX"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Adres</Label>
        <Textarea
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Açık adres (Mahalle, sokak, bina no, daire no)"
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>İlçe</Label>
          <Input
            value={formData.district}
            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
            placeholder="İlçe"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label>İl</Label>
          <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })}>
            <SelectTrigger>
              <SelectValue placeholder="İl seçin" />
            </SelectTrigger>
            <SelectContent>
              {turkishCities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Posta Kodu (Opsiyonel)</Label>
        <Input
          value={formData.postalCode}
          onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
          placeholder="34000"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          İptal
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </div>
    </form>
  );
}