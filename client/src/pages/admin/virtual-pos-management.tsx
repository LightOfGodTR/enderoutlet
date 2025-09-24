import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Plus, Edit3, Trash2, Shield } from "lucide-react";

export default function VirtualPosManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingConfig, setEditingConfig] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch virtual POS configurations
  const { data: virtualPosConfigs = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/virtual-pos'],
  });

  // Form state for creating/editing virtual POS config
  const [formData, setFormData] = useState({
    bankName: '',
    posType: '3d',
    isActive: true,
    merchantId: '',
    terminalId: '',
    apiUrl: '',
    successUrl: 'http://localhost:5000/api/payment/virtual-pos/callback',
    failUrl: 'http://localhost:5000/api/payment/virtual-pos/callback',
    secretKey: '',
    storeKey: '',
    hashAlgorithm: 'SHA512',
    currency: 'TRY',
    language: 'tr',
    displayOrder: 0,
    minAmount: '50.00',
    maxAmount: '100000.00'
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      bankName: '',
      posType: '3d',
      isActive: true,
      merchantId: '',
      terminalId: '',
      apiUrl: '',
      successUrl: 'http://localhost:5000/api/payment/virtual-pos/callback',
      failUrl: 'http://localhost:5000/api/payment/virtual-pos/callback',
      secretKey: '',
      storeKey: '',
      hashAlgorithm: 'SHA512',
      currency: 'TRY',
      language: 'tr',
      displayOrder: 0,
      minAmount: '50.00',
      maxAmount: '100000.00'
    });
    setEditingConfig(null);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Create virtual POS config mutation
  const createConfigMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/admin/virtual-pos", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/virtual-pos'] });
      toast({
        title: "Başarılı!",
        description: "Sanal POS konfigürasyonu oluşturuldu.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Hata!",
        description: "Konfigürasyon oluşturulurken hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Update virtual POS config mutation
  const updateConfigMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await apiRequest("PUT", `/api/admin/virtual-pos/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/virtual-pos'] });
      toast({
        title: "Başarılı!",
        description: "Sanal POS konfigürasyonu güncellendi.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Hata!",
        description: "Konfigürasyon güncellenirken hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Delete virtual POS config mutation
  const deleteConfigMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/admin/virtual-pos/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/virtual-pos'] });
      toast({
        title: "Başarılı!",
        description: "Sanal POS konfigürasyonu silindi.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata!",
        description: "Konfigürasyon silinirken hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingConfig) {
      updateConfigMutation.mutate({ id: editingConfig.id, ...formData });
    } else {
      createConfigMutation.mutate(formData);
    }
  };

  // Handle edit
  const handleEdit = (config: any) => {
    setEditingConfig(config);
    setFormData({
      bankName: config.bankName || '',
      posType: config.posType || '3d',
      isActive: config.isActive ?? true,
      merchantId: config.merchantId || '',
      terminalId: config.terminalId || '',
      apiUrl: config.apiUrl || '',
      successUrl: config.successUrl || 'http://localhost:5000/api/payment/virtual-pos/callback',
      failUrl: config.failUrl || 'http://localhost:5000/api/payment/virtual-pos/callback',
      secretKey: config.secretKey || '',
      storeKey: config.storeKey || '',
      hashAlgorithm: config.hashAlgorithm || 'SHA512',
      currency: config.currency || 'TRY',
      language: config.language || 'tr',
      displayOrder: config.displayOrder || 0,
      minAmount: config.minAmount || '50.00',
      maxAmount: config.maxAmount || '100000.00'
    });
    setIsDialogOpen(true);
  };

  // Handle delete
  const handleDelete = (id: string) => {
    if (confirm('Bu sanal POS konfigürasyonunu silmek istediğinizden emin misiniz?')) {
      deleteConfigMutation.mutate(id);
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sanal POS Yönetimi</h2>
          <p className="text-gray-600">Banka sanal POS konfigürasyonlarını yönetin</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Sanal POS
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingConfig ? 'Sanal POS Düzenle' : 'Yeni Sanal POS Ekle'}
              </DialogTitle>
              <DialogDescription>
                {editingConfig ? 'Mevcut sanal POS konfigürasyonunu düzenleyin.' : 'Yeni bir banka sanal POS konfigürasyonu oluşturun.'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bankName">Banka Adı</Label>
                  <Input
                    id="bankName"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    placeholder="Garanti BBVA"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="posType">POS Tipi</Label>
                  <Select value={formData.posType} onValueChange={(value) => handleSelectChange('posType', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3d">3D Secure</SelectItem>
                      <SelectItem value="3d_pay">3D Pay</SelectItem>
                      <SelectItem value="non_3d">Non 3D</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="merchantId">Merchant ID</Label>
                  <Input
                    id="merchantId"
                    name="merchantId"
                    value={formData.merchantId}
                    onChange={handleInputChange}
                    placeholder="MERCHANT_123"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="terminalId">Terminal ID</Label>
                  <Input
                    id="terminalId"
                    name="terminalId"
                    value={formData.terminalId}
                    onChange={handleInputChange}
                    placeholder="TERMINAL_001"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="apiUrl">API URL</Label>
                <Input
                  id="apiUrl"
                  name="apiUrl"
                  value={formData.apiUrl}
                  onChange={handleInputChange}
                  placeholder="https://sanalposprov.garanti.com.tr/VPServlet"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="secretKey">Secret Key</Label>
                  <Input
                    id="secretKey"
                    name="secretKey"
                    type="password"
                    value={formData.secretKey}
                    onChange={handleInputChange}
                    placeholder="SECRET_KEY_123"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="storeKey">Store Key</Label>
                  <Input
                    id="storeKey"
                    name="storeKey"
                    type="password"
                    value={formData.storeKey}
                    onChange={handleInputChange}
                    placeholder="STORE_KEY"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="minAmount">Min Tutar</Label>
                  <Input
                    id="minAmount"
                    name="minAmount"
                    type="number"
                    step="0.01"
                    value={formData.minAmount}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="maxAmount">Max Tutar</Label>
                  <Input
                    id="maxAmount"
                    name="maxAmount"
                    type="number"
                    step="0.01"
                    value={formData.maxAmount}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="displayOrder">Sıra</Label>
                  <Input
                    id="displayOrder"
                    name="displayOrder"
                    type="number"
                    value={formData.displayOrder}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="rounded"
                />
                <Label htmlFor="isActive">Aktif</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  İptal
                </Button>
                <Button 
                  type="submit" 
                  disabled={createConfigMutation.isPending || updateConfigMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {editingConfig ? 'Güncelle' : 'Oluştur'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Virtual POS Configurations List */}
      <div className="grid gap-4">
        {virtualPosConfigs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <div className="text-gray-500">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Henüz sanal POS konfigürasyonu eklenmemiş.</p>
                <p className="text-sm mt-2">İlk konfigürasyonunuzu eklemek için yukarıdaki butonu kullanın.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          virtualPosConfigs.map((config: any) => (
            <Card key={config.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{config.bankName}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{config.posType === '3d' ? '3D Secure' : config.posType}</span>
                        <span>•</span>
                        <span>Merchant: {config.merchantId}</span>
                        <span>•</span>
                        <span>Terminal: {config.terminalId}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span>Min: {parseFloat(config.minAmount).toLocaleString('tr-TR')} ₺</span>
                        {config.maxAmount && (
                          <>
                            <span>•</span>
                            <span>Max: {parseFloat(config.maxAmount).toLocaleString('tr-TR')} ₺</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={config.isActive ? "default" : "secondary"}>
                      {config.isActive ? "Aktif" : "Pasif"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(config)}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(config.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}