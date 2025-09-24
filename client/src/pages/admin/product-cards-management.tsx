import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Eye, Save, ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { ObjectUploader } from "@/components/ObjectUploader";

interface ProductCard {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  image: string;
  backgroundColor: string;
  buttonText: string;
  buttonUrl: string;
  imageScale: number;
  imagePositionX: number;
  imagePositionY: number;
  isActive: boolean;
  sortOrder: number;
}

export default function ProductCardsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showNewCardDialog, setShowNewCardDialog] = useState(false);
  const [editingCard, setEditingCard] = useState<ProductCard | null>(null);

  const [newCardData, setNewCardData] = useState({
    title: "",
    subtitle: "",
    price: "",
    image: "/public-objects/uploads/placeholder-product.jpg",
    backgroundColor: "#6366f1",
    buttonText: "İncele",
    buttonUrl: "/products",
    imageScale: 1.0,
    imagePositionX: 50,
    imagePositionY: 50,
    isActive: true,
    sortOrder: 1
  });

  const { data: cards = [], isLoading } = useQuery<ProductCard[]>({
    queryKey: ["/api/admin/product-cards"],
  });

  const createCardMutation = useMutation({
    mutationFn: (cardData: any) => apiRequest("/api/admin/product-cards", "POST", cardData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/product-cards"] });
      toast({
        title: "Başarılı",
        description: "Ürün kartı oluşturuldu",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Ürün kartı oluşturulurken hata oluştu",
        variant: "destructive",
      });
    },
  });

  const updateCardMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      apiRequest(`/api/admin/product-cards/${id}`, "PUT", updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/product-cards"] });
      setEditingCard(null);
      toast({
        title: "Başarılı",
        description: "Ürün kartı güncellendi",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Ürün kartı güncellenirken hata oluştu",
        variant: "destructive",
      });
    },
  });

  const deleteCardMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/product-cards/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/product-cards"] });
      toast({
        title: "Başarılı",
        description: "Ürün kartı silindi",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Ürün kartı silinirken hata oluştu",
        variant: "destructive",
      });
    },
  });

  const handleCreateCard = () => {
    createCardMutation.mutate(newCardData);
    setShowNewCardDialog(false);
    setNewCardData({
      title: "",
      subtitle: "",
      price: "",
      image: "/public-objects/uploads/placeholder-product.jpg",
      backgroundColor: "#6366f1",
      buttonText: "İncele",
      buttonUrl: "/products",
      imageScale: 1.0,
      imagePositionX: 50,
      imagePositionY: 50,
      isActive: true,
      sortOrder: 1
    });
  };

  const handleUpdateCard = () => {
    if (editingCard) {
      const updates = {
        ...editingCard,
        imageScale: editingCard.imageScale?.toString(),
        imagePositionX: editingCard.imagePositionX?.toString(),
        imagePositionY: editingCard.imagePositionY?.toString(),
      };
      
      updateCardMutation.mutate({
        id: editingCard.id,
        updates,
      });
    }
  };

  const handleDeleteCard = (id: string) => {
    if (confirm("Bu ürün kartını silmek istediğinize emin misiniz?")) {
      deleteCardMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Ürün kartları yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Ürün Kartları Yönetimi</h2>
          <p className="text-gray-600">Ana sayfada gösterilecek ürün kartlarını yönetin</p>
        </div>
        
        <Dialog open={showNewCardDialog} onOpenChange={setShowNewCardDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Kart Ekle
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yeni Ürün Kartı</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-title">Başlık</Label>
                <Input
                  id="new-title"
                  value={newCardData.title}
                  onChange={(e) => setNewCardData({ ...newCardData, title: e.target.value })}
                  placeholder="örn: SM 6670"
                />
              </div>
              
              <div>
                <Label htmlFor="new-subtitle">Alt Başlık</Label>
                <Textarea
                  id="new-subtitle"
                  value={newCardData.subtitle}
                  onChange={(e) => setNewCardData({ ...newCardData, subtitle: e.target.value })}
                  placeholder="örn: Slush ve Buzlu İçecek Makineleri"
                  rows={2}
                />
              </div>
              
              <div>
                <Label htmlFor="new-price">Fiyat</Label>
                <Input
                  id="new-price"
                  value={newCardData.price}
                  onChange={(e) => setNewCardData({ ...newCardData, price: e.target.value })}
                  placeholder="örn: 12.999 TL"
                />
              </div>

              <div>
                <Label htmlFor="new-backgroundColor">Arka Plan Rengi</Label>
                <Input
                  id="new-backgroundColor"
                  type="color"
                  value={newCardData.backgroundColor}
                  onChange={(e) => setNewCardData({ ...newCardData, backgroundColor: e.target.value })}
                  className="h-10"
                />
              </div>
              
              <div>
                <Label htmlFor="new-buttonText">Buton Metni</Label>
                <Input
                  id="new-buttonText"
                  value={newCardData.buttonText}
                  onChange={(e) => setNewCardData({ ...newCardData, buttonText: e.target.value })}
                  placeholder="örn: İncele"
                />
              </div>
              
              <div>
                <Label htmlFor="new-buttonUrl">Buton Yönlendirme</Label>
                <Input
                  id="new-buttonUrl"
                  value={newCardData.buttonUrl}
                  onChange={(e) => setNewCardData({ ...newCardData, buttonUrl: e.target.value })}
                  placeholder="örn: /products?category=icecek-makinesi"
                />
              </div>
              
              <div>
                <Label>Ürün Görseli</Label>
                <p className="text-sm text-gray-500 mb-2">
                  Önerilen boyut: 400x400px, maksimum 3MB (JPG, PNG)
                </p>
                
                {!newCardData.image || newCardData.image === "/public-objects/uploads/placeholder-product.jpg" ? (
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-primary/30 transition-colors cursor-pointer group">
                    <ObjectUploader
                      maxNumberOfFiles={1}
                      maxFileSize={3145728} // 3MB
                      onGetUploadParameters={async () => {
                        const response = await fetch("/api/product-cards/upload", {
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
                          const url = new URL(uploadURL);
                          const pathParts = url.pathname.split('/');
                          const fileName = pathParts[pathParts.length - 1];
                          const objectPath = `/public-objects/product-images/${fileName}`;
                          setNewCardData({ ...newCardData, image: objectPath });
                          toast({
                            title: "Başarılı",
                            description: "Ürün görseli yüklendi",
                          });
                        }
                      }}
                      buttonClassName="w-full h-20 bg-transparent border-none hover:bg-gray-50 text-gray-500 group-hover:text-primary"
                    >
                      <div className="flex flex-col items-center">
                        <ImageIcon className="w-8 h-8 mb-2 text-gray-300 group-hover:text-primary" />
                        <p className="text-sm font-medium">Ürün Görseli Ekle</p>
                      </div>
                    </ObjectUploader>
                  </div>
                ) : (
                  <div className="relative group">
                    <img 
                      src={newCardData.image} 
                      alt="Ürün görseli"
                      className="w-full h-32 object-cover rounded border"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setNewCardData({ ...newCardData, image: "/public-objects/uploads/placeholder-product.jpg" })}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Kaldır
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Image Customization */}
              {newCardData.image && newCardData.image !== "/public-objects/uploads/placeholder-product.jpg" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="image-scale">Görsel Boyutu: {newCardData.imageScale}x</Label>
                    <input
                      id="image-scale"
                      type="range"
                      min="0.5"
                      max="3.0"
                      step="0.1"
                      value={newCardData.imageScale}
                      onChange={(e) => setNewCardData({ ...newCardData, imageScale: parseFloat(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="image-position-x">Yatay Pozisyon: {newCardData.imagePositionX}%</Label>
                    <input
                      id="image-position-x"
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={newCardData.imagePositionX}
                      onChange={(e) => setNewCardData({ ...newCardData, imagePositionX: parseFloat(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="image-position-y">Dikey Pozisyon: {newCardData.imagePositionY}%</Label>
                    <input
                      id="image-position-y"
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={newCardData.imagePositionY}
                      onChange={(e) => setNewCardData({ ...newCardData, imagePositionY: parseFloat(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Realistic Preview */}
              {newCardData.title && newCardData.subtitle && newCardData.price && (
                <div>
                  <Label>Gerçek Boyutlu Önizleme</Label>
                  <p className="text-sm text-gray-500 mb-2">Kartın ana sayfada nasıl görüneceği</p>
                  <div className="max-w-xs mx-auto">
                    <div 
                      className="relative rounded-2xl overflow-hidden shadow-lg text-white min-h-[500px] flex flex-col"
                      style={{ backgroundColor: newCardData.backgroundColor }}
                    >
                      {/* Content Section - Top */}
                      <div className="text-center space-y-2 p-4 pb-2">
                        <h3 className="text-lg font-bold leading-tight">{newCardData.title}</h3>
                        <p className="text-xs opacity-90 leading-relaxed">{newCardData.subtitle}</p>
                        <p className="text-base font-semibold mb-3">{newCardData.price}</p>
                        
                        <Button variant="secondary" size="sm" className="bg-white text-gray-900">
                          {newCardData.buttonText}
                        </Button>
                      </div>

                      {/* Large Product Image - Bottom */}
                      {newCardData.image && newCardData.image !== "/public-objects/uploads/placeholder-product.jpg" && (
                        <div className="flex-1 flex items-center justify-center min-h-[300px] p-4 overflow-hidden">
                          <img 
                            src={newCardData.image}
                            alt={newCardData.title}
                            className="object-contain drop-shadow-xl"
                            style={{ 
                              transform: `scale(${newCardData.imageScale})`,
                              objectPosition: `${newCardData.imagePositionX}% ${newCardData.imagePositionY}%`,
                              width: '100%',
                              height: '100%'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateCard}
                  disabled={!newCardData.title || !newCardData.subtitle || !newCardData.price}
                  size="sm"
                  className="flex-1"
                >
                  <Save className="w-3 h-3 mr-1" />
                  Oluştur
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowNewCardDialog(false)}
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

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Card key={card.id} className="overflow-hidden">
            <div 
              className="relative h-32 p-4 text-white"
              style={{ backgroundColor: card.backgroundColor }}
            >
              <div className="text-center space-y-1">
                <h3 className="font-bold">{card.title}</h3>
                <p className="text-xs opacity-90">{card.subtitle}</p>
                <p className="text-sm font-semibold">{card.price}</p>
              </div>
              
              {card.image && card.image !== "/public-objects/uploads/placeholder-product.jpg" && (
                <div className="absolute bottom-2 right-2">
                  <img 
                    src={card.image}
                    alt="Ürün"
                    className="w-12 h-12 object-cover rounded border"
                  />
                </div>
              )}
            </div>

            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Durum:</span>
                  <Badge variant={card.isActive ? "default" : "outline"}>
                    {card.isActive ? "Aktif" : "Pasif"}
                  </Badge>
                </div>
                
                <div className="text-sm">
                  <span className="text-gray-500">Buton: </span>
                  <span className="font-mono text-xs">{card.buttonText} → {card.buttonUrl}</span>
                </div>

                <div className="flex gap-1">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-xs py-1"
                        onClick={() => setEditingCard(card)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Düzenle
                      </Button>
                    </DialogTrigger>
                    
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Ürün Kartını Düzenle</DialogTitle>
                      </DialogHeader>
                      
                      {editingCard && (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="edit-title">Başlık</Label>
                            <Input
                              id="edit-title"
                              value={editingCard.title}
                              onChange={(e) => setEditingCard({
                                ...editingCard,
                                title: e.target.value
                              })}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="edit-subtitle">Alt Başlık</Label>
                            <Textarea
                              id="edit-subtitle"
                              value={editingCard.subtitle}
                              onChange={(e) => setEditingCard({
                                ...editingCard,
                                subtitle: e.target.value
                              })}
                              rows={2}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="edit-price">Fiyat</Label>
                            <Input
                              id="edit-price"
                              value={editingCard.price}
                              onChange={(e) => setEditingCard({
                                ...editingCard,
                                price: e.target.value
                              })}
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-backgroundColor">Arka Plan Rengi</Label>
                            <Input
                              id="edit-backgroundColor"
                              type="color"
                              value={editingCard.backgroundColor}
                              onChange={(e) => setEditingCard({
                                ...editingCard,
                                backgroundColor: e.target.value
                              })}
                              className="h-10"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="edit-buttonText">Buton Metni</Label>
                            <Input
                              id="edit-buttonText"
                              value={editingCard.buttonText}
                              onChange={(e) => setEditingCard({
                                ...editingCard,
                                buttonText: e.target.value
                              })}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="edit-buttonUrl">Buton Yönlendirme</Label>
                            <Input
                              id="edit-buttonUrl"
                              value={editingCard.buttonUrl}
                              onChange={(e) => setEditingCard({
                                ...editingCard,
                                buttonUrl: e.target.value
                              })}
                            />
                          </div>

                          {/* Image Customization for Edit */}
                          {editingCard.image && editingCard.image !== "/public-objects/uploads/placeholder-product.jpg" && (
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="edit-image-scale">Görsel Boyutu: {editingCard.imageScale || 1.0}x</Label>
                                <input
                                  id="edit-image-scale"
                                  type="range"
                                  min="0.5"
                                  max="3.0"
                                  step="0.1"
                                  value={editingCard.imageScale || 1.0}
                                  onChange={(e) => setEditingCard({
                                    ...editingCard,
                                    imageScale: parseFloat(e.target.value)
                                  })}
                                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="edit-image-position-x">Yatay Pozisyon: {editingCard.imagePositionX || 50}%</Label>
                                <input
                                  id="edit-image-position-x"
                                  type="range"
                                  min="0"
                                  max="100"
                                  step="5"
                                  value={editingCard.imagePositionX || 50}
                                  onChange={(e) => setEditingCard({
                                    ...editingCard,
                                    imagePositionX: parseFloat(e.target.value)
                                  })}
                                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="edit-image-position-y">Dikey Pozisyon: {editingCard.imagePositionY || 50}%</Label>
                                <input
                                  id="edit-image-position-y"
                                  type="range"
                                  min="0"
                                  max="100"
                                  step="5"
                                  value={editingCard.imagePositionY || 50}
                                  onChange={(e) => setEditingCard({
                                    ...editingCard,
                                    imagePositionY: parseFloat(e.target.value)
                                  })}
                                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                              </div>
                              
                              {/* Edit Preview */}
                              <div>
                                <Label>Önizleme</Label>
                                <div className="max-w-xs mx-auto">
                                  <div 
                                    className="relative rounded-2xl overflow-hidden shadow-lg text-white min-h-[400px] flex flex-col"
                                    style={{ backgroundColor: editingCard.backgroundColor }}
                                  >
                                    <div className="text-center space-y-1 p-3 pb-2">
                                      <h3 className="text-base font-bold leading-tight">{editingCard.title}</h3>
                                      <p className="text-xs opacity-90">{editingCard.subtitle}</p>
                                      <p className="text-sm font-semibold">{editingCard.price}</p>
                                      <Button variant="secondary" size="sm" className="bg-white text-gray-900 mt-2">
                                        {editingCard.buttonText}
                                      </Button>
                                    </div>
                                    <div className="flex-1 flex items-center justify-center min-h-[240px] p-3 overflow-hidden">
                                      <img 
                                        src={editingCard.image}
                                        alt={editingCard.title}
                                        className="object-contain drop-shadow-xl"
                                        style={{ 
                                          transform: `scale(${editingCard.imageScale || 1.0})`,
                                          objectPosition: `${editingCard.imagePositionX || 50}% ${editingCard.imagePositionY || 50}%`,
                                          width: '100%',
                                          height: '100%'
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="edit-isActive"
                              checked={editingCard.isActive}
                              onChange={(e) => setEditingCard({
                                ...editingCard,
                                isActive: e.target.checked
                              })}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor="edit-isActive">Aktif</Label>
                          </div>
                          
                          <Button 
                            onClick={handleUpdateCard}
                            disabled={updateCardMutation.isPending}
                            className="w-full"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {updateCardMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs py-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteCard(card.id)}
                    disabled={deleteCardMutation.isPending}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {cards.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium mb-1">Henüz ürün kartı yok</p>
          <p className="text-sm text-gray-400">İlk ürün kartınızı oluşturun</p>
        </div>
      )}
    </div>
  );
}