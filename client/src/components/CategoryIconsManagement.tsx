import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit3, Trash2, Eye, EyeOff, Move, Upload } from "lucide-react";
import type { CategoryIcon, InsertCategoryIcon } from "@shared/schema";
import { ObjectUploader } from "./ObjectUploader";

export default function CategoryIconsManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingIcon, setEditingIcon] = useState<CategoryIcon | null>(null);
  const [formData, setFormData] = useState<Partial<InsertCategoryIcon>>({
    name: "",
    icon: "",
    linkUrl: "",
    isActive: true,
    sortOrder: 0,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch category icons
  const { data: categoryIcons = [], isLoading } = useQuery<CategoryIcon[]>({
    queryKey: ["/api/admin/category-icons"],
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: InsertCategoryIcon) => {
      const response = await apiRequest("/api/admin/category-icons", "POST", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/category-icons"] });
      queryClient.invalidateQueries({ queryKey: ["/api/category-icons"] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Başarılı",
        description: "Kategori ikonu başarıyla oluşturuldu",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Kategori ikonu oluşturulurken hata oluştu",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertCategoryIcon> }) => {
      const response = await apiRequest(`/api/admin/category-icons/${id}`, "PUT", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/category-icons"] });
      queryClient.invalidateQueries({ queryKey: ["/api/category-icons"] });
      setEditingIcon(null);
      resetForm();
      toast({
        title: "Başarılı",
        description: "Kategori ikonu başarıyla güncellendi",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Kategori ikonu güncellenirken hata oluştu",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest(`/api/admin/category-icons/${id}`, "DELETE");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/category-icons"] });
      queryClient.invalidateQueries({ queryKey: ["/api/category-icons"] });
      toast({
        title: "Başarılı",
        description: "Kategori ikonu başarıyla silindi",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Kategori ikonu silinirken hata oluştu",
        variant: "destructive",
      });
    },
  });

  // Toggle active mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await apiRequest(`/api/admin/category-icons/${id}/toggle`, "PATCH", { isActive });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/category-icons"] });
      queryClient.invalidateQueries({ queryKey: ["/api/category-icons"] });
      toast({
        title: "Başarılı",
        description: "Kategori ikonu durumu güncellendi",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Kategori ikonu durumu güncellenirken hata oluştu",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      icon: "",
      linkUrl: "",
      isActive: true,
      sortOrder: 0,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.icon) {
      toast({
        title: "Hata",
        description: "İsim ve ikon alanları zorunludur",
        variant: "destructive",
      });
      return;
    }

    if (editingIcon) {
      updateMutation.mutate({ id: editingIcon.id, data: formData });
    } else {
      createMutation.mutate(formData as InsertCategoryIcon);
    }
  };

  const handleEdit = (icon: CategoryIcon) => {
    setEditingIcon(icon);
    setFormData({
      name: icon.name,
      icon: icon.icon,
      linkUrl: icon.linkUrl || "",
      isActive: icon.isActive,
      sortOrder: icon.sortOrder,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Bu kategori ikonunu silmek istediğinizden emin misiniz?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggle = (id: string, currentStatus: boolean) => {
    toggleMutation.mutate({ id, isActive: !currentStatus });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Kategori İkonları Yönetimi</h2>
          <p className="text-gray-600">Ana sayfada görüntülenen kategori ikonlarını yönetin</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-category-icon">
              <Plus className="w-4 h-4 mr-2" />
              Yeni İkon Ekle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Kategori İkonu</DialogTitle>
              <DialogDescription>
                Ana sayfada görüntülenecek yeni bir kategori ikonu oluşturun
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">İsim</Label>
                <Input
                  id="name"
                  data-testid="input-icon-name"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Kategori adı"
                  required
                />
              </div>
              <div>
                <Label htmlFor="icon">İkon Görseli</Label>
                <div className="mt-2">
                  <ObjectUploader
                    maxNumberOfFiles={1}
                    maxFileSize={2097152} // 2MB
                    onGetUploadParameters={async () => {
                      const response = await fetch("/api/objects/upload", {
                        method: "POST"
                      });
                      const data = await response.json();
                      return {
                        method: "PUT" as const,
                        url: data.uploadURL
                      };
                    }}
                    onComplete={(result: any) => {
                      if (result.successful.length > 0) {
                        const uploadURL = result.successful[0].uploadURL;
                        // Extract filename from URL and create public path
                        const url = new URL(uploadURL);
                        const pathParts = url.pathname.split('/');
                        const fileName = pathParts[pathParts.length - 1];
                        const objectPath = `/public-objects/category-icons/${fileName}`;
                        setFormData({ ...formData, icon: objectPath });
                        toast({
                          title: "Başarılı",
                          description: "Görsel başarıyla yüklendi",
                        });
                      }
                    }}
                    buttonClassName="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Görsel Yükle
                  </ObjectUploader>
                  <p className="text-xs text-gray-500 mt-1">
                    Önerilen boyutlar: 200x200px, maksimum 2MB (JPG, PNG)
                  </p>
                </div>
                {formData.icon && (
                  <div className="mt-3">
                    <img 
                      src={formData.icon} 
                      alt="Preview" 
                      className="w-16 h-16 object-cover bg-gray-100 rounded-lg border"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">Önizleme</p>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="linkUrl">Link URL</Label>
                <Input
                  id="linkUrl"
                  data-testid="input-link-url"
                  value={formData.linkUrl || ""}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  placeholder="/category/beyaz-esya"
                />
              </div>
              <div>
                <Label htmlFor="sortOrder">Sıralama</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  data-testid="input-sort-order"
                  value={formData.sortOrder || 0}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive ?? true}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  data-testid="switch-is-active"
                />
                <Label htmlFor="isActive">Aktif</Label>
              </div>
              <Button type="submit" className="w-full" data-testid="button-save-icon">
                Kaydet
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {categoryIcons.map((icon: CategoryIcon) => (
          <Card key={icon.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <img 
                      src={icon.icon} 
                      alt={icon.name}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = '<div class="w-6 h-6 bg-gray-300 rounded"></div>';
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold" data-testid={`text-icon-name-${icon.id}`}>
                      {icon.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {icon.linkUrl ? (
                        <span>Link: {icon.linkUrl}</span>
                      ) : (
                        <span className="text-gray-400">Link yok</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      Sıralama: {icon.sortOrder}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant={icon.isActive ? "default" : "secondary"}>
                    {icon.isActive ? "Aktif" : "Pasif"}
                  </Badge>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggle(icon.id, icon.isActive ?? true)}
                    data-testid={`button-toggle-${icon.id}`}
                  >
                    {icon.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(icon)}
                    data-testid={`button-edit-${icon.id}`}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(icon.id)}
                    className="text-red-600 hover:text-red-700"
                    data-testid={`button-delete-${icon.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {categoryIcons.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Henüz kategori ikonu eklenmemiş</p>
              <p className="text-sm text-gray-400 mt-2">
                Yeni bir kategori ikonu eklemek için yukarıdaki butonu kullanın
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingIcon} onOpenChange={() => setEditingIcon(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kategori İkonunu Düzenle</DialogTitle>
            <DialogDescription>
              Kategori ikonu bilgilerini güncelleyin
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!formData.name || !formData.icon) {
              toast({
                title: "Hata",
                description: "İsim ve ikon alanları zorunludur",
                variant: "destructive",
              });
              return;
            }
            if (editingIcon) {
              updateMutation.mutate({ id: editingIcon.id, data: formData });
            }
          }} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">İsim</Label>
              <Input
                id="edit-name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Kategori adı"
                required
              />
            </div>
            <div>
              <Label>İkon Görseli</Label>
              <p className="text-sm text-gray-500 mb-2">
                Önerilen boyut: 200x200px, maksimum 2MB (JPG, PNG)
              </p>
              <ObjectUploader
                maxNumberOfFiles={1}
                maxFileSize={2097152} // 2MB
                onGetUploadParameters={async () => {
                  const response = await fetch("/api/objects/upload", {
                    method: "POST"
                  });
                  const data = await response.json();
                  return {
                    method: "PUT" as const,
                    url: data.uploadURL
                  };
                }}
                onComplete={(result: any) => {
                  if (result.successful.length > 0) {
                    const uploadURL = result.successful[0].uploadURL;
                    // Extract filename from URL and create public path
                    const url = new URL(uploadURL);
                    const pathParts = url.pathname.split('/');
                    const fileName = pathParts[pathParts.length - 1];
                    const objectPath = `/public-objects/category-icons/${fileName}`;
                    setFormData({ ...formData, icon: objectPath });
                    toast({
                      title: "Başarılı",
                      description: "Görsel başarıyla yüklendi",
                    });
                  }
                }}
                buttonClassName="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Yeni Görsel Yükle
              </ObjectUploader>
              
              {formData.icon && (
                <div className="mt-2">
                  <img 
                    src={formData.icon} 
                    alt="Mevcut görsel"
                    className="w-20 h-20 object-cover rounded border"
                  />
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="edit-linkUrl">Link URL</Label>
              <Input
                id="edit-linkUrl"
                value={formData.linkUrl || ""}
                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                placeholder="/category/beyaz-esya"
              />
            </div>
            <div>
              <Label htmlFor="edit-sortOrder">Sıralama</Label>
              <Input
                id="edit-sortOrder"
                type="number"
                value={formData.sortOrder || 0}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isActive"
                checked={formData.isActive ?? true}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="edit-isActive">Aktif</Label>
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={updateMutation.isPending}
              data-testid="button-update-icon"
            >
              {updateMutation.isPending ? "Güncelleniyor..." : "Güncelle"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}