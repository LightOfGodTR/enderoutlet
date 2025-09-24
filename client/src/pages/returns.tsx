import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  warranty: string;
}

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  createdAt: string;
  paymentMethod: string;
  installments: number;
}

interface ReturnRequest {
  id: string;
  returnType: string;
  returnReason: string;
  status: string;
  adminNotes?: string;
  requestDate: string;
  responseDate?: string;
  order: Order;
  orderItem: OrderItem;
  product: Product;
}

export default function Returns() {
  const [selectedOrderItemId, setSelectedOrderItemId] = useState<string>("");
  const [returnType, setReturnType] = useState<string>("return");
  const [returnReason, setReturnReason] = useState<string>("");
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Kullanıcının siparişlerini getir
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
  });

  // Kullanıcının iade taleplerini getir
  const { data: returns = [], isLoading: returnsLoading } = useQuery({
    queryKey: ["/api/returns"],
  });

  // İade edilmiş ürün listesi
  const { data: returnedOrderItems = [], isLoading: returnedItemsLoading } = useQuery({
    queryKey: ["/api/returns/order-items"],
  });

  // Yeni iade talebi oluştur
  const createReturnMutation = useMutation({
    mutationFn: async (returnData: any) => {
      const response = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(returnData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create return");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "İade Talebi Oluşturuldu",
        description:
          "İade talebiniz başarıyla oluşturuldu. En kısa sürede incelenecek.",
      });
      setShowReturnDialog(false);
      setReturnReason("");
      setSelectedOrderItemId("");
      queryClient.invalidateQueries({ queryKey: ["/api/returns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/returns/order-items"] });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "İade talebi oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleCreateReturn = () => {
    if (!selectedOrderItemId || !returnReason.trim()) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen tüm alanları doldurun.",
        variant: "destructive",
      });
      return;
    }

    const selectedOrder = (orders as any[]).find((order: any) =>
      order.items.some((item: any) => item.id === selectedOrderItemId),
    );

    if (!selectedOrder) {
      toast({
        title: "Hata",
        description: "Seçilen ürün bulunamadı.",
        variant: "destructive",
      });
      return;
    }

    const returnData = {
      orderId: selectedOrder.id,
      orderItemId: selectedOrderItemId,
      returnType,
      returnReason,
    };

    createReturnMutation.mutate(returnData);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Beklemede
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Onaylandı
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Reddedildi
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getReturnTypeBadge = (type: string) => {
    return type === "return" ? (
      <Badge variant="outline" className="text-blue-600">
        İade
      </Badge>
    ) : (
      <Badge variant="outline" className="text-purple-600">
        Değişim
      </Badge>
    );
  };

  if (ordersLoading || returnsLoading || returnedItemsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e63946] mx-auto mb-4"></div>
          <p className="text-gray-600">İade bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/account">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Hesabıma Dön
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            İade & Değişim
          </h1>
          <p className="text-gray-600">
            Satın aldığınız ürünler için iade ve değişim taleplerini yönetin.
          </p>
        </div>

        <Tabs defaultValue="my-returns" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-returns">İade Taleplerim</TabsTrigger>
            <TabsTrigger value="create-return">Yeni İade Talebi</TabsTrigger>
          </TabsList>

          {/* Mevcut İade Talepleri */}
          <TabsContent value="my-returns" className="space-y-6">
            {(returns as ReturnRequest[]).length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Henüz İade Talebiniz Yok
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Satın aldığınız ürünler için iade talebi oluşturabilirsiniz.
                  </p>
                  <Button
                    onClick={() => {
                      const tabsList = document.querySelector(
                        '[value="create-return"]',
                      ) as HTMLElement;
                      tabsList?.click();
                    }}
                    className="bg-[#e63946] hover:bg-[#d32f2f]"
                  >
                    İade Talebi Oluştur
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {(returns as ReturnRequest[]).map(
                  (returnRequest: ReturnRequest) => (
                    <Card key={returnRequest.id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                          {/* Sol kısım - Ürün bilgileri */}
                          <div className="flex items-center space-x-4">
                            <img
                              src={returnRequest.product.image}
                              alt={returnRequest.product.name}
                              className="w-16 h-16 object-cover rounded-lg bg-gray-100"
                            />
                            <div>
                              <h3 className="font-semibold text-gray-900 line-clamp-2">
                                {returnRequest.product.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Sipariş No: {returnRequest.order.orderNumber}
                              </p>
                              <p className="text-sm text-gray-600">
                                Talep Tarihi:{" "}
                                {new Date(
                                  returnRequest.requestDate,
                                ).toLocaleDateString("tr-TR")}
                              </p>
                            </div>
                          </div>

                          {/* Ortadaki bilgiler */}
                          <div className="flex flex-col items-start lg:items-center space-y-2">
                            {getReturnTypeBadge(returnRequest.returnType)}
                            {getStatusBadge(returnRequest.status)}
                          </div>

                          {/* Sağ kısım - Fiyat ve detay */}
                          <div className="text-right space-y-1">
                            <p className="text-lg font-semibold text-gray-900">
                              ₺
                              {returnRequest.orderItem.price.toLocaleString(
                                "tr-TR",
                              )}
                            </p>
                            <p className="text-sm text-gray-600">
                              Adet: {returnRequest.orderItem.quantity}
                            </p>
                          </div>
                        </div>

                        {/* İade sebebi */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">İade Sebebi:</span>{" "}
                            {returnRequest.returnReason}
                          </p>
                          {returnRequest.adminNotes && (
                            <p className="text-sm text-gray-600 mt-2">
                              <span className="font-medium">Admin Notu:</span>{" "}
                              {returnRequest.adminNotes}
                            </p>
                          )}
                          {returnRequest.responseDate && (
                            <p className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">Yanıt Tarihi:</span>{" "}
                              {new Date(
                                returnRequest.responseDate,
                              ).toLocaleDateString("tr-TR")}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ),
                )}
              </div>
            )}
          </TabsContent>

          {/* Yeni İade Talebi */}
          <TabsContent value="create-return" className="space-y-6">
            {(orders as any[]).length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Henüz Siparişiniz Yok
                  </h3>
                  <p className="text-gray-600 mb-4">
                    İade talebi oluşturmak için önce sipariş vermeniz gerekiyor.
                  </p>
                  <Link href="/products">
                    <Button className="bg-[#e63946] hover:bg-[#d32f2f]">
                      Alışverişe Başla
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Siparişleriniz</CardTitle>
                  <p className="text-sm text-gray-600">
                    İade talebi oluşturmak istediğiniz ürünü seçin.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(orders as any[]).map((order: any) => (
                    <div
                      key={order.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <h4 className="font-semibold">
                            Sipariş #{order.orderNumber}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString(
                              "tr-TR",
                            )}{" "}
                            • ₺{order.totalAmount.toLocaleString("tr-TR")}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {order.paymentMethod}{" "}
                          {order.installments > 1 &&
                            `(${order.installments} Taksit)`}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        {order.items?.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-12 h-12 object-cover rounded bg-gray-100"
                              />
                              <div>
                                <h5 className="font-medium text-sm line-clamp-1">
                                  {item.product.name}
                                </h5>
                                <p className="text-xs text-gray-600">
                                  Adet: {item.quantity} • ₺
                                  {item.price.toLocaleString("tr-TR")}
                                </p>
                              </div>
                            </div>
                            {returnedOrderItems.includes(item.id) ? (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled
                                data-testid={`button-return-disabled-${item.id}`}
                              >
                                İade Talep Edildi
                              </Button>
                            ) : (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      setSelectedOrderItemId(item.id)
                                    }
                                    data-testid={`button-return-${item.id}`}
                                  >
                                    İade Talep Et
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                  <DialogTitle>İade Talebi Oluştur</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  {/* Ürün özeti */}
                                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <img
                                      src={item.product.image}
                                      alt={item.product.name}
                                      className="w-12 h-12 object-cover rounded"
                                    />
                                    <div>
                                      <h6 className="font-medium">
                                        {item.product.name}
                                      </h6>
                                      <p className="text-sm text-gray-600">
                                        ₺{item.price.toLocaleString("tr-TR")}
                                      </p>
                                    </div>
                                  </div>

                                  {/* İade tipi */}
                                  <div>
                                    <Label className="text-base font-medium">
                                      İade Tipi
                                    </Label>
                                    <RadioGroup
                                      value={returnType}
                                      onValueChange={setReturnType}
                                      className="mt-2"
                                    >
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                          value="return"
                                          id="return"
                                        />
                                        <Label htmlFor="return">
                                          İade (Para İadesi)
                                        </Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                          value="exchange"
                                          id="exchange"
                                        />
                                        <Label htmlFor="exchange">
                                          Değişim
                                        </Label>
                                      </div>
                                    </RadioGroup>
                                  </div>

                                  {/* İade sebebi */}
                                  <div>
                                    <Label
                                      htmlFor="reason"
                                      className="text-base font-medium"
                                    >
                                      İade Sebebi
                                    </Label>
                                    <Textarea
                                      id="reason"
                                      placeholder="İade sebebinizi detaylı olarak açıklayın..."
                                      value={returnReason}
                                      onChange={(e) =>
                                        setReturnReason(e.target.value)
                                      }
                                      className="mt-2 min-h-[100px]"
                                      data-testid="textarea-return-reason"
                                    />
                                  </div>

                                  {/* İade koşulları */}
                                  <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                                    <h6 className="font-semibold mb-2">
                                      İade Koşulları:
                                    </h6>
                                    <ul className="list-disc list-inside space-y-1">
                                      <li>
                                        Ürün orijinal ambalajı hasar görmemiş ve
                                        ürün hasarsız olmalıdır
                                      </li>
                                      <li>İade süresi 14 gündür</li>
                                      <li>Kargo ücreti müşteriye aittir</li>
                                      <li>
                                        Para iadesi bankanıza göre değişiklik
                                        gösterir.
                                      </li>
                                    </ul>
                                  </div>

                                  <div className="flex space-x-3">
                                    <Button
                                      variant="outline"
                                      className="flex-1"
                                      onClick={() => setShowReturnDialog(false)}
                                    >
                                      İptal
                                    </Button>
                                    <Button
                                      className="flex-1 bg-[#e63946] hover:bg-[#d32f2f]"
                                      onClick={handleCreateReturn}
                                      disabled={createReturnMutation.isPending}
                                      data-testid="button-submit-return"
                                    >
                                      {createReturnMutation.isPending
                                        ? "Oluşturuluyor..."
                                        : "İade Talebi Oluştur"}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
