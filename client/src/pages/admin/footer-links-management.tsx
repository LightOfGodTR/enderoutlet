import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Plus, Trash2, Link as LinkIcon, Save, ArrowUp, ArrowDown } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FooterLink {
  id: string;
  sectionTitle: string;
  linkText: string;
  linkUrl: string;
  isActive: boolean;
  sortOrder: number;
  sectionOrder: number;
  createdAt: string;
  updatedAt: string;
}

const sectionOptions = [
  { value: "Ürünler", label: "Ürünler" },
  { value: "Destek", label: "Destek" },
  { value: "İletişim", label: "İletişim" },
  { value: "Yasal Belgeler", label: "Yasal Belgeler" },
  { value: "Kurumsal", label: "Kurumsal" },
  { value: "Hakkımızda", label: "Hakkımızda" }
];

export default function FooterLinksManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [editingLink, setEditingLink] = useState<FooterLink | null>(null);
  const [showNewLinkDialog, setShowNewLinkDialog] = useState(false);
  const [newLinkData, setNewLinkData] = useState({
    sectionTitle: "Ürünler",
    linkText: "",
    linkUrl: "",
    isActive: true,
    sortOrder: 0,
    sectionOrder: 0
  });

  const { data: footerLinks = [], isLoading } = useQuery<FooterLink[]>({
    queryKey: ["/api/admin/footer-links"],
  });

  const updateLinkMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      return await apiRequest(`/api/admin/footer-links/${id}`, "PUT", updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/footer-links"] });
      setEditingLink(null);
      toast({
        title: "Başarılı",
        description: "Footer linki başarıyla güncellendi.",
      });
    },
    onError: (error) => {
      console.error("Error updating footer link:", error);
      toast({
        title: "Hata",
        description: "Footer linki güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const createLinkMutation = useMutation({
    mutationFn: async (linkData: any) => {
      return await apiRequest("/api/admin/footer-links", "POST", linkData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/footer-links"] });
      setShowNewLinkDialog(false);
      setNewLinkData({
        sectionTitle: "Ürünler",
        linkText: "",
        linkUrl: "",
        isActive: true,
        sortOrder: 0,
        sectionOrder: 0
      });
      toast({
        title: "Başarılı",
        description: "Yeni footer linki başarıyla oluşturuldu.",
      });
    },
    onError: (error) => {
      console.error("Error creating footer link:", error);
      toast({
        title: "Hata",
        description: "Footer linki oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/footer-links/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/footer-links"] });
      toast({
        title: "Başarılı",
        description: "Footer linki başarıyla silindi.",
      });
    },
    onError: (error) => {
      console.error("Error deleting footer link:", error);
      toast({
        title: "Hata",
        description: "Footer linki silinirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleSaveEdit = () => {
    if (editingLink) {
      updateLinkMutation.mutate({
        id: editingLink.id,
        updates: {
          sectionTitle: editingLink.sectionTitle,
          linkText: editingLink.linkText,
          linkUrl: editingLink.linkUrl,
          isActive: editingLink.isActive,
          sortOrder: editingLink.sortOrder,
          sectionOrder: editingLink.sectionOrder
        }
      });
    }
  };

  const handleCreateLink = () => {
    if (newLinkData.linkText && newLinkData.linkUrl) {
      createLinkMutation.mutate(newLinkData);
    }
  };

  // Group links by section
  const groupedLinks = footerLinks.reduce((acc, link) => {
    if (!acc[link.sectionTitle]) {
      acc[link.sectionTitle] = [];
    }
    acc[link.sectionTitle].push(link);
    return acc;
  }, {} as Record<string, FooterLink[]>);

  // Sort each section by sortOrder
  Object.keys(groupedLinks).forEach(section => {
    groupedLinks[section].sort((a, b) => a.sortOrder - b.sortOrder);
  });

  if (isLoading) {
    return <div className="p-8">Yükleniyor...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Footer Links Yönetimi</h1>
          <p className="text-gray-600 mt-2">Footer bölümündeki linkleri yönetin</p>
        </div>
        
        <Dialog open={showNewLinkDialog} onOpenChange={setShowNewLinkDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" data-testid="button-add-footer-link">
              <Plus className="h-4 w-4" />
              Yeni Link Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Yeni Footer Linki Ekle</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="section-title">Bölüm</Label>
                <Select 
                  value={newLinkData.sectionTitle} 
                  onValueChange={(value) => setNewLinkData({...newLinkData, sectionTitle: value})}
                >
                  <SelectTrigger data-testid="select-new-section">
                    <SelectValue placeholder="Bölüm seçin" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]" style={{ zIndex: 9999 }}>
                    {sectionOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="link-text">Link Metni</Label>
                <Input
                  id="link-text"
                  value={newLinkData.linkText}
                  onChange={(e) => setNewLinkData({...newLinkData, linkText: e.target.value})}
                  placeholder="Örn: Hakkımızda"
                  data-testid="input-link-text"
                />
              </div>
              
              <div>
                <Label htmlFor="link-url">Link URL'i</Label>
                <Input
                  id="link-url"
                  value={newLinkData.linkUrl}
                  onChange={(e) => setNewLinkData({...newLinkData, linkUrl: e.target.value})}
                  placeholder="Örn: /hakkimizda veya https://..."
                  data-testid="input-link-url"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sort-order">Sıralama</Label>
                  <Input
                    id="sort-order"
                    type="number"
                    value={newLinkData.sortOrder}
                    onChange={(e) => setNewLinkData({...newLinkData, sortOrder: parseInt(e.target.value) || 0})}
                    data-testid="input-sort-order"
                  />
                </div>
                
                <div>
                  <Label htmlFor="section-order">Bölüm Sırası</Label>
                  <Input
                    id="section-order"
                    type="number"
                    value={newLinkData.sectionOrder}
                    onChange={(e) => setNewLinkData({...newLinkData, sectionOrder: parseInt(e.target.value) || 0})}
                    data-testid="input-section-order"
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleCreateLink} 
                className="w-full"
                disabled={!newLinkData.linkText || !newLinkData.linkUrl || createLinkMutation.isPending}
                data-testid="button-save-new-link"
              >
                {createLinkMutation.isPending ? "Kaydediliyor..." : "Link Ekle"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {Object.keys(groupedLinks).length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <LinkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz footer linki yok</h3>
            <p className="text-gray-500 mb-4">İlk footer linkinizi eklemek için yukarıdaki butona tıklayın.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {Object.entries(groupedLinks)
            .sort(([,a], [,b]) => (a[0]?.sectionOrder || 0) - (b[0]?.sectionOrder || 0))
            .map(([sectionTitle, links]) => (
            <Card key={sectionTitle}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5" />
                  {sectionTitle}
                  <Badge variant="secondary">{links.length} link</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {links.map((link) => (
                    <div key={link.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium" data-testid={`text-link-${link.id}`}>
                            {link.linkText}
                          </span>
                          <Badge variant={link.isActive ? "default" : "secondary"}>
                            {link.isActive ? "Aktif" : "Pasif"}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500">
                          URL: {link.linkUrl}
                        </div>
                        <div className="text-xs text-gray-400">
                          Sıra: {link.sortOrder} | Bölüm Sırası: {link.sectionOrder}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingLink(link)}
                          data-testid={`button-edit-${link.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteLinkMutation.mutate(link.id)}
                          className="text-red-600 hover:text-red-700"
                          data-testid={`button-delete-${link.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      {editingLink && (
        <Dialog open={!!editingLink} onOpenChange={() => setEditingLink(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Footer Linki Düzenle</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-section-title">Bölüm</Label>
                <Select 
                  value={editingLink.sectionTitle} 
                  onValueChange={(value) => setEditingLink({...editingLink, sectionTitle: value})}
                >
                  <SelectTrigger data-testid="select-edit-section">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]" style={{ zIndex: 9999 }}>
                    {sectionOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-link-text">Link Metni</Label>
                <Input
                  id="edit-link-text"
                  value={editingLink.linkText}
                  onChange={(e) => setEditingLink({...editingLink, linkText: e.target.value})}
                  data-testid="input-edit-link-text"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-link-url">Link URL'i</Label>
                <Input
                  id="edit-link-url"
                  value={editingLink.linkUrl}
                  onChange={(e) => setEditingLink({...editingLink, linkUrl: e.target.value})}
                  data-testid="input-edit-link-url"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-sort-order">Sıralama</Label>
                  <Input
                    id="edit-sort-order"
                    type="number"
                    value={editingLink.sortOrder}
                    onChange={(e) => setEditingLink({...editingLink, sortOrder: parseInt(e.target.value) || 0})}
                    data-testid="input-edit-sort-order"
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-section-order">Bölüm Sırası</Label>
                  <Input
                    id="edit-section-order"
                    type="number"
                    value={editingLink.sectionOrder}
                    onChange={(e) => setEditingLink({...editingLink, sectionOrder: parseInt(e.target.value) || 0})}
                    data-testid="input-edit-section-order"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-is-active"
                  checked={editingLink.isActive}
                  onChange={(e) => setEditingLink({...editingLink, isActive: e.target.checked})}
                  className="rounded"
                  data-testid="checkbox-edit-active"
                />
                <Label htmlFor="edit-is-active">Aktif</Label>
              </div>
              
              <Button 
                onClick={handleSaveEdit} 
                className="w-full"
                disabled={updateLinkMutation.isPending}
                data-testid="button-save-edit"
              >
                <Save className="h-4 w-4 mr-2" />
                {updateLinkMutation.isPending ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}