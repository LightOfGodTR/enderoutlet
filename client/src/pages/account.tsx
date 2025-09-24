import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "@/hooks/use-favorites";
import { apiRequest } from "@/lib/queryClient";
import { User, LogOut, Package, Heart, Settings, MapPin, Edit, Save, X, CheckCircle, Clock, Truck, RotateCcw, Mail, AlertTriangle } from "lucide-react";
import Header from "@/components/header";

function FavoritesCard() {
  const [, navigate] = useLocation();
  const { favorites, isLoading } = useFavorites();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="h-5 w-5" />
            <span>Favorilerim</span>
          </CardTitle>
          <CardDescription>Beğendiğiniz ürünler</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600">Favoriler yükleniyor...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Heart className="h-5 w-5" />
          <span>Favorilerim ({favorites.length})</span>
        </CardTitle>
        <CardDescription>Beğendiğiniz ürünler</CardDescription>
      </CardHeader>
      <CardContent>
        {favorites.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Henüz favoriniz bulunmuyor</p>
            <Button variant="outline" onClick={() => navigate("/favoriler")}>
              Favorilere Git
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.slice(0, 3).map((favorite: any) => (
              <div key={favorite.id} className="border rounded-lg p-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={favorite.product?.image || favorite.product?.images?.[0]}
                    alt={favorite.product?.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {favorite.product?.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {favorite.product?.brand || 'Arçelik'}
                    </p>
                    <p className="text-sm font-bold text-primary">
                      {favorite.product?.price ? 
                        parseFloat(favorite.product.price).toLocaleString('tr-TR') : '0'} ₺
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {favorites.length > 3 && (
              <p className="text-xs text-gray-600">
                +{favorites.length - 3} ürün daha
              </p>
            )}
            
            <Button variant="outline" className="w-full" onClick={() => navigate("/favoriler")}>
              Tüm Favorileri Görüntüle
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ReturnsCard() {
  const [, navigate] = useLocation();
  
  // Fetch user returns
  const { data: returns = [], isLoading } = useQuery({
    queryKey: ['/api/returns'],
  }) as { data: any[], isLoading: boolean };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <RotateCcw className="h-5 w-5" />
            <span>İadelerim</span>
          </CardTitle>
          <CardDescription>İade ve değişim talepleriniz</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600">İadeler yükleniyor...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingReturns = returns.filter((ret: any) => ret.status === 'pending').length;
  const approvedReturns = returns.filter((ret: any) => ret.status === 'approved').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <RotateCcw className="h-5 w-5" />
          <span>İadelerim ({returns.length})</span>
        </CardTitle>
        <CardDescription>İade ve değişim talepleriniz</CardDescription>
      </CardHeader>
      <CardContent>
        {returns.length === 0 ? (
          <div className="text-center py-8">
            <RotateCcw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Henüz iade talebiniz bulunmuyor</p>
            <Button variant="outline" onClick={() => navigate("/returns")}>
              İade Talebi Oluştur
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* İstatistikler */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{pendingReturns}</p>
                <p className="text-xs text-yellow-700">Beklemede</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{approvedReturns}</p>
                <p className="text-xs text-green-700">Onaylandı</p>
              </div>
            </div>

            {/* Son iade talepleri */}
            {returns.slice(0, 3).map((returnRequest: any) => (
              <div key={returnRequest.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={returnRequest.product?.image}
                      alt={returnRequest.product?.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {returnRequest.product?.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {returnRequest.returnType === 'return' ? 'İade' : 'Değişim'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      returnRequest.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : returnRequest.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {returnRequest.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                      {returnRequest.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {returnRequest.status === 'pending' ? 'Beklemede' : 
                       returnRequest.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {returns.length > 3 && (
              <p className="text-xs text-gray-600">
                +{returns.length - 3} iade talebi daha
              </p>
            )}
            
            <Button variant="outline" className="w-full" onClick={() => navigate("/returns")}>
              Tüm İade Taleplerini Görüntüle
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function OrdersCard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  // Fetch user orders
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['/api/orders'],
    enabled: !!user?.id,
  }) as { data: any[], isLoading: boolean };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Siparişlerim</span>
          </CardTitle>
          <CardDescription>Geçmiş siparişlerinizi görüntüleyin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600">Siparişler yükleniyor...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="h-5 w-5" />
          <span>Siparişlerim</span>
        </CardTitle>
        <CardDescription>Geçmiş siparişlerinizi görüntüleyin</CardDescription>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Henüz siparişiniz bulunmuyor</p>
            <Button onClick={() => navigate("/products")}>
              Alışverişe Başla
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.slice(0, 3).map((order: any) => (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">Sipariş #{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">
                      {parseFloat(order.totalAmount).toLocaleString('tr-TR')} ₺
                    </p>
                    {(() => {
                      const getStatusInfo = (status: string) => {
                        switch (status) {
                          case 'preparing':
                            return { label: 'Hazırlanıyor', icon: <Clock className="h-3 w-3" />, color: 'bg-yellow-100 text-yellow-800' };
                          case 'pending':
                            return { label: 'Ödeme Bekleniyor', icon: <Clock className="h-3 w-3" />, color: 'bg-orange-100 text-orange-800' };
                          case 'ready_to_ship':
                            return { label: 'Çıkışa Hazır', icon: <Package className="h-3 w-3" />, color: 'bg-blue-100 text-blue-800' };
                          case 'shipped':
                            return { label: 'Kargoya Teslim', icon: <Truck className="h-3 w-3" />, color: 'bg-orange-100 text-orange-800' };
                          case 'in_transit':
                            return { label: 'Kargoda', icon: <Truck className="h-3 w-3" />, color: 'bg-purple-100 text-purple-800' };
                          case 'delivered':
                            return { label: 'Teslim Edildi', icon: <CheckCircle className="h-3 w-3" />, color: 'bg-green-100 text-green-800' };
                          case 'cancelled':
                            return { label: 'İptal Edildi', icon: <X className="h-3 w-3" />, color: 'bg-red-100 text-red-800' };
                          default:
                            return { label: 'Hazırlanıyor', icon: <Clock className="h-3 w-3" />, color: 'bg-gray-100 text-gray-800' };
                        }
                      };
                      const statusInfo = getStatusInfo(order.status);
                      return (
                        <span className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 ${statusInfo.color}`}>
                          {statusInfo.icon}
                          {statusInfo.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {order.items?.slice(0, 2).map((item: any) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <img
                        src={item.product?.image || item.product?.images?.[0]}
                        alt={item.product?.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.product?.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {item.quantity} adet x {parseFloat(item.price).toLocaleString('tr-TR')} ₺
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {order.items?.length > 2 && (
                    <p className="text-xs text-gray-600 mt-2">
                      +{order.items.length - 2} ürün daha
                    </p>
                  )}
                </div>
              </div>
            ))}
            
            {orders.length > 3 && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/siparislerim")}
              >
                Tüm Siparişleri Görüntüle
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AccountPage() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const initials = `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || user.username?.charAt(0) || "U"}`.toUpperCase();

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-16">
        {/* Account Header */}
        <div className="bg-white shadow">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg font-semibold bg-primary text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Merhaba, {user.firstName || user.username}!
                  </h1>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {(user as any).role === 'admin' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/admin')}
                    className="flex items-center space-x-1"
                  >
                    <Settings className="h-3 w-3" />
                    <span>Admin Paneli</span>
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Çıkış Yap</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Account Content */}
        <div className="container mx-auto px-4 py-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Email Verification Card */}
            <EmailVerificationCard user={user} />

            {/* Profile Card */}
            <ProfileCard user={user} />

            {/* Addresses Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Adreslerim</span>
                </CardTitle>
                <CardDescription>Teslimat adreslerinizi yönetin</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Teslimat adreslerinizi buradan yönetebilirsiniz</p>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate("/adreslerim")}
                  >
                    Adreslerimi Yönet
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Orders Card */}
            <OrdersCard />

            {/* Returns Card */}
            <ReturnsCard />

            {/* Favorites Card */}
            <FavoritesCard />

          </div>
        </div>
      </div>
    </>
  );
}

// Email Verification Card Component
function EmailVerificationCard({ user }: { user: any }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [emailVerificationLoading, setEmailVerificationLoading] = useState(false);

  const resendEmailVerificationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/auth/resend-email-verification", "POST");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "E-posta gönderildi",
        description: "Doğrulama e-postası gönderildi. E-posta kutunuzu kontrol edin.",
      });
      setEmailVerificationLoading(false);
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "E-posta gönderilemedi. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
      setEmailVerificationLoading(false);
    }
  });



  const handleEmailVerification = () => {
    setEmailVerificationLoading(true);
    resendEmailVerificationMutation.mutate();
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Hesap Güvenliği</span>
        </CardTitle>
        <CardDescription>E-posta doğrulama durumu</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Verification */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${(user as any).emailVerified ? 'bg-green-100' : 'bg-yellow-100'}`}>
              <Mail className={`h-4 w-4 ${(user as any).emailVerified ? 'text-green-600' : 'text-yellow-600'}`} />
            </div>
            <div>
              <p className="font-medium">E-posta Doğrulama</p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {(user as any).emailVerified ? (
              <div className="flex items-center space-x-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Doğrulandı</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 text-yellow-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">Doğrulanmadı</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleEmailVerification}
                  disabled={emailVerificationLoading}
                >
                  {emailVerificationLoading ? "Gönderiliyor..." : "Doğrula"}
                </Button>
              </div>
            )}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}

// Profile Card Component
function ProfileCard({ user }: { user: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [phone, setPhone] = useState(user.phone || "");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string; phone: string }) => {
      const response = await apiRequest("/api/auth/update-profile", "PUT", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setIsEditing(false);
      toast({
        title: "Profil güncellendi",
        description: "Profil bilgileriniz başarıyla güncellendi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Profil güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    updateProfileMutation.mutate({ firstName, lastName, phone });
  };

  const handleCancel = () => {
    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
    setPhone(user.phone || "");
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Profil Bilgileri</span>
          </div>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Düzenle
            </Button>
          )}
        </CardTitle>
        <CardDescription>Hesap bilgilerinizi görüntüleyin ve düzenleyin</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Ad</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Adınızı girin"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Soyad</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Soyadınızı girin"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon Numarası</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Telefon numaranızı girin"
                  type="tel"
                />
              </div>
              <div className="space-y-2">
                <Label>E-posta</Label>
                <p className="text-sm text-gray-600 py-2">{user.email} (değiştirilemez)</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={handleSave} 
                disabled={updateProfileMutation.isPending}
                className="flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {updateProfileMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={updateProfileMutation.isPending}
              >
                <X className="h-4 w-4 mr-2" />
                İptal
              </Button>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Ad</label>
              <p className="mt-1 text-sm text-gray-900">{user.firstName || "Belirtilmemiş"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Soyad</label>
              <p className="mt-1 text-sm text-gray-900">{user.lastName || "Belirtilmemiş"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Telefon Numarası</label>
              <p className="mt-1 text-sm text-gray-900">{user.phone || "Belirtilmemiş"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">E-posta</label>
              <p className="mt-1 text-sm text-gray-900">{user.email}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}