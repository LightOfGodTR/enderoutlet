import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PopularSearch {
  id: string;
  keyword: string;
  redirectUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function PopularSearchesManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSearch, setEditingSearch] = useState<PopularSearch | null>(null);
  const [formData, setFormData] = useState({
    keyword: "",
    redirectUrl: "",
    displayOrder: 0,
    isActive: true,
  });

  // Fetch popular searches
  const { data: searches = [], isLoading } = useQuery<PopularSearch[]>({
    queryKey: ["/api/popular-searches"],
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest("/api/popular-searches", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/popular-searches"] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Başarılı",
        description: "Popüler arama başarıyla eklendi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Popüler arama eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & any) =>
      apiRequest(`/api/popular-searches/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/popular-searches"] });
      setEditingSearch(null);
      resetForm();
      toast({
        title: "Başarılı",
        description: "Popüler arama başarıyla güncellendi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Popüler arama güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/popular-searches/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/popular-searches"] });
      toast({
        title: "Başarılı",
        description: "Popüler arama başarıyla silindi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Popüler arama silinirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      keyword: "",
      redirectUrl: "",
      displayOrder: 0,
      isActive: true,
    });
  };

  const handleEdit = (search: PopularSearch) => {
    setEditingSearch(search);
    setFormData({
      keyword: search.keyword,
      redirectUrl: search.redirectUrl || "",
      displayOrder: search.displayOrder,
      isActive: search.isActive,
    });
  };

  const handleSubmit = () => {
    if (!formData.keyword.trim()) {
      toast({
        title: "Hata",
        description: "Anahtar kelime gereklidir.",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      ...formData,
      redirectUrl: formData.redirectUrl.trim() || null,
    };

    if (editingSearch) {
      updateMutation.mutate({ id: editingSearch.id, ...submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Bu popüler aramayı silmek istediğinizden emin misiniz?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Search className="h-8 w-8 text-primary" />
            Popüler Aramalar
          </h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Search className="h-8 w-8 text-primary" />
          Popüler Aramalar
        </h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm();
                setEditingSearch(null);
              }}
              data-testid="button-add-popular-search"
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Popüler Arama
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingSearch ? "Popüler Aramayı Düzenle" : "Yeni Popüler Arama"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="keyword">Anahtar Kelime *</Label>
                <Input
                  id="keyword"
                  value={formData.keyword}
                  onChange={(e) =>
                    setFormData({ ...formData, keyword: e.target.value })
                  }
                  placeholder="Örn: Buzdolabı"
                  data-testid="input-keyword"
                />
              </div>
              <div>
                <Label htmlFor="redirectUrl">Yönlendirme URL (Opsiyonel)</Label>
                <Input
                  id="redirectUrl"
                  value={formData.redirectUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, redirectUrl: e.target.value })
                  }
                  placeholder="Örn: /category/beyaz-esya"
                  data-testid="input-redirect-url"
                />
              </div>
              <div>
                <Label htmlFor="displayOrder">Sıralama</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, displayOrder: Number(e.target.value) })
                  }
                  placeholder="0"
                  data-testid="input-display-order"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                  data-testid="switch-is-active"
                />
                <Label htmlFor="isActive">Aktif</Label>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setEditingSearch(null);
                    resetForm();
                  }}
                >
                  İptal
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                  data-testid="button-submit-popular-search"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Kaydediliyor..."
                    : editingSearch
                    ? "Güncelle"
                    : "Ekle"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {searches.length === 0 ? (
        <div className="text-center py-12">
          <Search className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Henüz popüler arama yok
          </h3>
          <p className="text-gray-600 mb-6">
            İlk popüler aramayı ekleyerek başlayın.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Anahtar Kelime</TableHead>
                <TableHead>Yönlendirme URL</TableHead>
                <TableHead>Sıralama</TableHead>
                <TableHead>Tıklanma</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {searches
                .sort((a, b) => b.displayOrder - a.displayOrder)
                .map((search) => (
                  <TableRow key={search.id} data-testid={`row-search-${search.id}`}>
                    <TableCell className="font-medium">
                      {search.keyword}
                    </TableCell>
                    <TableCell>
                      {search.redirectUrl ? (
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {search.redirectUrl}
                        </code>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>{search.displayOrder}</TableCell>
                    <TableCell>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {search.clickCount}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          search.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {search.isActive ? "Aktif" : "Pasif"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleEdit(search);
                            setIsCreateDialogOpen(true);
                          }}
                          data-testid={`button-edit-${search.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(search.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-${search.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}