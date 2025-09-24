import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Save, 
  Plus, 
  Trash2, 
  Edit3,
  CreditCard,
  Banknote,
  Building2,
  Copy,
  Check
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { GeneralSettings, BankAccount } from "@shared/schema";

export default function PaymentMethodsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [copiedIban, setCopiedIban] = useState<string | null>(null);

  const [newAccount, setNewAccount] = useState({
    bankName: "",
    accountHolder: "",
    iban: "",
    branchCode: "",
    branchName: "",
    accountNumber: "",
    swiftCode: "",
    description: "",
    isActive: true,
    isDefault: false
  });

  // Local form state for general settings
  const [formSettings, setFormSettings] = useState({
    bankName: "",
    accountHolder: "",
    iban: "",
    bankTransferInstructions: ""
  });
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  // Fetch general settings to get current bank transfer settings
  const { data: settings, isLoading: settingsLoading } = useQuery<GeneralSettings>({
    queryKey: ["/api/admin/settings"],
  });

  // Fetch bank accounts
  const { data: bankAccounts = [], isLoading: accountsLoading } = useQuery<BankAccount[]>({
    queryKey: ["/api/admin/bank-accounts"],
  });

  // Update form settings when server data loads (only on initial load)
  useEffect(() => {
    if (settings && !isFormInitialized) {
      setFormSettings({
        bankName: settings.bankName || "",
        accountHolder: settings.accountHolder || "",
        iban: settings.iban || "",
        bankTransferInstructions: settings.bankTransferInstructions || ""
      });
      setIsFormInitialized(true);
    }
  }, [settings, isFormInitialized]);

  // Update general settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("/api/admin/settings", "PUT", data);
    },
    onSuccess: () => {
      toast({
        title: "Başarılı!",
        description: "Havale/EFT ayarları güncellendi.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
    },
    onError: (error) => {
      toast({
        title: "Hata!",
        description: "Ayarlar güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Create bank account mutation
  const createAccountMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("/api/admin/bank-accounts", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Başarılı!",
        description: "Banka hesabı eklendi.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bank-accounts"] });
      setIsAddingNew(false);
      setNewAccount({
        bankName: "",
        accountHolder: "",
        iban: "",
        branchCode: "",
        branchName: "",
        accountNumber: "",
        swiftCode: "",
        description: "",
        isActive: true,
        isDefault: false
      });
    },
    onError: (error) => {
      toast({
        title: "Hata!",
        description: "Banka hesabı eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Update bank account mutation
  const updateAccountMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiRequest(`/api/admin/bank-accounts/${id}`, "PUT", data);
    },
    onSuccess: () => {
      toast({
        title: "Başarılı!",
        description: "Banka hesabı güncellendi.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bank-accounts"] });
      setEditingAccount(null);
    },
    onError: (error) => {
      toast({
        title: "Hata!",
        description: "Banka hesabı güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Delete bank account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest(`/api/admin/bank-accounts/${id}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Başarılı!",
        description: "Banka hesabı silindi.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bank-accounts"] });
    },
    onError: (error) => {
      toast({
        title: "Hata!",
        description: "Banka hesabı silinirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (settings) {
      const updatedSettings = {
        ...settings,
        ...formSettings
      };
      updateSettingsMutation.mutate(updatedSettings);
    }
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    createAccountMutation.mutate(newAccount);
  };

  const handleUpdateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAccount) {
      updateAccountMutation.mutate({
        id: editingAccount.id,
        data: editingAccount
      });
    }
  };

  const copyIban = (iban: string) => {
    navigator.clipboard.writeText(iban);
    setCopiedIban(iban);
    toast({
      title: "Kopyalandı!",
      description: "IBAN numarası panoya kopyalandı.",
    });
    
    setTimeout(() => {
      setCopiedIban(null);
    }, 2000);
  };

  const formatIban = (iban: string) => {
    return iban.replace(/(.{4})/g, '$1 ').trim();
  };

  if (settingsLoading || accountsLoading) {
    return <div className="animate-pulse">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Ödeme Yöntemleri Yönetimi</h2>
        <p className="text-gray-600 mt-2">Havale/EFT ve diğer ödeme yöntemlerini yönetin</p>
      </div>

      {/* Current Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="w-5 h-5" />
            Havale/EFT Genel Ayarları
          </CardTitle>
          <CardDescription>
            Havale/EFT ödeme yöntemi için genel ayarları düzenleyin
          </CardDescription>
        </CardHeader>
        <CardContent>
          {settings && (
            <form onSubmit={handleUpdateSettings} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Varsayılan Banka Adı</Label>
                  <Input
                    value={formSettings.bankName}
                    onChange={(e) => {
                      setFormSettings({
                        ...formSettings,
                        bankName: e.target.value
                      });
                    }}
                    placeholder="Garanti BBVA"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Hesap Sahibi</Label>
                  <Input
                    value={formSettings.accountHolder}
                    onChange={(e) => {
                      setFormSettings({
                        ...formSettings,
                        accountHolder: e.target.value
                      });
                    }}
                    placeholder="ARÇELIK A.Ş."
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label>IBAN</Label>
                  <div className="flex gap-2">
                    <Input
                      value={formSettings.iban}
                      onChange={(e) => {
                        setFormSettings({
                          ...formSettings,
                          iban: e.target.value
                        });
                      }}
                      placeholder="TR00 0000 0000 0000 0000 0000 00"
                      className="flex-1"
                    />
                    {formSettings.iban && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => copyIban(formSettings.iban)}
                        className="px-3"
                      >
                        {copiedIban === formSettings.iban ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label>Ödeme Talimatları</Label>
                  <Textarea
                    value={formSettings.bankTransferInstructions}
                    onChange={(e) => {
                      setFormSettings({
                        ...formSettings,
                        bankTransferInstructions: e.target.value
                      });
                    }}
                    placeholder="Havale/EFT yaparken açıklama kısmına sipariş numaranızı yazınız..."
                    rows={3}
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                disabled={updateSettingsMutation.isPending}
                className="w-full"
              >
                {updateSettingsMutation.isPending ? "Kaydediliyor..." : "Ayarları Kaydet"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Bank Accounts Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Banka Hesapları
              </CardTitle>
              <CardDescription>
                Birden fazla banka hesabı ekleyip yönetebilirsiniz
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddingNew(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Yeni Hesap Ekle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bankAccounts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Henüz banka hesabı eklenmemiş.</p>
                <p className="text-sm">İlk banka hesabınızı eklemek için yukarıdaki butona tıklayın.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {bankAccounts.map((account: BankAccount) => (
                  <div key={account.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{account.bankName}</h3>
                          {account.isDefault && (
                            <Badge variant="default" className="text-xs">
                              Varsayılan
                            </Badge>
                          )}
                          {!account.isActive && (
                            <Badge variant="secondary" className="text-xs">
                              Pasif
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{account.accountHolder}</p>
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {formatIban(account.iban)}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyIban(account.iban)}
                            className="p-1"
                          >
                            {copiedIban === account.iban ? (
                              <Check className="w-3 h-3 text-green-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                        {account.description && (
                          <p className="text-sm text-gray-500">{account.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingAccount(account)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteAccountMutation.mutate(account.id)}
                          disabled={deleteAccountMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add New Account Dialog */}
      <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Yeni Banka Hesabı Ekle</DialogTitle>
            <DialogDescription>
              Havale/EFT ödemeleri için yeni bir banka hesabı ekleyin
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Banka Adı *</Label>
                <Input
                  value={newAccount.bankName}
                  onChange={(e) => setNewAccount({ ...newAccount, bankName: e.target.value })}
                  placeholder="Garanti BBVA"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Hesap Sahibi *</Label>
                <Input
                  value={newAccount.accountHolder}
                  onChange={(e) => setNewAccount({ ...newAccount, accountHolder: e.target.value })}
                  placeholder="ARÇELIK A.Ş."
                  required
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label>IBAN *</Label>
                <Input
                  value={newAccount.iban}
                  onChange={(e) => setNewAccount({ ...newAccount, iban: e.target.value })}
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Şube Kodu</Label>
                <Input
                  value={newAccount.branchCode}
                  onChange={(e) => setNewAccount({ ...newAccount, branchCode: e.target.value })}
                  placeholder="1234"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Şube Adı</Label>
                <Input
                  value={newAccount.branchName}
                  onChange={(e) => setNewAccount({ ...newAccount, branchName: e.target.value })}
                  placeholder="Levent Şubesi"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Hesap Numarası</Label>
                <Input
                  value={newAccount.accountNumber}
                  onChange={(e) => setNewAccount({ ...newAccount, accountNumber: e.target.value })}
                  placeholder="123456789"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Swift Kodu</Label>
                <Input
                  value={newAccount.swiftCode}
                  onChange={(e) => setNewAccount({ ...newAccount, swiftCode: e.target.value })}
                  placeholder="TGBATRIS"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label>Açıklama</Label>
                <Textarea
                  value={newAccount.description}
                  onChange={(e) => setNewAccount({ ...newAccount, description: e.target.value })}
                  placeholder="Bu hesap hakkında ek bilgi..."
                  rows={2}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={newAccount.isActive}
                  onCheckedChange={(checked) => setNewAccount({ ...newAccount, isActive: checked })}
                />
                <Label htmlFor="isActive">Aktif</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isDefault"
                  checked={newAccount.isDefault}
                  onCheckedChange={(checked) => setNewAccount({ ...newAccount, isDefault: checked })}
                />
                <Label htmlFor="isDefault">Varsayılan hesap</Label>
              </div>
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsAddingNew(false)}>
                İptal
              </Button>
              <Button type="submit" disabled={createAccountMutation.isPending}>
                {createAccountMutation.isPending ? "Ekleniyor..." : "Hesap Ekle"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={!!editingAccount} onOpenChange={() => setEditingAccount(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Banka Hesabını Düzenle</DialogTitle>
            <DialogDescription>
              Banka hesabı bilgilerini güncelleyin
            </DialogDescription>
          </DialogHeader>
          {editingAccount && (
            <form onSubmit={handleUpdateAccount} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Banka Adı *</Label>
                  <Input
                    value={editingAccount.bankName}
                    onChange={(e) => setEditingAccount({ ...editingAccount, bankName: e.target.value })}
                    placeholder="Garanti BBVA"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Hesap Sahibi *</Label>
                  <Input
                    value={editingAccount.accountHolder}
                    onChange={(e) => setEditingAccount({ ...editingAccount, accountHolder: e.target.value })}
                    placeholder="ARÇELIK A.Ş."
                    required
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label>IBAN *</Label>
                  <Input
                    value={editingAccount.iban}
                    onChange={(e) => setEditingAccount({ ...editingAccount, iban: e.target.value })}
                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Şube Kodu</Label>
                  <Input
                    value={editingAccount.branchCode || ""}
                    onChange={(e) => setEditingAccount({ ...editingAccount, branchCode: e.target.value })}
                    placeholder="1234"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Şube Adı</Label>
                  <Input
                    value={editingAccount.branchName || ""}
                    onChange={(e) => setEditingAccount({ ...editingAccount, branchName: e.target.value })}
                    placeholder="Levent Şubesi"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Hesap Numarası</Label>
                  <Input
                    value={editingAccount.accountNumber || ""}
                    onChange={(e) => setEditingAccount({ ...editingAccount, accountNumber: e.target.value })}
                    placeholder="123456789"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Swift Kodu</Label>
                  <Input
                    value={editingAccount.swiftCode || ""}
                    onChange={(e) => setEditingAccount({ ...editingAccount, swiftCode: e.target.value })}
                    placeholder="TGBATRIS"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label>Açıklama</Label>
                  <Textarea
                    value={editingAccount.description || ""}
                    onChange={(e) => setEditingAccount({ ...editingAccount, description: e.target.value })}
                    placeholder="Bu hesap hakkında ek bilgi..."
                    rows={2}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="editIsActive"
                    checked={editingAccount.isActive}
                    onCheckedChange={(checked) => setEditingAccount({ ...editingAccount, isActive: checked })}
                  />
                  <Label htmlFor="editIsActive">Aktif</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="editIsDefault"
                    checked={editingAccount.isDefault}
                    onCheckedChange={(checked) => setEditingAccount({ ...editingAccount, isDefault: checked })}
                  />
                  <Label htmlFor="editIsDefault">Varsayılan hesap</Label>
                </div>
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setEditingAccount(null)}>
                  İptal
                </Button>
                <Button type="submit" disabled={updateAccountMutation.isPending}>
                  {updateAccountMutation.isPending ? "Güncelleniyor..." : "Güncelle"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}