import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Package, Clock, Truck, CheckCircle, X } from "lucide-react";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function OrdersPage() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch user orders
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['/api/orders'],
    enabled: !!user?.id,
  }) as { data: any[], isLoading: boolean };

  if (authLoading || isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Siparişler yükleniyor...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return null;
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'preparing':
        return { label: 'Hazırlanıyor', icon: <Clock className="h-4 w-4" />, color: 'bg-yellow-100 text-yellow-800' };
      case 'pending':
        return { label: 'Ödeme Bekleniyor', icon: <Clock className="h-4 w-4" />, color: 'bg-orange-100 text-orange-800' };
      case 'ready_to_ship':
        return { label: 'Çıkışa Hazır', icon: <Package className="h-4 w-4" />, color: 'bg-blue-100 text-blue-800' };
      case 'shipped':
        return { label: 'Kargoya Teslim', icon: <Truck className="h-4 w-4" />, color: 'bg-orange-100 text-orange-800' };
      case 'in_transit':
        return { label: 'Kargoda', icon: <Truck className="h-4 w-4" />, color: 'bg-purple-100 text-purple-800' };
      case 'delivered':
        return { label: 'Teslim Edildi', icon: <CheckCircle className="h-4 w-4" />, color: 'bg-green-100 text-green-800' };
      case 'cancelled':
        return { label: 'İptal Edildi', icon: <X className="h-4 w-4" />, color: 'bg-red-100 text-red-800' };
      default:
        return { label: 'Hazırlanıyor', icon: <Clock className="h-4 w-4" />, color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                  <Package className="h-8 w-8 text-primary" />
                  <span>Siparişlerim</span>
                </h1>
                <p className="text-gray-600 mt-2">Tüm geçmiş siparişlerinizi görüntüleyin</p>
              </div>
              <Button 
                variant="outline"
                onClick={() => navigate("/account")}
              >
                Hesabıma Dön
              </Button>
            </div>
          </div>

          {/* Orders List */}
          {orders.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Henüz siparişiniz bulunmuyor</h3>
                <p className="text-gray-600 mb-6">İlk siparişinizi vermek için ürünlere göz atın</p>
                <Button onClick={() => navigate("/products")}>
                  Alışverişe Başla
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order: any) => {
                const statusInfo = getStatusInfo(order.status);
                return (
                  <Card key={order.id} className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl font-bold text-gray-900">
                            Sipariş #{order.id.slice(0, 8).toUpperCase()}
                          </CardTitle>
                          <CardDescription className="text-base mt-1">
                            {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                              day: 'numeric',
                              month: 'long', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary mb-2">
                            {parseFloat(order.totalAmount).toLocaleString('tr-TR')} ₺
                          </p>
                          <span className={`text-sm px-3 py-2 rounded-full inline-flex items-center gap-2 ${statusInfo.color}`}>
                            {statusInfo.icon}
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {order.items?.map((item: any) => (
                          <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                            <img
                              src={item.product?.image || item.product?.images?.[0]}
                              alt={item.product?.name}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                            <div className="flex-1">
                              <h4 className="text-lg font-medium text-gray-900">
                                {item.product?.name}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {item.quantity} adet x {parseFloat(item.price).toLocaleString('tr-TR')} ₺
                              </p>
                              <p className="text-base font-semibold text-primary mt-1">
                                Toplam: {(item.quantity * parseFloat(item.price)).toLocaleString('tr-TR')} ₺
                              </p>
                            </div>
                          </div>
                        ))}
                        
                        {order.items?.length > 0 && (
                          <div className="pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-medium text-gray-900">
                                Toplam ({order.items.length} ürün)
                              </span>
                              <span className="text-2xl font-bold text-primary">
                                {parseFloat(order.totalAmount).toLocaleString('tr-TR')} ₺
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {/* Kargo Takip Kodu Gösterimi */}
                        {(order.status === 'shipped' || order.status === 'in_transit' || order.status === 'delivered') && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            {order.trackingCode ? (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-sm font-medium text-green-800 mb-2">
                                  🚛 Kargo Takip Kodu
                                </p>
                                <p className="text-lg font-mono text-green-900 bg-white px-3 py-2 rounded border">
                                  {order.trackingCode}
                                </p>
                                <p className="text-xs text-green-600 mt-2">
                                  Bu kod ile kargo şirketinin web sitesinden siparişinizi takip edebilirsiniz.
                                </p>
                              </div>
                            ) : (
                              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <p className="text-sm text-amber-800">
                                  🚛 Kargo takip kodu, siparişiniz kargoya teslim edildiğinde sizinle paylaşılacaktır.
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}