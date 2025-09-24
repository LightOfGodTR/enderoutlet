import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Eye, Image as ImageIcon, ArrowRight, Save, Upload, Plus, Trash2, Link as LinkIcon } from "lucide-react";
import sliderExample1 from "@assets/image_1756301048596.png";
import sliderExample2 from "@assets/image_1756301060285.png";
import { apiRequest } from "@/lib/queryClient";
import { ObjectUploader } from "@/components/ObjectUploader";

interface SliderItem {
  id: string;
  title: string;
  subtitle: string;
  buttonText: string;
  link: string;
  image: string;
  showText: boolean;
  backgroundColor: string;
  isActive: boolean;
  order: number;
}

export default function SliderManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [editingSlider, setEditingSlider] = useState<SliderItem | null>(null);
  const [showNewSliderDialog, setShowNewSliderDialog] = useState(false);
  const [newSliderData, setNewSliderData] = useState({
    link: "",
    image: "/public-objects/uploads/placeholder-1200x500.jpg",
    isActive: true,
    order: 1
  });

  const { data: sliders = [], isLoading } = useQuery<SliderItem[]>({
    queryKey: ["/api/admin/sliders"],
  });

  const updateSliderMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      return await apiRequest(`/api/admin/sliders/${id}`, "PUT", updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sliders"] });
      setEditingSlider(null);
      toast({
        title: "Başarılı",
        description: "Slider başarıyla güncellendi.",
      });
    },
    onError: (error) => {
      console.error("Error updating slider:", error);
      toast({
        title: "Hata",
        description: "Slider güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const updateImageMutation = useMutation({
    mutationFn: async ({ id, image }: { id: string; image: string }) => {
      return await apiRequest(`/api/admin/sliders/${id}/image`, "PUT", { image });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sliders"] });
      toast({
        title: "Başarılı",
        description: "Slider görseli başarıyla güncellendi.",
      });
    },
    onError: (error) => {
      console.error("Error updating slider image:", error);
      toast({
        title: "Hata",
        description: "Slider görseli güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const createSliderMutation = useMutation({
    mutationFn: async (sliderData: any) => {
      return await apiRequest("/api/admin/sliders", "POST", sliderData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sliders"] });
      toast({
        title: "Başarılı",
        description: "Yeni slider başarıyla oluşturuldu.",
      });
    },
    onError: (error) => {
      console.error("Error creating slider:", error);
      toast({
        title: "Hata",
        description: "Slider oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const deleteSliderMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/sliders/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sliders"] });
      toast({
        title: "Başarılı",
        description: "Slider başarıyla silindi.",
      });
    },
    onError: (error) => {
      console.error("Error deleting slider:", error);
      toast({
        title: "Hata",
        description: "Slider silinirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const toggleSliderMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return await apiRequest(`/api/admin/sliders/${id}/toggle`, "PUT", { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sliders"] });
      toast({
        title: "Başarılı",
        description: "Slider durumu güncellendi.",
      });
    },
    onError: (error) => {
      console.error("Error toggling slider:", error);
      toast({
        title: "Hata",
        description: "Slider durumu güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleUpdateSlider = () => {
    if (!editingSlider) return;
    
    updateSliderMutation.mutate({
      id: editingSlider.id,
      updates: editingSlider
    });
  };

  const handleImageUrlUpdate = (slider: SliderItem, newImageUrl: string) => {
    updateImageMutation.mutate({
      id: slider.id,
      image: newImageUrl
    });
  };

  const handleCreateSlider = () => {
    createSliderMutation.mutate(newSliderData);
    setShowNewSliderDialog(false);
    setNewSliderData({
      link: "",
      image: "/public-objects/uploads/placeholder-1200x500.jpg",
      isActive: true,
      order: 1
    });
  };

  const handleDeleteSlider = (id: string) => {
    if (confirm("Bu slider'ı silmek istediğinize emin misiniz?")) {
      deleteSliderMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ana Sayfa Slider Yönetimi</h2>
          <p className="text-gray-600 mt-1">Ana sayfadaki slider görsellerini ve içeriklerini yönetin</p>
        </div>
        <Dialog open={showNewSliderDialog} onOpenChange={setShowNewSliderDialog}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Slider Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yeni Slider Oluştur</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-link">Tıklayınca Gidilecek Link</Label>
                <Input
                  id="new-link"
                  value={newSliderData.link}
                  onChange={(e) => setNewSliderData({ ...newSliderData, link: e.target.value })}
                  placeholder="/products?category=klima"
                />
              </div>
              
              <div>
                <Label>Slider Görseli</Label>
                <p className="text-sm text-gray-500 mb-2">
                  <strong>Tam Ekran Slider İçin Önerilen Boyutlar:</strong><br/>
                  • <strong>Standart:</strong> 1920x1080px (Full HD)<br/>
                  • <strong>Yüksek Kalite:</strong> 3840x2160px (4K)<br/>
                  • Format: WebP veya yüksek kaliteli JPEG<br/>
                  • Maksimum dosya boyutu: 10MB (optimizasyon için 2-5MB önerilir)
                </p>
                
                {/* Big upload area */}
                {!newSliderData.image ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer group">
                    <ObjectUploader
                      maxNumberOfFiles={1}
                      maxFileSize={10485760} // 10MB (4K görseller için)
                      onGetUploadParameters={async () => {
                        const response = await fetch("/api/sliders/upload", {
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
                          const objectPath = `/public-objects/slider-images/${fileName}`;
                          setNewSliderData({ ...newSliderData, image: objectPath });
                          toast({
                            title: "Başarılı",
                            description: "Görsel başarıyla yüklendi",
                          });
                        }
                      }}
                      buttonClassName="w-full h-32 bg-transparent border-none hover:bg-gray-50 text-gray-600 group-hover:text-primary"
                    >
                      <div className="flex flex-col items-center">
                        <ImageIcon className="w-16 h-16 mb-4 text-gray-400 group-hover:text-primary" />
                        <p className="text-lg font-semibold mb-1">Slider Görseli Yükle</p>
                        <p className="text-sm text-gray-500">Buraya tıklayıp görsel seçin</p>
                      </div>
                    </ObjectUploader>
                  </div>
                ) : null}
                
                {newSliderData.image && (
                  <div className="mt-4 relative">
                    <img 
                      src={newSliderData.image} 
                      alt="Slider Önizleme"
                      className="w-full h-48 md:h-64 object-cover rounded-lg border shadow-sm"
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateSlider}
                  disabled={!newSliderData.image}
                  size="sm"
                  className="flex-1"
                >
                  <Save className="w-3 h-3 mr-1" />
                  Oluştur
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowNewSliderDialog(false)}
                  size="sm"
                  className="flex-1"
                >
                  İptal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-8">
        {sliders.map((slider) => (
          <Card key={slider.id} className="overflow-hidden">
            <div className="relative group cursor-pointer" onClick={() => setEditingSlider(slider)}>
              <img 
                src={slider.image} 
                alt={slider.title}
                className="w-full h-64 md:h-80 object-cover transition-all duration-200 group-hover:brightness-75"
              />
              
              {/* Hover overlay for direct upload */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="text-white text-center">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-lg font-semibold">Görseli Değiştir</p>
                  <p className="text-sm opacity-80">Yeni görsel yüklemek için tıklayın</p>
                </div>
              </div>
              
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <Badge 
                  variant={slider.isActive ? "default" : "secondary"} 
                  className="text-sm px-3 py-1"
                >
                  {slider.isActive ? "Aktif" : "Pasif"}
                </Badge>
              </div>
              
            </div>

            <CardContent className="p-6">
              <div className="space-y-4">
                {slider.link && (
                  <div>
                    <Label className="text-xs text-gray-500">Tıklayınca Gidilecek Link</Label>
                    <p className="text-sm font-mono bg-gray-50 p-2 rounded truncate">
                      {slider.link}
                    </p>
                  </div>
                )}

                <div className="flex gap-1">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="xs" 
                        className="flex-1 text-xs py-1"
                        onClick={() => setEditingSlider(slider)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Düzenle
                      </Button>
                    </DialogTrigger>
                    
                    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Slider Düzenle</DialogTitle>
                      </DialogHeader>
                      
                      {editingSlider && (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="link">Tıklayınca Gidilecek Link</Label>
                            <Input
                              id="link"
                              value={editingSlider.link}
                              onChange={(e) => setEditingSlider({
                                ...editingSlider,
                                link: e.target.value
                              })}
                              placeholder="örn: /products/klima"
                            />
                          </div>
                          
                          <div>
                            <Label>Slider Görseli</Label>
                            <p className="text-sm text-gray-500 mb-2">
                              <strong>Tam Ekran Slider İçin Önerilen Boyutlar:</strong><br/>
                              • <strong>Standart:</strong> 1920x1080px (Full HD)<br/>
                              • <strong>Yüksek Kalite:</strong> 3840x2160px (4K)<br/>
                              • Format: WebP veya yüksek kaliteli JPEG<br/>
                              • Maksimum dosya boyutu: 10MB (optimizasyon için 2-5MB önerilir)
                            </p>
                            <ObjectUploader
                              maxNumberOfFiles={1}
                              maxFileSize={10485760} // 10MB (4K görseller için)
                              onGetUploadParameters={async () => {
                                const response = await fetch("/api/sliders/upload", {
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
                                  const objectPath = `/public-objects/slider-images/${fileName}`;
                                  setEditingSlider({ ...editingSlider, image: objectPath });
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
                            
                            {editingSlider.image && (
                              <div className="mt-4 relative group cursor-pointer">
                                <img 
                                  src={editingSlider.image} 
                                  alt="Slider Önizleme"
                                  className="w-full h-48 md:h-64 object-cover rounded-lg border shadow-sm transition-all duration-200 group-hover:brightness-75"
                                />
                                
                                {/* Hover overlay for changing image */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-lg">
                                  <div className="text-white text-center">
                                    <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                                    <p className="text-sm font-semibold">Görseli Değiştir</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          
                          <Button 
                            onClick={handleUpdateSlider}
                            disabled={updateSliderMutation.isPending}
                            className="w-full"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {updateSliderMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant={slider.isActive ? "destructive" : "default"}
                    size="xs"
                    className="text-xs py-1"
                    onClick={() => toggleSliderMutation.mutate({ 
                      id: slider.id, 
                      isActive: !slider.isActive 
                    })}
                    disabled={toggleSliderMutation.isPending}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    {slider.isActive ? "Gizle" : "Göster"}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="xs"
                    className="text-xs py-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteSlider(slider.id)}
                    disabled={deleteSliderMutation.isPending}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sliders.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium mb-1">Henüz slider yok</p>
          <p className="text-sm text-gray-400">İlk slider'ınızı oluşturun</p>
        </div>
      )}
    </div>
  );
}