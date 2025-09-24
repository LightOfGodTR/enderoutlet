import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle,
  Package,
  Truck,
  Clock,
  X,
  Home,
  CreditCard,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import type { Order, OrderItem, Product, BankAccount } from "@shared/schema";
import { toast } from "@/hooks/use-toast";

interface OrderWithItems extends Order {
  items: (OrderItem & { product: Product })[];
}

export default function OrderConfirmation() {
  const [, setLocation] = useLocation();
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    // Get order ID from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const orderIdFromUrl = urlParams.get("orderId");
    const orderIdFromStorage = localStorage.getItem("lastOrderId");

    if (orderIdFromUrl) {
      setOrderId(orderIdFromUrl);
      localStorage.removeItem("lastOrderId"); // Clean up
    } else if (orderIdFromStorage) {
      setOrderId(orderIdFromStorage);
      localStorage.removeItem("lastOrderId"); // Clean up
    } else {
      // No order ID found, redirect to home
      setLocation("/");
    }
  }, [setLocation]);

  const { data: order, isLoading } = useQuery<OrderWithItems>({
    queryKey: [`/api/orders/${orderId}`],
    enabled: !!orderId,
  });

  // Fetch bank accounts if payment is bank transfer and status is pending
  const { data: bankAccounts = [] } = useQuery<BankAccount[]>({
    queryKey: ["/api/admin/bank-accounts"],
    enabled:
      order?.paymentMethod === "bank-transfer" && order?.status === "pending",
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Kopyalandı!",
        description: `${label} panoya kopyalandı.`,
      });
    });
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "preparing":
        return {
          label: "Hazırlanıyor",
          icon: <Clock className="h-5 w-5" />,
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          bgColor: "bg-yellow-50",
        };
      case "ready_to_ship":
        return {
          label: "Çıkışa Hazır",
          icon: <Package className="h-5 w-5" />,
          color: "bg-blue-100 text-blue-800 border-blue-200",
          bgColor: "bg-blue-50",
        };
      case "shipped":
        return {
          label: "Kargoya Teslim Edildi",
          icon: <Truck className="h-5 w-5" />,
          color: "bg-orange-100 text-orange-800 border-orange-200",
          bgColor: "bg-orange-50",
        };
      case "in_transit":
        return {
          label: "Kargodan Çıktı",
          icon: <Truck className="h-5 w-5" />,
          color: "bg-purple-100 text-purple-800 border-purple-200",
          bgColor: "bg-purple-50",
        };
      case "delivered":
        return {
          label: "Sipariş Teslim Edildi",
          icon: <CheckCircle className="h-5 w-5" />,
          color: "bg-green-100 text-green-800 border-green-200",
          bgColor: "bg-green-50",
        };
      case "pending":
        return {
          label: "Ödeme Bekleniyor",
          icon: <Clock className="h-5 w-5" />,
          color: "bg-orange-100 text-orange-800 border-orange-200",
          bgColor: "bg-orange-50",
        };
      case "cancelled":
        return {
          label: "İptal Edildi",
          icon: <X className="h-5 w-5" />,
          color: "bg-red-100 text-red-800 border-red-200",
          bgColor: "bg-red-50",
        };
      default:
        return {
          label: "Hazırlanıyor",
          icon: <Clock className="h-5 w-5" />,
          color: "bg-gray-100 text-gray-800 border-gray-200",
          bgColor: "bg-gray-50",
        };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="animate-pulse">
              <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-8"></div>
                <div className="space-y-4">
                  <div className="h-20 bg-gray-200 rounded"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Sipariş Bulunamadı
              </h1>
              <p className="text-gray-600 mb-6">
                Sipariş bilgileri bulunamadı veya geçersiz sipariş ID'si.
              </p>
              <Link href="/">
                <Button>
                  <Home className="h-4 w-4 mr-2" />
                  Ana Sayfaya Dön
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bizi Tercih Ettiğiniz İçin Teşekkürler!
            </h1>
            <p className="text-lg text-gray-600">
              Siparişiniz başarıyla oluşturuldu
            </p>
          </div>

          {/* Order Summary */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Sipariş Özeti</span>
                <Badge variant="outline" className={statusInfo.color}>
                  {statusInfo.icon}
                  <span className="ml-1">{statusInfo.label}</span>
                </Badge>
              </CardTitle>
              <CardDescription>
                Sipariş No: {order.orderNumber} •{" "}
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString("tr-TR")
                  : "Tarih belirsiz"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Teslimat Adresi</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {order.shippingAddress}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Ödeme Yöntemi</h3>
                  <p className="text-gray-600 text-sm">
                    {order.paymentMethod === "credit-card"
                      ? "Kredi Kartı"
                      : order.paymentMethod === "virtual-pos"
                        ? "Kredi Kartı (3D Secure)"
                        : order.paymentMethod === "bank-transfer"
                          ? "Havale/EFT"
                          : order.paymentMethod}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Status */}
          <Card className={`mb-8 border-2 ${statusInfo.bgColor}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <div className="flex items-center space-x-3">
                  {statusInfo.icon}
                  <div>
                    <h3 className="font-semibold text-lg">Sipariş Durumu</h3>
                    <p className="text-sm opacity-75">{statusInfo.label}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Transfer Payment Instructions */}
          {order.paymentMethod === "bank-transfer" &&
            order.status === "pending" && (
              <Card className="mb-8 border-2 border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="text-orange-800 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Havale/EFT İle Ödeme Talimatları
                  </CardTitle>
                  <CardDescription className="text-orange-600">
                    Ödemenizi yapmak için aşağıdaki banka hesap bilgilerini
                    kullanın
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-orange-200">
                    <p className="text-sm text-orange-700 mb-4 font-medium">
                      ⚠️ Önemli: Havale/EFT açıklama kısmına mutlaka sipariş
                      numaranızı yazın: <strong>{order.orderNumber}</strong>
                    </p>

                    {bankAccounts.length > 0 ? (
                      <div className="space-y-4">
                        {bankAccounts
                          .filter((account) => account.isActive)
                          .map((account) => (
                            <div
                              key={account.id}
                              className="border-l-4 border-orange-300 pl-4 bg-orange-25"
                            >
                              <h4 className="font-semibold text-gray-900 mb-2">
                                {account.bankName}
                              </h4>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">
                                    IBAN:
                                  </span>
                                  <div className="flex items-center space-x-2">
                                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                                      {account.iban}
                                    </code>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        copyToClipboard(account.iban, "IBAN")
                                      }
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">
                                    Hesap Sahibi:
                                  </span>
                                  <span className="text-sm font-medium">
                                    {account.accountHolder}
                                  </span>
                                </div>
                                {account.branch && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                      Şube:
                                    </span>
                                    <span className="text-sm">
                                      {account.branch}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-600">
                          Banka hesap bilgileri yükleniyor...
                        </p>
                      </div>
                    )}

                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h5 className="font-semibold text-blue-800 mb-2">
                        Ödeme Sonrası
                      </h5>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>
                          • Ödemeniz onaylandıktan sonra siparişiniz
                          hazırlanmaya başlayacak
                        </li>
                        <li>
                          • Ödeme durumunuzu "Siparişlerim" sayfasından takip
                          edebilirsiniz
                        </li>
                        <li>
                          • Genellikle aynı gün içinde ödemeniz kontrol edilip
                          onaylanır
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Order Items */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Sipariş Detayları</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 p-4 border rounded-lg"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.product.name}</h4>
                      <p className="text-sm text-gray-600">
                        Adet: {item.quantity}
                      </p>
                      {item.warranty && (
                        <p className="text-sm text-gray-600">
                          Garanti: {item.warranty}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {parseFloat(item.price).toLocaleString("tr-TR")} ₺
                      </p>
                      <p className="text-sm text-gray-600">
                        Toplam:{" "}
                        {(
                          parseFloat(item.price) * item.quantity
                        ).toLocaleString("tr-TR")}{" "}
                        ₺
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Total */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Toplam Tutar:</span>
                <span className="text-primary">
                  {parseFloat(order.totalAmount).toLocaleString("tr-TR")} ₺
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <Link href="/orders">
              <Button variant="outline" size="lg">
                <Package className="h-4 w-4 mr-2" />
                Siparişlerimi Görüntüle
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg">
                <Home className="h-4 w-4 mr-2" />
                Alışverişe Devam Et
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
