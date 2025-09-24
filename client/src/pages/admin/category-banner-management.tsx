import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Upload, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { CategoryBanner } from "@shared/schema";

interface CategoryBannerFormData {
  categoryName: string;
  title: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
}

export default function CategoryBannerManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingBanner, setEditingBanner] = useState<CategoryBanner | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CategoryBannerFormData>({
    categoryName: "",
    title: "",
    description: "",
    imageUrl: "",
    isActive: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch category banners
  const { data: banners = [], isLoading } = useQuery<CategoryBanner[]>({
    queryKey: ["/api/category-banners"],
  });

  // Add banner mutation
  const addBannerMutation = useMutation({
    mutationFn: async (data: Omit<CategoryBanner, "id" | "createdAt" | "updatedAt">) => {
      const response = await fetch("/api/category-banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to add banner");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/category-banners"] });
      setIsAddDialogOpen(false);
      resetForm();
      toast({
        title: "Başarılı",
        description: "Kategori banner'ı başarıyla eklendi.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Banner eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Update banner mutation
  const updateBannerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CategoryBanner> }) => {
      const response = await fetch(`/api/category-banners/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update banner");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/category-banners"] });
      setIsEditDialogOpen(false);
      setEditingBanner(null);
      resetForm();
      toast({
        title: "Başarılı",
        description: "Kategori banner'ı başarıyla güncellendi.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Banner güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Delete banner mutation
  const deleteBannerMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/category-banners/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete banner");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/category-banners"] });
      toast({
        title: "Başarılı",
        description: "Kategori banner'ı başarıyla silindi.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Banner silinirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Handle image upload
  const handleImageUpload = async () => {
    if (!imageFile) return;

    setIsUploading(true);
    const formDataForUpload = new FormData();
    formDataForUpload.append("file", imageFile);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataForUpload,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      setFormData(prev => ({ ...prev, imageUrl: result.url }));
      setImageFile(null);
      toast({
        title: "Başarılı",
        description: "Resim başarıyla yüklendi.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Resim yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      categoryName: "",
      title: "",
      description: "",
      imageUrl: "",
      isActive: true,
    });
    setImageFile(null);
  };

  const handleEdit = (banner: CategoryBanner) => {
    setEditingBanner(banner);
    setFormData({
      categoryName: banner.categoryName,
      title: banner.title,
      description: banner.description || "",
      imageUrl: banner.imageUrl,
      isActive: banner.isActive ?? true,
    });
    setIsEditDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.categoryName || !formData.title || !formData.imageUrl) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen kategori adı, başlık ve resim alanlarını doldurun.",
        variant: "destructive",
      });
      return;
    }

    if (editingBanner) {
      updateBannerMutation.mutate({
        id: editingBanner.id,
        data: formData,
      });
    } else {
      addBannerMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kategori Banner Yönetimi</h1>
          <p className="text-gray-600 mt-2">
            Kategori sayfalarında gösterilecek hero banner'ları yönetin
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-banner">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Banner Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Yeni Kategori Banner Ekle</DialogTitle>
            </DialogHeader>
            <BannerForm
              formData={formData}
              setFormData={setFormData}
              imageFile={imageFile}
              setImageFile={setImageFile}
              isUploading={isUploading}
              onImageUpload={handleImageUpload}
              onSubmit={handleSubmit}
              isLoading={addBannerMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {banners.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Henüz kategori banner'ı yok
          </h3>
          <p className="text-gray-600 mb-6">
            İlk kategori banner'ınızı ekleyerek başlayın.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Önizleme</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Başlık</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((banner) => (
                <TableRow key={banner.id} data-testid={`row-banner-${banner.id}`}>
                  <TableCell>
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="w-16 h-10 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {banner.categoryName}
                  </TableCell>
                  <TableCell>{banner.title}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {banner.description || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={banner.isActive ? "default" : "secondary"}
                      data-testid={`status-${banner.id}`}
                    >
                      {banner.isActive ? "Aktif" : "Pasif"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(banner)}
                        data-testid={`button-edit-${banner.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteBannerMutation.mutate(banner.id)}
                        disabled={deleteBannerMutation.isPending}
                        data-testid={`button-delete-${banner.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Kategori Banner Düzenle</DialogTitle>
          </DialogHeader>
          <BannerForm
            formData={formData}
            setFormData={setFormData}
            imageFile={imageFile}
            setImageFile={setImageFile}
            isUploading={isUploading}
            onImageUpload={handleImageUpload}
            onSubmit={handleSubmit}
            isLoading={updateBannerMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface BannerFormProps {
  formData: CategoryBannerFormData;
  setFormData: React.Dispatch<React.SetStateAction<CategoryBannerFormData>>;
  imageFile: File | null;
  setImageFile: React.Dispatch<React.SetStateAction<File | null>>;
  isUploading: boolean;
  onImageUpload: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

function BannerForm({
  formData,
  setFormData,
  imageFile,
  setImageFile,
  isUploading,
  onImageUpload,
  onSubmit,
  isLoading,
}: BannerFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="categoryName">Kategori Seçin *</Label>
        <Select
          value={formData.categoryName}
          onValueChange={(value) => setFormData(prev => ({ ...prev, categoryName: value }))}
        >
          <SelectTrigger data-testid="select-category-name">
            <SelectValue placeholder="Kategori seçin..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Beyaz Eşya">Beyaz Eşya</SelectItem>
            <SelectItem value="Ankastre">Ankastre</SelectItem>
            <SelectItem value="Televizyon">Televizyon</SelectItem>
            <SelectItem value="Elektronik">Elektronik</SelectItem>
            <SelectItem value="Isıtma Soğutma">Isıtma Soğutma</SelectItem>
            <SelectItem value="Küçük Ev Aletleri">Küçük Ev Aletleri</SelectItem>
            <SelectItem value="Buzdolabı">Buzdolabı</SelectItem>
            <SelectItem value="Çamaşır Makinesi">Çamaşır Makinesi</SelectItem>
            <SelectItem value="Bulaşık Makinesi">Bulaşık Makinesi</SelectItem>
            <SelectItem value="Klima">Klima</SelectItem>
            <SelectItem value="Mikrodalga">Mikrodalga</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="title">Banner Başlığı *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Banner üzerinde gösterilecek başlık"
          data-testid="input-title"
        />
      </div>

      <div>
        <Label htmlFor="description">Açıklama</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Banner açıklaması (opsiyonel)"
          rows={3}
          data-testid="input-description"
        />
      </div>

      <div>
        <Label>Banner Resmi *</Label>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="flex-1"
              data-testid="input-image-file"
            />
            <Button
              onClick={onImageUpload}
              disabled={!imageFile || isUploading}
              data-testid="button-upload-image"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? "Yükleniyor..." : "Yükle"}
            </Button>
          </div>
          {formData.imageUrl && (
            <div className="border rounded p-3">
              <p className="text-sm text-gray-600 mb-2">Önizleme:</p>
              <img
                src={formData.imageUrl}
                alt="Banner önizleme"
                className="w-full h-32 object-cover rounded"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
          data-testid="switch-active"
        />
        <Label htmlFor="isActive">Aktif</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          onClick={onSubmit}
          disabled={isLoading}
          data-testid="button-save"
        >
          {isLoading ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </div>
    </div>
  );
}