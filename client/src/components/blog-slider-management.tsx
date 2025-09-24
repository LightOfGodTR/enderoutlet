import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus,
  Trash2,
  Edit3,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Save,
  X,
  ExternalLink
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { UniversalImageUploader, IMAGE_SPECS } from "@/components/UniversalImageUploader";

interface BlogSlider {
  id: string;
  blogPostId?: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  tagText: string;
  tagColor: string;
  overlayOpacity: number;
  isActive: boolean;
  order: number;
}

const tagColors = [
  { value: 'red', label: 'Kırmızı', color: 'bg-red-500' },
  { value: 'orange', label: 'Turuncu', color: 'bg-orange-500' },
  { value: 'yellow', label: 'Sarı', color: 'bg-yellow-500' },
  { value: 'green', label: 'Yeşil', color: 'bg-green-500' },
  { value: 'blue', label: 'Mavi', color: 'bg-blue-500' },
  { value: 'indigo', label: 'İndigo', color: 'bg-indigo-500' },
  { value: 'purple', label: 'Mor', color: 'bg-purple-500' },
  { value: 'pink', label: 'Pembe', color: 'bg-pink-500' },
];

export default function BlogSliderManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingSlider, setEditingSlider] = useState<BlogSlider | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewSlider, setPreviewSlider] = useState<BlogSlider | null>(null);

  // Fetch blog sliders
  const { data: blogSliders = [], isLoading } = useQuery<BlogSlider[]>({
    queryKey: ["/api/admin/blog-sliders"],
  });

  // Fetch blog posts for selection
  const { data: blogPosts = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/blog-posts"],
  });

  // Create slider mutation
  const createSliderMutation = useMutation({
    mutationFn: async (sliderData: Omit<BlogSlider, 'id'>) => {
      return await apiRequest("/api/admin/blog-sliders", "POST", sliderData);
    },
    onSuccess: () => {
      toast({ title: "Başarılı!", description: "Blog slider oluşturuldu" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog-sliders"] });
      setIsAddDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Hata", description: "Blog slider oluşturulamadı", variant: "destructive" });
    },
  });

  // Update slider mutation
  const updateSliderMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BlogSlider> & { id: string }) => {
      return await apiRequest(`/api/admin/blog-sliders/${id}`, "PUT", updates);
    },
    onSuccess: () => {
      toast({ title: "Başarılı!", description: "Blog slider güncellendi" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog-sliders"] });
      setEditingSlider(null);
    },
    onError: () => {
      toast({ title: "Hata", description: "Blog slider güncellenemedi", variant: "destructive" });
    },
  });

  // Delete slider mutation
  const deleteSliderMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/blog-sliders/${id}`, "DELETE");
    },
    onSuccess: () => {
      toast({ title: "Başarılı!", description: "Blog slider silindi" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog-sliders"] });
    },
    onError: () => {
      toast({ title: "Hata", description: "Blog slider silinemedi", variant: "destructive" });
    },
  });

  // Toggle slider mutation
  const toggleSliderMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return await apiRequest(`/api/admin/blog-sliders/${id}/toggle`, "PUT", { isActive });
    },
    onSuccess: () => {
      toast({ 
        title: "Başarılı!", 
        description: `Blog slider ${!blogSliders.find(s => s.id === arguments[0])?.isActive ? 'aktifleştirildi' : 'deaktifleştirildi'}` 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog-sliders"] });
    },
    onError: () => {
      toast({ title: "Hata", description: "Blog slider durumu değiştirilemedi", variant: "destructive" });
    },
  });

  const handlePreview = (slider: BlogSlider) => {
    setPreviewSlider(slider);
    setIsPreviewOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Blog Slider Yönetimi</h2>
          <p className="text-gray-600 mt-1">Blog sayfası için hero slider ayarları</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-blog-slider">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Blog Slider
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yeni Blog Slider Ekle</DialogTitle>
              <DialogDescription>
                Blog sayfasında gösterilecek slider için bilgileri girin
              </DialogDescription>
            </DialogHeader>
            <BlogSliderForm
              onSubmit={(data) => createSliderMutation.mutate(data)}
              isLoading={createSliderMutation.isPending}
              blogPosts={blogPosts}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : blogSliders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ImageIcon className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Henüz blog slider yok
              </h3>
              <p className="text-gray-500 text-center mb-6">
                İlk blog slider'ınızı oluşturarak başlayın
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                İlk Slider'ı Ekle
              </Button>
            </CardContent>
          </Card>
        ) : (
          blogSliders
            .sort((a, b) => a.order - b.order)
            .map((slider) => (
              <Card key={slider.id} data-testid={`card-blog-slider-${slider.id}`}>
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Slider Image */}
                    <div className="relative w-48 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={slider.image}
                        alt={slider.title}
                        className="w-full h-full object-cover"
                      />
                      <div 
                        className="absolute inset-0 bg-black/40"
                        style={{ backgroundColor: `rgba(0, 0, 0, ${slider.overlayOpacity / 100})` }}
                      />
                      <div className="absolute top-2 left-2">
                        <Badge 
                          className={`${tagColors.find(c => c.value === slider.tagColor)?.color} text-white`}
                        >
                          {slider.tagText}
                        </Badge>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="text-white text-sm font-medium truncate">
                          {slider.title}
                        </div>
                        {slider.subtitle && (
                          <div className="text-white/80 text-xs truncate">
                            {slider.subtitle}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Slider Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{slider.title}</h3>
                          {slider.subtitle && (
                            <p className="text-sm text-gray-600">{slider.subtitle}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={slider.isActive ? "default" : "secondary"}>
                            {slider.isActive ? "Aktif" : "Pasif"}
                          </Badge>
                          <Badge variant="outline">Sıra: {slider.order}</Badge>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div><strong>Etiket:</strong> {slider.tagText}</div>
                        <div><strong>Buton:</strong> {slider.buttonText}</div>
                        {slider.buttonLink && (
                          <div className="flex items-center gap-2">
                            <strong>Link:</strong> 
                            <a 
                              href={slider.buttonLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              {slider.buttonLink}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                        <div><strong>Karartı:</strong> {slider.overlayOpacity}%</div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePreview(slider)}
                        data-testid={`button-preview-${slider.id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingSlider(slider)}
                        data-testid={`button-edit-${slider.id}`}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => 
                          toggleSliderMutation.mutate({ 
                            id: slider.id, 
                            isActive: !slider.isActive 
                          })
                        }
                        data-testid={`button-toggle-${slider.id}`}
                      >
                        {slider.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteSliderMutation.mutate(slider.id)}
                        data-testid={`button-delete-${slider.id}`}
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

      {/* Edit Dialog */}
      {editingSlider && (
        <Dialog open={!!editingSlider} onOpenChange={() => setEditingSlider(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Blog Slider Düzenle</DialogTitle>
              <DialogDescription>
                Blog slider bilgilerini güncelleyin
              </DialogDescription>
            </DialogHeader>
            <BlogSliderForm
              initialData={editingSlider}
              onSubmit={(data) => updateSliderMutation.mutate({ ...data, id: editingSlider.id })}
              isLoading={updateSliderMutation.isPending}
              blogPosts={blogPosts}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Preview Dialog */}
      {previewSlider && (
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Slider Önizleme</DialogTitle>
            </DialogHeader>
            <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={previewSlider.image}
                alt={previewSlider.title}
                className="w-full h-full object-cover"
              />
              <div 
                className="absolute inset-0 bg-black"
                style={{ backgroundColor: `rgba(0, 0, 0, ${previewSlider.overlayOpacity / 100})` }}
              />
              <div className="absolute top-6 left-6">
                <Badge 
                  className={`${tagColors.find(c => c.value === previewSlider.tagColor)?.color} text-white text-sm px-3 py-1`}
                >
                  {previewSlider.tagText}
                </Badge>
              </div>
              <div className="absolute bottom-6 left-6 right-6">
                <h1 className="text-white text-3xl font-bold mb-2">
                  {previewSlider.title}
                </h1>
                {previewSlider.subtitle && (
                  <p className="text-white/90 text-lg mb-4">
                    {previewSlider.subtitle}
                  </p>
                )}
                {previewSlider.description && (
                  <p className="text-white/80 text-sm mb-6 max-w-2xl">
                    {previewSlider.description}
                  </p>
                )}
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  {previewSlider.buttonText}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Blog Slider Form Component
function BlogSliderForm({ 
  initialData, 
  onSubmit, 
  isLoading, 
  blogPosts 
}: {
  initialData?: BlogSlider;
  onSubmit: (data: Omit<BlogSlider, 'id'>) => void;
  isLoading: boolean;
  blogPosts: any[];
}) {
  const [formData, setFormData] = useState({
    blogPostId: initialData?.blogPostId || 'none',
    title: initialData?.title || '',
    subtitle: initialData?.subtitle || '',
    description: initialData?.description || '',
    image: initialData?.image || '',
    buttonText: initialData?.buttonText || 'Devamı',
    buttonLink: initialData?.buttonLink || '',
    tagText: initialData?.tagText || 'Ürün İnceleme',
    tagColor: initialData?.tagColor || 'red',
    overlayOpacity: initialData?.overlayOpacity || 40,
    isActive: initialData?.isActive ?? true,
    order: initialData?.order || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.image) {
      return;
    }
    
    // Convert "none" back to empty string for blogPostId
    const submitData = {
      ...formData,
      blogPostId: formData.blogPostId === 'none' ? '' : formData.blogPostId
    };
    
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList>
          <TabsTrigger value="basic">Temel Bilgiler</TabsTrigger>
          <TabsTrigger value="design">Tasarım</TabsTrigger>
          <TabsTrigger value="settings">Ayarlar</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="title">Başlık *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Slider başlığı"
                data-testid="input-title"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="subtitle">Alt Başlık</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Slider alt başlığı"
                data-testid="input-subtitle"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Slider açıklaması"
                data-testid="input-description"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="design" className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label>Slider Görseli *</Label>
              <UniversalImageUploader
                label="Blog Slider Görseli"
                currentImage={formData.image}
                onImageUpdate={(url) => setFormData({ ...formData, image: url })}
                uploadEndpoint="/api/admin/slider-upload-image"
                imageSpecs={IMAGE_SPECS.BLOG_SLIDER}
                showUrlInput={true}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tagText">Etiket Metni</Label>
                <Input
                  id="tagText"
                  value={formData.tagText}
                  onChange={(e) => setFormData({ ...formData, tagText: e.target.value })}
                  placeholder="Ürün İnceleme"
                  data-testid="input-tag-text"
                />
              </div>
              
              <div>
                <Label htmlFor="tagColor">Etiket Rengi</Label>
                <Select 
                  value={formData.tagColor} 
                  onValueChange={(value) => setFormData({ ...formData, tagColor: value })}
                >
                  <SelectTrigger data-testid="select-tag-color">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[100] bg-white shadow-lg">
                    {tagColors.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${color.color}`} />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="overlayOpacity">Karartı Yoğunluğu (%)</Label>
              <Input
                id="overlayOpacity"
                type="number"
                min="0"
                max="100"
                value={formData.overlayOpacity}
                onChange={(e) => setFormData({ ...formData, overlayOpacity: Number(e.target.value) })}
                data-testid="input-overlay-opacity"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="buttonText">Buton Metni</Label>
              <Input
                id="buttonText"
                value={formData.buttonText}
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                placeholder="Devamı"
                data-testid="input-button-text"
              />
            </div>
            
            <div>
              <Label htmlFor="buttonLink">Buton Linki</Label>
              <Input
                id="buttonLink"
                value={formData.buttonLink}
                onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                placeholder="/blog/makale-slug"
                data-testid="input-button-link"
              />
            </div>

            <div>
              <Label htmlFor="blogPost">İlgili Blog Yazısı (Opsiyonel)</Label>
              <Select 
                value={formData.blogPostId} 
                onValueChange={(value) => setFormData({ ...formData, blogPostId: value })}
              >
                <SelectTrigger data-testid="select-blog-post">
                  <SelectValue placeholder="Blog yazısı seç" />
                </SelectTrigger>
                <SelectContent className="z-[100] bg-white shadow-lg">
                  <SelectItem value="none">Seçilmedi</SelectItem>
                  {blogPosts.map((post) => (
                    <SelectItem key={post.id} value={post.id}>
                      {post.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="order">Sıralama</Label>
                <Input
                  id="order"
                  type="number"
                  min="0"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                  data-testid="input-order"
                />
              </div>
              
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  data-testid="input-is-active"
                />
                <Label htmlFor="isActive">Aktif</Label>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isLoading || !formData.title || !formData.image}>
          {isLoading ? (
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {initialData ? 'Güncelle' : 'Kaydet'}
        </Button>
      </div>
    </form>
  );
}