import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { CreditCard, ArrowLeft, MapPin, Plus, Building2, ShieldCheck, Banknote, Copy } from "lucide-react";
import BankLogo from "@/components/bank-logo";
import type { Address } from "@shared/schema";

export default function CheckoutPage() {
  const { cartItems, cartTotal, cartItemCount } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [paymentMethod, setPaymentMethod] = useState("virtual-pos");
  const [selectedVirtualPosConfig, setSelectedVirtualPosConfig] = useState<string>("");
  const [selectedInstallments, setSelectedInstallments] = useState<number>(1);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  
  // Kupon state'leri
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isCouponLoading, setIsCouponLoading] = useState(false);

  // Fetch user addresses
  const { data: addresses = [] } = useQuery<Address[]>({
    queryKey: [`/api/addresses/${user?.id}`],
    enabled: !!user?.id,
  });

  // Fetch virtual POS configurations
  const { data: virtualPosConfigs = [] } = useQuery<any[]>({
    queryKey: ['/api/virtual-pos/configs'],
  });

  // Fetch installment options for selected virtual POS
  const { data: installmentOptions = [] } = useQuery<any[]>({
    queryKey: ['/api/virtual-pos', selectedVirtualPosConfig, 'installments'],
    enabled: !!selectedVirtualPosConfig,
  });

  // Fetch general settings for bank account details
  const { data: generalSettings } = useQuery<any>({
    queryKey: ['/api/admin/settings'],
  });
  
  const [formData, setFormData] = useState({
    title: "Ev",
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    postalCode: ""
  });

  // Kurumsal adres state'leri
  const [billingInfoDifferent, setBillingInfoDifferent] = useState(false);
  const [addressType, setAddressType] = useState("bireysel"); // bireysel veya kurumsal
  const [corporateData, setCorporateData] = useState({
    companyName: "",
    taxNumber: "",
    taxOffice: "",
    address: "",
    city: "",
    district: "",
    postalCode: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCorporateDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Vergi numarası için özel işlem - sadece rakam, max 11 karakter
    if (name === "taxNumber") {
      const numericValue = value.replace(/\D/g, '').slice(0, 11);
      setCorporateData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setCorporateData(prev => ({ ...prev, [name]: value }));
    }
  };

  const clearCart = async () => {
    try {
      // Remove all items from cart
      for (const item of cartItems) {
        await fetch(`/api/cart/${item.id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  // Kupon işlevleri
  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setIsCouponLoading(true);
    try {
      const response = await fetch(`/api/coupons/validate/${couponCode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderAmount: cartTotal }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Kupon doğrulanamadı');
      }

      const coupon = await response.json();
      setAppliedCoupon(coupon);
      toast({
        title: "Kupon uygulandı!",
        description: `${coupon.name} kupon kodu başarıyla uygulandı.`,
        className: "bg-green-50 border-green-200 text-green-800",
      });
    } catch (error: any) {
      toast({
        title: "Kupon Hatası",
        description: error.message || "Kupon kodu geçersiz veya kullanım koşulları sağlanmıyor.",
        variant: "destructive",
      });
    } finally {
      setIsCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast({
      title: "Kupon kaldırıldı",
      description: "İndirim kuponunuz sepetinizden çıkarıldı.",
      className: "bg-blue-50 border-blue-200 text-blue-800",
    });
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    
    if (appliedCoupon.type === 'percentage') {
      const discountAmount = (cartTotal * parseFloat(appliedCoupon.value)) / 100;
      // maxDiscount 0 ise sınırsız indirim anlamına gelir
      const maxDiscountValue = parseFloat(appliedCoupon.maxDiscount);
      const maxDiscount = (maxDiscountValue > 0) ? maxDiscountValue : Infinity;
      return Math.min(discountAmount, maxDiscount);
    } else {
      return Math.min(parseFloat(appliedCoupon.value), cartTotal);
    }
  };

  const getFinalTotal = () => {
    return Math.max(0, cartTotal - calculateDiscount());
  };

  const saveNewAddress = async () => {
    // Validation for individual or corporate based on addressType when billing info is different
    if (billingInfoDifferent && addressType === "kurumsal") {
      // Kurumsal adres validasyonu
      if (!corporateData.companyName || !corporateData.taxNumber || !corporateData.taxOffice || 
          !corporateData.address || !corporateData.city || !corporateData.district) {
        toast({
          title: "Eksik Bilgi",
          description: "Lütfen tüm zorunlu kurumsal adres alanlarını doldurun.",
          variant: "destructive",
        });
        return;
      }
      
      // Vergi numarası format kontrolü (10-11 rakam)
      if (!/^\d{10,11}$/.test(corporateData.taxNumber)) {
        toast({
          title: "Geçersiz Vergi Numarası",
          description: "Vergi numarası 10 veya 11 rakamdan oluşmalıdır.",
          variant: "destructive",
        });
        return;
      }
    } else {
      // Bireysel adres validasyonu
      if (!formData.fullName || !formData.phone || !formData.address || !formData.city || !formData.district) {
        toast({
          title: "Eksik Bilgi",
          description: "Lütfen tüm zorunlu alanları doldurun.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsSavingAddress(true);
    try {
      // Adres verisini hazırla
      let addressData;
      
      if (billingInfoDifferent && addressType === "kurumsal") {
        // Kurumsal adres verisi
        addressData = {
          title: "Kurumsal",
          addressType: "kurumsal",
          fullName: corporateData.companyName, // Kurumsal için ünvan fullName'e
          phone: formData.phone || "", // Telefon bireysel formdan alınır
          address: corporateData.address,
          city: corporateData.city,
          district: corporateData.district,
          postalCode: corporateData.postalCode || '',
          companyName: corporateData.companyName,
          taxNumber: corporateData.taxNumber,
          taxOffice: corporateData.taxOffice,
          isDefault: addresses.length === 0 // İlk adres varsayılan olsun
        };
      } else {
        // Bireysel adres verisi
        addressData = {
          title: formData.title,
          addressType: "bireysel",
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          district: formData.district,
          postalCode: formData.postalCode || '',
          isDefault: addresses.length === 0 // İlk adres varsayılan olsun
        };
      }

      const response = await fetch('/api/addresses', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(addressData)
      });

      if (!response.ok) {
        throw new Error('Adres kaydedilemedi');
      }

      const newAddress = await response.json();
      
      // Adres listesini yenile
      queryClient.invalidateQueries({ queryKey: [`/api/addresses/${user?.id}`] });
      
      toast({
        title: "Başarılı!",
        description: "Adres başarıyla kaydedildi.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      
      // Yeni adresi seç
      setSelectedAddress(newAddress.id);
      setUseNewAddress(false);
      
      // Formu temizle
      setFormData({
        title: "Ev",
        fullName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        district: "",
        postalCode: ""
      });
      
      // Kurumsal veriyi de temizle
      setCorporateData({
        companyName: "",
        taxNumber: "",
        taxOffice: "",
        address: "",
        city: "",
        district: "",
        postalCode: ""
      });
      
      // Adres tipini sıfırla
      setAddressType("bireysel");
      setBillingInfoDifferent(false);
    } catch (error) {
      console.error('Save address error:', error);
      toast({
        title: "Hata",
        description: "Adres kaydedilirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsSavingAddress(false);
    }
  };

  const createOrder = async () => {
    try {
      const selectedAddr = addresses.find((addr: any) => addr.id === selectedAddress);
      const shippingAddress = selectedAddr 
        ? `${selectedAddr.fullName} - ${selectedAddr.phone}\n${selectedAddr.address}\n${selectedAddr.district}/${selectedAddr.city} ${selectedAddr.postalCode}`
        : `${formData.fullName} - ${formData.phone}\n${formData.address}\n${formData.district}/${formData.city} ${formData.postalCode}`;

      const orderData = {
        totalAmount: getFinalTotal(),
        originalAmount: cartTotal,
        discountAmount: calculateDiscount(),
        couponCode: appliedCoupon?.code || null,
        shippingAddress,
        paymentMethod: paymentMethod,
        virtualPosConfigId: selectedVirtualPosConfig,
        installments: selectedInstallments,
        cartItems
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Sipariş oluşturulamadı');
      }

      return await response.json();
    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  };

  const handleVirtualPosPayment = async (order: any) => {
    try {
      const response = await fetch('/api/payment/virtual-pos/initiate', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: order.id,
          virtualPosConfigId: selectedVirtualPosConfig,
          amount: getFinalTotal(),
          installments: selectedInstallments
        })
      });

      if (!response.ok) {
        throw new Error('Ödeme başlatılamadı');
      }

      const paymentData = await response.json();
      
      // Redirect to virtual POS payment form
      window.location.href = paymentData.redirectUrl;
    } catch (error) {
      console.error('Virtual POS payment error:', error);
      throw error;
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Validation
      if (paymentMethod === "virtual-pos" && !selectedVirtualPosConfig) {
        toast({
          title: "Ödeme Hatası",
          description: "Lütfen bir banka seçin.",
          variant: "destructive",
        });
        return;
      }

      if (!selectedAddress && useNewAddress === false) {
        toast({
          title: "Adres Hatası",
          description: "Lütfen bir teslimat adresi seçin veya yeni adres girin.",
          variant: "destructive",
        });
        return;
      }

      // Create order first
      const order = await createOrder();
      
      if (paymentMethod === "virtual-pos") {
        // Start virtual POS payment process
        await handleVirtualPosPayment(order);
      } else if (paymentMethod === "bank-transfer") {
        // Bank transfer payment - order created with pending status
        await clearCart();
        
        toast({
          title: "Sipariş başarıyla oluşturuldu! 🎉",
          description: `Sipariş numarası: ${order.orderNumber}. Havale/EFT yapıldıktan sonra siparişiniz hazırlanacak.`,
          className: "bg-green-50 border-green-200 text-green-800",
        });

        setTimeout(() => {
          window.location.href = `/order-confirmation?orderId=${order.id}`;
        }, 2000);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Ödeme hatası",
        description: "Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Sepetiniz boş</h1>
            <p className="text-gray-600 mb-8">Ödeme yapabilmek için sepetinizde ürün bulunması gerekiyor.</p>
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90">
                Alışverişe başla
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back to Cart */}
        <Link href="/cart">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Sepete Dön
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sipariş Özeti</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => {
                  const basePrice = item.product?.price ? parseFloat(item.product.price) * item.quantity : 0;
                  let warrantyPrice = 0;
                  let warrantyText = '';
                  
                  if (item.warranty && item.warranty !== 'none') {
                    // Use category-based warranty pricing from cart hook
                    const warrantyOptions = {
                      '2year': { price: 0, text: '2 Yıl Ek Garanti' }, // Price calculated in cart hook
                      '4year': { price: 0, text: '4 Yıl Ek Garanti' }  // Price calculated in cart hook
                    };
                    const warranty = warrantyOptions[item.warranty as keyof typeof warrantyOptions];
                    if (warranty) {
                      warrantyPrice = 0; // Actual price is calculated in useCart hook
                      warrantyText = warranty.text;
                    }
                  }
                  
                  return (
                    <div key={item.id} className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.product?.image || item.product?.images?.[0]}
                          alt={item.product?.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                            {item.product?.name}
                          </h4>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-sm text-gray-500">
                              Adet: {item.quantity} x {item.product?.price ? parseFloat(item.product.price).toLocaleString('tr-TR') : 0} ₺
                            </span>
                            <span className="text-sm font-semibold text-primary">
                              {basePrice.toLocaleString('tr-TR')} ₺
                            </span>
                          </div>
                        </div>
                      </div>
                      {warrantyPrice > 0 && (
                        <div className="ml-15 flex justify-between items-center text-sm">
                          <span className="text-blue-600">{warrantyText}</span>
                          <span className="text-blue-600 font-medium">
                            +{warrantyPrice.toLocaleString('tr-TR')} ₺
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
                
                <Separator />
                
                {/* Kupon Girişi */}
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="İndirim kodu girin"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      onClick={applyCoupon}
                      disabled={isCouponLoading || !couponCode.trim()}
                    >
                      {isCouponLoading ? "Kontrol ediliyor..." : "Uygula"}
                    </Button>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-green-800">
                            {appliedCoupon.name} - {appliedCoupon.code}
                          </p>
                          <p className="text-xs text-green-600">
                            {appliedCoupon.type === 'percentage' 
                              ? `%${appliedCoupon.value} indirim` 
                              : `${parseFloat(appliedCoupon.value).toLocaleString('tr-TR')} ₺ indirim`}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={removeCoupon}
                          className="text-green-700 hover:text-green-800"
                        >
                          Kaldır
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Ara Toplam ({cartItemCount} ürün)</span>
                    <span>{cartTotal.toLocaleString('tr-TR')} ₺</span>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>İndirim ({appliedCoupon.code})</span>
                      <span>-{calculateDiscount().toLocaleString('tr-TR')} ₺</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span>Kargo</span>
                    <span className="text-green-600">Ücretsiz</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Toplam</span>
                    <span className="text-primary">{getFinalTotal().toLocaleString('tr-TR')} ₺</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="space-y-6">
              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Teslimat Adresi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">

                    {addresses.length > 0 && !useNewAddress && (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          {addresses.map((address: any) => (
                            <div key={address.id} className="border rounded-lg p-3">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                  <input
                                    type="radio"
                                    name="selectedAddress"
                                    value={address.id}
                                    checked={selectedAddress === address.id}
                                    onChange={(e) => setSelectedAddress(e.target.value)}
                                    className="mt-1"
                                  />
                                  <div className="flex items-center space-x-2">
                                    {address.addressType === "kurumsal" ? (
                                      <Building2 className="w-4 h-4 text-blue-600" />
                                    ) : (
                                      <MapPin className="w-4 h-4 text-gray-500" />
                                    )}
                                    <div>
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="text-sm font-medium text-gray-900">
                                          {address.title}
                                        </span>
                                        {address.addressType === "kurumsal" && (
                                          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                            Kurumsal
                                          </span>
                                        )}
                                        {address.isDefault && (
                                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                            Varsayılan
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-sm text-gray-600 mb-1">
                                        {address.fullName} - {address.phone}
                                      </p>
                                      {address.addressType === "kurumsal" && address.taxNumber && (
                                        <p className="text-xs text-gray-500 mb-1">
                                          VN: {address.taxNumber} - {address.taxOffice}
                                        </p>
                                      )}
                                      <p className="text-sm text-gray-500">
                                        {address.address}, {address.district}/{address.city} {address.postalCode}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setUseNewAddress(true);
                            setSelectedAddress("");
                          }}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Yeni Adres Ekle
                        </Button>
                      </div>
                    )}
                    
                    {(addresses.length === 0 || useNewAddress) && (
                      <div className="space-y-4">
                        {useNewAddress && addresses.length > 0 && (
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-medium text-gray-900">Yeni Adres Ekle</h3>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setUseNewAddress(false);
                                setFormData({
                                  title: "Ev",
                                  fullName: "",
                                  email: "",
                                  phone: "",
                                  address: "",
                                  city: "",
                                  district: "",
                                  postalCode: ""
                                });
                              }}
                            >
                              <ArrowLeft className="w-4 h-4 mr-1" />
                              Kayıtlı Adresler
                            </Button>
                          </div>
                        )}
                        
                        <div className="mb-4">
                          <Label htmlFor="title">Adres Başlığı</Label>
                          <Select value={formData.title} onValueChange={(value) => setFormData(prev => ({ ...prev, title: value }))}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Adres başlığı seçin" />
                            </SelectTrigger>
                            <SelectContent className="z-[9999]">
                              <SelectItem value="Ev">Ev</SelectItem>
                              <SelectItem value="İş">İş</SelectItem>
                              <SelectItem value="Diğer">Diğer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="fullName">Ad Soyad</Label>
                            <Input
                              id="fullName"
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleInputChange}
                              placeholder="Adınız ve soyadınız"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Telefon</Label>
                            <Input
                              id="phone"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="0555 123 45 67"
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="email">E-posta</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="ornek@email.com"
                            required
                          />
                        </div>
                        
                        {/* Fatura bilgilerini farklı girme seçeneği */}
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="different-billing-new-address"
                              checked={billingInfoDifferent}
                              onCheckedChange={(checked) => setBillingInfoDifferent(checked === true)}
                            />
                            <Label htmlFor="different-billing-new-address" className="text-sm font-medium">
                              Fatura bilgilerimi farklı girmek istiyorum.
                            </Label>
                          </div>

                          {/* Bireysel/Kurumsal seçimi */}
                          {billingInfoDifferent && (
                            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                              <RadioGroup value={addressType} onValueChange={setAddressType} className="flex gap-6">
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="bireysel" id="bireysel-new" />
                                  <Label htmlFor="bireysel-new">Bireysel</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="kurumsal" id="kurumsal-new" />
                                  <Label htmlFor="kurumsal-new">Kurumsal</Label>
                                </div>
                              </RadioGroup>

                              {/* Kurumsal alanları */}
                              {addressType === "kurumsal" && (
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="companyName-new">Ünvan / Ad Soyad *</Label>
                                    <Input
                                      id="companyName-new"
                                      name="companyName"
                                      value={corporateData.companyName}
                                      onChange={handleCorporateDataChange}
                                      placeholder="Şirket Ünvanı veya Ad Soyad"
                                      required
                                    />
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor="taxNumber-new">Vergi Numarası *</Label>
                                      <Input
                                        id="taxNumber-new"
                                        name="taxNumber"
                                        value={corporateData.taxNumber}
                                        onChange={handleCorporateDataChange}
                                        placeholder="12345678901"
                                        inputMode="numeric"
                                        pattern="\d*"
                                        maxLength={11}
                                        required
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="taxOffice-new">Vergi Dairesi *</Label>
                                      <Input
                                        id="taxOffice-new"
                                        name="taxOffice"
                                        value={corporateData.taxOffice}
                                        onChange={handleCorporateDataChange}
                                        placeholder="Kadıköy"
                                        required
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="address">Adres</Label>
                          <Input
                            id="address"
                            name="address"
                            value={billingInfoDifferent && addressType === "kurumsal" ? corporateData.address : formData.address}
                            onChange={billingInfoDifferent && addressType === "kurumsal" ? handleCorporateDataChange : handleInputChange}
                            placeholder="Tam adresinizi yazın"
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="city">İl</Label>
                            <Select 
                              value={billingInfoDifferent && addressType === "kurumsal" ? corporateData.city : formData.city} 
                              onValueChange={(value) => {
                                if (billingInfoDifferent && addressType === "kurumsal") {
                                  setCorporateData(prev => ({ ...prev, city: value }));
                                } else {
                                  setFormData(prev => ({ ...prev, city: value }));
                                }
                              }}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="İl seçin" />
                              </SelectTrigger>
                              <SelectContent className="z-[9999]">
                                <SelectItem value="Adana">Adana</SelectItem>
                                <SelectItem value="Adıyaman">Adıyaman</SelectItem>
                                <SelectItem value="Afyonkarahisar">Afyonkarahisar</SelectItem>
                                <SelectItem value="Ağrı">Ağrı</SelectItem>
                                <SelectItem value="Aksaray">Aksaray</SelectItem>
                                <SelectItem value="Amasya">Amasya</SelectItem>
                                <SelectItem value="Ankara">Ankara</SelectItem>
                                <SelectItem value="Antalya">Antalya</SelectItem>
                                <SelectItem value="Ardahan">Ardahan</SelectItem>
                                <SelectItem value="Artvin">Artvin</SelectItem>
                                <SelectItem value="Aydın">Aydın</SelectItem>
                                <SelectItem value="Balıkesir">Balıkesir</SelectItem>
                                <SelectItem value="Bartın">Bartın</SelectItem>
                                <SelectItem value="Batman">Batman</SelectItem>
                                <SelectItem value="Bayburt">Bayburt</SelectItem>
                                <SelectItem value="Bilecik">Bilecik</SelectItem>
                                <SelectItem value="Bingöl">Bingöl</SelectItem>
                                <SelectItem value="Bitlis">Bitlis</SelectItem>
                                <SelectItem value="Bolu">Bolu</SelectItem>
                                <SelectItem value="Burdur">Burdur</SelectItem>
                                <SelectItem value="Bursa">Bursa</SelectItem>
                                <SelectItem value="Çanakkale">Çanakkale</SelectItem>
                                <SelectItem value="Çankırı">Çankırı</SelectItem>
                                <SelectItem value="Çorum">Çorum</SelectItem>
                                <SelectItem value="Denizli">Denizli</SelectItem>
                                <SelectItem value="Diyarbakır">Diyarbakır</SelectItem>
                                <SelectItem value="Düzce">Düzce</SelectItem>
                                <SelectItem value="Edirne">Edirne</SelectItem>
                                <SelectItem value="Elazığ">Elazığ</SelectItem>
                                <SelectItem value="Erzincan">Erzincan</SelectItem>
                                <SelectItem value="Erzurum">Erzurum</SelectItem>
                                <SelectItem value="Eskişehir">Eskişehir</SelectItem>
                                <SelectItem value="Gaziantep">Gaziantep</SelectItem>
                                <SelectItem value="Giresun">Giresun</SelectItem>
                                <SelectItem value="Gümüşhane">Gümüşhane</SelectItem>
                                <SelectItem value="Hakkâri">Hakkâri</SelectItem>
                                <SelectItem value="Hatay">Hatay</SelectItem>
                                <SelectItem value="Iğdır">Iğdır</SelectItem>
                                <SelectItem value="Isparta">Isparta</SelectItem>
                                <SelectItem value="İstanbul">İstanbul</SelectItem>
                                <SelectItem value="İzmir">İzmir</SelectItem>
                                <SelectItem value="Kahramanmaraş">Kahramanmaraş</SelectItem>
                                <SelectItem value="Karabük">Karabük</SelectItem>
                                <SelectItem value="Karaman">Karaman</SelectItem>
                                <SelectItem value="Kars">Kars</SelectItem>
                                <SelectItem value="Kastamonu">Kastamonu</SelectItem>
                                <SelectItem value="Kayseri">Kayseri</SelectItem>
                                <SelectItem value="Kırıkkale">Kırıkkale</SelectItem>
                                <SelectItem value="Kırklareli">Kırklareli</SelectItem>
                                <SelectItem value="Kırşehir">Kırşehir</SelectItem>
                                <SelectItem value="Kilis">Kilis</SelectItem>
                                <SelectItem value="Kocaeli">Kocaeli</SelectItem>
                                <SelectItem value="Konya">Konya</SelectItem>
                                <SelectItem value="Kütahya">Kütahya</SelectItem>
                                <SelectItem value="Malatya">Malatya</SelectItem>
                                <SelectItem value="Manisa">Manisa</SelectItem>
                                <SelectItem value="Mardin">Mardin</SelectItem>
                                <SelectItem value="Mersin">Mersin</SelectItem>
                                <SelectItem value="Muğla">Muğla</SelectItem>
                                <SelectItem value="Muş">Muş</SelectItem>
                                <SelectItem value="Nevşehir">Nevşehir</SelectItem>
                                <SelectItem value="Niğde">Niğde</SelectItem>
                                <SelectItem value="Ordu">Ordu</SelectItem>
                                <SelectItem value="Osmaniye">Osmaniye</SelectItem>
                                <SelectItem value="Rize">Rize</SelectItem>
                                <SelectItem value="Sakarya">Sakarya</SelectItem>
                                <SelectItem value="Samsun">Samsun</SelectItem>
                                <SelectItem value="Siirt">Siirt</SelectItem>
                                <SelectItem value="Sinop">Sinop</SelectItem>
                                <SelectItem value="Sivas">Sivas</SelectItem>
                                <SelectItem value="Şanlıurfa">Şanlıurfa</SelectItem>
                                <SelectItem value="Şırnak">Şırnak</SelectItem>
                                <SelectItem value="Tekirdağ">Tekirdağ</SelectItem>
                                <SelectItem value="Tokat">Tokat</SelectItem>
                                <SelectItem value="Trabzon">Trabzon</SelectItem>
                                <SelectItem value="Tunceli">Tunceli</SelectItem>
                                <SelectItem value="Uşak">Uşak</SelectItem>
                                <SelectItem value="Van">Van</SelectItem>
                                <SelectItem value="Yalova">Yalova</SelectItem>
                                <SelectItem value="Yozgat">Yozgat</SelectItem>
                                <SelectItem value="Zonguldak">Zonguldak</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="district">İlçe</Label>
                            <Input
                              id="district"
                              name="district"
                              value={billingInfoDifferent && addressType === "kurumsal" ? corporateData.district : formData.district}
                              onChange={billingInfoDifferent && addressType === "kurumsal" ? handleCorporateDataChange : handleInputChange}
                              placeholder="Kadıköy"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="postalCode">Posta Kodu</Label>
                            <Input
                              id="postalCode"
                              name="postalCode"
                              value={formData.postalCode}
                              onChange={handleInputChange}
                              placeholder="34000"
                              required
                            />
                          </div>
                        </div>
                        
                        {/* Kaydet Butonu */}
                        <div className="flex gap-2 pt-4">
                          <Button
                            type="button"
                            onClick={saveNewAddress}
                            disabled={isSavingAddress}
                            className="flex-1"
                          >
                            {isSavingAddress ? "Kaydediliyor..." : "Adresi Kaydet"}
                          </Button>
                          {addresses.length > 0 && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setUseNewAddress(false);
                                setFormData({
                                  title: "Ev",
                                  fullName: "",
                                  email: "",
                                  phone: "",
                                  address: "",
                                  city: "",
                                  district: "",
                                  postalCode: ""
                                });
                              }}
                            >
                              İptal
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ödeme Yöntemi</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="virtual-pos" id="virtual-pos" />
                      <Label htmlFor="virtual-pos" className="flex items-center space-x-2 font-medium">
                        <ShieldCheck className="w-5 h-5 text-green-600" />
                        <span>Güvenli Sanal POS ile Ödeme</span>
                      </Label>
                    </div>
                    {generalSettings?.bankTransferEnabled && (
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="bank-transfer" id="bank-transfer" />
                        <Label htmlFor="bank-transfer" className="flex items-center space-x-2 font-medium">
                          <Banknote className="w-5 h-5 text-blue-600" />
                          <span>Havale/EFT ile Ödeme</span>
                        </Label>
                      </div>
                    )}
                  </RadioGroup>

                  {paymentMethod === "virtual-pos" && (
                    <div className="mt-6 space-y-4">
                      {/* Bank Selection */}
                      <div>
                        <Label htmlFor="virtualPosConfig">Banka Seçimi</Label>
                        <Select value={selectedVirtualPosConfig} onValueChange={setSelectedVirtualPosConfig}>
                          <SelectTrigger>
                            <SelectValue placeholder="Ödeme yapacağınız bankayı seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            {virtualPosConfigs.map((config: any) => (
                              <SelectItem key={config.id} value={config.id}>
                                <BankLogo bankName={config.bankName} className="w-16 h-16" />
                                <span className="text-sm text-gray-500 ml-2">
                                  ({config.posType === '3d' ? '3D Secure' : config.posType})
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Installment Selection */}
                      {selectedVirtualPosConfig && installmentOptions.length > 0 && (
                        <div>
                          <Label htmlFor="installments">Taksit Seçimi</Label>
                          <Select value={selectedInstallments.toString()} onValueChange={(value) => setSelectedInstallments(parseInt(value))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Taksit sayısını seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">
                                <div className="flex justify-between w-full">
                                  <span>Peşin</span>
                                  <span className="text-green-600 font-medium">{getFinalTotal().toLocaleString('tr-TR')} ₺</span>
                                </div>
                              </SelectItem>
                              {installmentOptions.map((option: any) => {
                                const installmentAmount = getFinalTotal() / option.installmentCount;
                                const commissionRate = parseFloat(option.commissionRate) || 0;
                                const totalWithCommission = getFinalTotal() * (1 + commissionRate / 100);
                                const monthlyAmount = totalWithCommission / option.installmentCount;
                                
                                return (
                                  <SelectItem key={option.installmentCount} value={option.installmentCount.toString()}>
                                    <div className="flex justify-between w-full">
                                      <span>{option.installmentCount} Taksit</span>
                                      <span className="text-blue-600 font-medium">
                                        {monthlyAmount.toLocaleString('tr-TR')} ₺ x {option.installmentCount}
                                      </span>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Security Info */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div className="text-sm text-blue-800">
                            <p className="font-medium">Güvenli Ödeme</p>
                            <p>Ödemeniz 256-bit SSL şifreleme ile korunmaktadır. Kart bilgileriniz sistemimizde saklanmaz.</p>
                          </div>
                        </div>
                      </div>

                      {selectedVirtualPosConfig && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <CreditCard className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div className="text-sm text-yellow-800">
                              <p className="font-medium">Ödeme Bilgilendirmesi</p>
                              <p>Seçtiğiniz bankadan güvenli ödeme sayfasına yönlendirileceksiniz. Ödeme işlemini tamamladıktan sonra sitemize geri döndürüleceksiniz.</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {paymentMethod === "bank-transfer" && (
                    <div className="mt-6 space-y-4">
                      {/* Bank Transfer Info */}
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <Banknote className="w-5 h-5 text-orange-600 mt-0.5" />
                          <div className="text-sm text-orange-800">
                            <p className="font-medium mb-2">Havale/EFT ile Ödeme</p>
                            <p className="mb-2">
                              Siparişinizi oluşturduktan sonra size özel sipariş numaranız ve banka hesap bilgileri gösterilecektir.
                            </p>
                            <p className="font-semibold text-orange-900">
                              ⚠️ "Sipariş Oluştur" butonuna bastığınızda gerçek bir sipariş oluşturulacaktır.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Button */}
              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 text-lg"
              >
                {isProcessing 
                  ? "İşleniyor..." 
                  : paymentMethod === "bank-transfer" 
                    ? `Sipariş Oluştur - ${getFinalTotal().toLocaleString('tr-TR')} ₺`
                    : `${getFinalTotal().toLocaleString('tr-TR')} ₺ Öde`
                }
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}