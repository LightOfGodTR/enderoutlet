import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, Package, User, Calendar, DollarSign, CreditCard, Eye } from "lucide-react";

interface ReturnRequest {
  id: string;
  returnType: string;
  returnReason: string;
  status: string;
  adminNotes?: string;
  requestDate: string;
  responseDate?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  order: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    createdAt: string;
    paymentMethod: string;
    installments: number;
  };
  orderItem: {
    id: string;
    quantity: number;
    price: number;
    warranty: string;
  };
  product: {
    id: string;
    name: string;
    image: string;
    price: number;
  };
}

export default function ReturnsManagement() {
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Tüm iade taleplerini getir
  const { data: returns = [], isLoading } = useQuery({
    queryKey: ["/api/admin/returns"],
  }) as { data: ReturnRequest[], isLoading: boolean };

  // İade durumu güncelleme
  const updateReturnMutation = useMutation({
    mutationFn: async ({ returnId, status, notes }: { returnId: string; status: string; notes?: string }) => {
      const response = await fetch(`/api/admin/returns/${returnId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes: notes }),
      });
      if (!response.ok) throw new Error("Failed to update return status");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "İade Durumu Güncellendi",
        description: `İade talebi başarıyla ${actionType === 'approve' ? 'onaylandı' : 'reddedildi'}.`,
      });
      setSelectedReturn(null);
      setAdminNotes("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/returns"] });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "İade durumu güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleUpdateReturn = (status: "approved" | "rejected") => {
    if (!selectedReturn) return;
    
    setActionType(status === "approved" ? "approve" : "reject");
    updateReturnMutation.mutate({
      returnId: selectedReturn.id,
      status,
      notes: adminNotes.trim() || undefined,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Beklemede</Badge>;
      case "approved":
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Onaylandı</Badge>;
      case "rejected":
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Reddedildi</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getReturnTypeBadge = (type: string) => {
    return type === "return" ? (
      <Badge variant="outline" className="text-blue-600">İade</Badge>
    ) : (
      <Badge variant="outline" className="text-purple-600">Değişim</Badge>
    );
  };

  const pendingReturns = returns.filter(ret => ret.status === "pending");
  const approvedReturns = returns.filter(ret => ret.status === "approved");
  const rejectedReturns = returns.filter(ret => ret.status === "rejected");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e63946] mx-auto mb-4"></div>
          <p className="text-gray-600">İade talepleri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">İade Yönetimi</h2>
          <p className="text-gray-600">Müşteri iade taleplerini inceleyin ve onaylayın</p>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{returns.length}</p>
                <p className="text-sm text-gray-600">Toplam İade</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{pendingReturns.length}</p>
                <p className="text-sm text-gray-600">Beklemede</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{approvedReturns.length}</p>
                <p className="text-sm text-gray-600">Onaylandı</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{rejectedReturns.length}</p>
                <p className="text-sm text-gray-600">Reddedildi</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* İade Talepleri Listesi */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Bekleyen Talepler ({pendingReturns.length})</TabsTrigger>
          <TabsTrigger value="approved">Onaylanan ({approvedReturns.length})</TabsTrigger>
          <TabsTrigger value="rejected">Reddedilen ({rejectedReturns.length})</TabsTrigger>
          <TabsTrigger value="all">Tümü ({returns.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <ReturnsList 
            returns={pendingReturns} 
            onSelectReturn={setSelectedReturn} 
            getStatusBadge={getStatusBadge}
            getReturnTypeBadge={getReturnTypeBadge}
          />
        </TabsContent>

        <TabsContent value="approved">
          <ReturnsList 
            returns={approvedReturns} 
            onSelectReturn={setSelectedReturn} 
            getStatusBadge={getStatusBadge}
            getReturnTypeBadge={getReturnTypeBadge}
          />
        </TabsContent>

        <TabsContent value="rejected">
          <ReturnsList 
            returns={rejectedReturns} 
            onSelectReturn={setSelectedReturn} 
            getStatusBadge={getStatusBadge}
            getReturnTypeBadge={getReturnTypeBadge}
          />
        </TabsContent>

        <TabsContent value="all">
          <ReturnsList 
            returns={returns} 
            onSelectReturn={setSelectedReturn} 
            getStatusBadge={getStatusBadge}
            getReturnTypeBadge={getReturnTypeBadge}
          />
        </TabsContent>
      </Tabs>

      {/* İade Detay Dialog */}
      {selectedReturn && (
        <Dialog open={!!selectedReturn} onOpenChange={() => setSelectedReturn(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>İade Detayları</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Müşteri Bilgileri */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Müşteri Bilgileri</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Ad Soyad</Label>
                    <p className="font-semibold">{selectedReturn.user.firstName} {selectedReturn.user.lastName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">E-posta</Label>
                    <p className="font-semibold">{selectedReturn.user.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Telefon</Label>
                    <p className="font-semibold">{selectedReturn.user.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Müşteri ID</Label>
                    <p className="font-semibold">{selectedReturn.user.id}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Sipariş Bilgileri */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5" />
                    <span>Sipariş Bilgileri</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Sipariş No</Label>
                    <p className="font-semibold">{selectedReturn.order.orderNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Sipariş Tarihi</Label>
                    <p className="font-semibold">{new Date(selectedReturn.order.createdAt).toLocaleDateString('tr-TR')}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Toplam Tutar</Label>
                    <p className="font-semibold">₺{selectedReturn.order.totalAmount.toLocaleString('tr-TR')}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Ödeme Yöntemi</Label>
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4" />
                      <span className="font-semibold">
                        {selectedReturn.order.paymentMethod}
                        {selectedReturn.order.installments > 1 && ` (${selectedReturn.order.installments} Taksit)`}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ürün Bilgileri */}
              <Card>
                <CardHeader>
                  <CardTitle>İade Edilen Ürün</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <img
                      src={selectedReturn.product.image}
                      alt={selectedReturn.product.name}
                      className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{selectedReturn.product.name}</h3>
                      <div className="grid grid-cols-3 gap-4 mt-3">
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Adet</Label>
                          <p className="font-semibold">{selectedReturn.orderItem.quantity}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Birim Fiyat</Label>
                          <p className="font-semibold">₺{selectedReturn.orderItem.price.toLocaleString('tr-TR')}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Garanti</Label>
                          <p className="font-semibold">{selectedReturn.orderItem.warranty}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* İade Detayları */}
              <Card>
                <CardHeader>
                  <CardTitle>İade Talebi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">İade Tipi</Label>
                      <div className="mt-1">{getReturnTypeBadge(selectedReturn.returnType)}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Durum</Label>
                      <div className="mt-1">{getStatusBadge(selectedReturn.status)}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Talep Tarihi</Label>
                      <p className="font-semibold">{new Date(selectedReturn.requestDate).toLocaleDateString('tr-TR')}</p>
                    </div>
                    {selectedReturn.responseDate && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Yanıt Tarihi</Label>
                        <p className="font-semibold">{new Date(selectedReturn.responseDate).toLocaleDateString('tr-TR')}</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-600">İade Sebebi</Label>
                    <p className="mt-2 p-3 bg-gray-50 rounded-lg">{selectedReturn.returnReason}</p>
                  </div>

                  {selectedReturn.adminNotes && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Admin Notları</Label>
                      <p className="mt-2 p-3 bg-blue-50 rounded-lg">{selectedReturn.adminNotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Admin İşlemleri */}
              {selectedReturn.status === "pending" && (
                <Card>
                  <CardHeader>
                    <CardTitle>İade Değerlendirmesi</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="admin-notes" className="text-sm font-medium">Admin Notları (Opsiyonel)</Label>
                      <Textarea
                        id="admin-notes"
                        placeholder="Bu iade talebi hakkında notlarınızı yazın..."
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        className="mt-2"
                        data-testid="textarea-admin-notes"
                      />
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleUpdateReturn("approved")}
                        disabled={updateReturnMutation.isPending}
                        data-testid="button-approve-return"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {updateReturnMutation.isPending && actionType === "approve" ? "Onaylanıyor..." : "Onayla"}
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleUpdateReturn("rejected")}
                        disabled={updateReturnMutation.isPending}
                        data-testid="button-reject-return"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        {updateReturnMutation.isPending && actionType === "reject" ? "Reddediliyor..." : "Reddet"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// İade Listesi Komponenti
function ReturnsList({ 
  returns, 
  onSelectReturn, 
  getStatusBadge, 
  getReturnTypeBadge 
}: {
  returns: ReturnRequest[];
  onSelectReturn: (returnRequest: ReturnRequest) => void;
  getStatusBadge: (status: string) => JSX.Element;
  getReturnTypeBadge: (type: string) => JSX.Element;
}) {
  if (returns.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Bu kategoride iade talebi yok</h3>
          <p className="text-gray-600">Henüz bu durumda hiç iade talebi bulunmuyor.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {returns.map((returnRequest) => (
        <Card key={returnRequest.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {/* Sol taraf - Ürün ve müşteri bilgileri */}
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
                    Müşteri: {returnRequest.user.firstName} {returnRequest.user.lastName}
                  </p>
                  <p className="text-sm text-gray-600">
                    Sipariş: {returnRequest.order.orderNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    Talep: {new Date(returnRequest.requestDate).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>

              {/* Orta - Badges */}
              <div className="flex flex-col items-center space-y-2">
                {getReturnTypeBadge(returnRequest.returnType)}
                {getStatusBadge(returnRequest.status)}
              </div>

              {/* Sağ - Fiyat ve işlemler */}
              <div className="text-right space-y-2">
                <p className="text-lg font-semibold text-gray-900">
                  ₺{returnRequest.orderItem.price.toLocaleString('tr-TR')}
                </p>
                <p className="text-sm text-gray-600">
                  Adet: {returnRequest.orderItem.quantity}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSelectReturn(returnRequest)}
                  className="flex items-center space-x-1"
                  data-testid={`button-view-return-${returnRequest.id}`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Detay</span>
                </Button>
              </div>
            </div>

            {/* İade sebebi */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-medium">İade Sebebi:</span> {returnRequest.returnReason}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}