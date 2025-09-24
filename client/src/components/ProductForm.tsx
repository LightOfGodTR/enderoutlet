import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Save, X } from "lucide-react";
import ProductImageUploader from "./ProductImageUploader";

interface ProductFormProps {
  categories: any[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: any;
}

interface FormData {
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  subcategory: string[];
  // For backward compatibility, also support single subcategory
  _singleSubcategory?: string;
  materialCode: string;
  images: string[];
  isActive: boolean;
  features: string;
  inStock: boolean;
}

export default function ProductForm({ 
  categories, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  initialData 
}: ProductFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    price: 0,
    originalPrice: 0,
    category: "",
    subcategory: [],
    materialCode: "",
    images: [] as string[],
    isActive: true,
    features: "",
    inStock: true,
    // Convert existing string subcategory to array format
    ...(initialData ? {
      ...initialData,
      subcategory: initialData.subcategory 
        ? (typeof initialData.subcategory === 'string' 
            ? initialData.subcategory.split(',').map((s: string) => s.trim()).filter(Boolean)
            : Array.isArray(initialData.subcategory) 
              ? initialData.subcategory 
              : []
          )
        : []
    } : {})
  });

  const [isGenerating, setIsGenerating] = useState(false);

  // Format price with thousand separators only (no decimals for clarity)
  const formatPrice = (value: number | string): string => {
    // Convert to number if it's a string
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    // Handle invalid numbers
    if (isNaN(numValue) || numValue === 0) return '0';
    
    // Convert to integer (remove decimals for clarity)
    const intValue = Math.round(numValue);
    
    // Add thousand separators (dots) to integer part
    const formattedInteger = intValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    // Return with Turkish format: "32.655" (no decimals)
    return formattedInteger;
  };

  // Calculate discount percentage
  const discountPercentage = formData.originalPrice > formData.price 
    ? Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100)
    : 0;

  // Get subcategories for selected category
  const selectedCategory = categories.find(cat => cat.name === formData.category);
  const availableSubcategories = selectedCategory?.subcategories || [];


  useEffect(() => {
    if (initialData) {
      // Parse subcategory correctly every time initialData changes
      const parsedSubcategory = initialData.subcategory 
        ? (typeof initialData.subcategory === 'string' 
            ? initialData.subcategory.split(',').map((s: string) => s.trim()).filter(Boolean)
            : Array.isArray(initialData.subcategory) 
              ? initialData.subcategory 
              : []
          )
        : [];
      
      setFormData(prev => ({
        ...prev,
        ...initialData,
        images: Array.isArray(initialData.images) ? initialData.images : [],
        features: Array.isArray(initialData.features) 
          ? initialData.features.join('\n')
          : initialData.features || "",
        subcategory: parsedSubcategory
      }));
    }
  }, [initialData]);

  const scrapeFromArcelik = async () => {
    if (!formData.materialCode) {
      toast({
        title: "Uyarı",
        description: "Önce malzeme kodunu girin (örn: 391572 EI)",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/admin/scrape-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productName: formData.materialCode })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Scraping başarısız');
      }

      if (data.error) {
        toast({
          title: "Hata",
          description: data.error,
          variant: "destructive"
        });
        return;
      }

      // Scraping'den gelen verileri form'a aktar (Yeni Arçelik JSON formatı)
      const features: string[] = [];
      if (data.teknikOzellikler && typeof data.teknikOzellikler === 'object') {
        // teknikOzellikler objesini features array'ine çevir
        Object.entries(data.teknikOzellikler).forEach(([key, value]) => {
          features.push(`${key}: ${value}`);
        });
      }
      
      setFormData(prev => ({
        ...prev,
        name: data.isim || prev.name,
        description: data.aciklama || prev.description,
        price: data.indirimliFiyat || prev.price,
        originalPrice: data.anaFiyat || prev.originalPrice,
        features: features.length > 0 ? features.join('\n') : prev.features,
        category: data.kategori || prev.category,
        subcategory: data.altKategori || prev.subcategory,
        // Yüklenen fotoğrafları da forma ekle
        images: Array.isArray(data.gorseller) ? data.gorseller : prev.images
      }));

      toast({
        title: "Başarılı!",
        description: `${data.isim || 'Ürün'} bilgileri Arçelik.com'dan çekildi!`,
        duration: 4000
      });

    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Ürün bilgileri çekilemedi",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateDescription = async () => {
    if (!formData.name) {
      toast({
        title: "Uyarı",
        description: "Önce ürün adını girin",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Basit bir açıklama oluştur
      const description = `${formData.name} - Premium kalitede ${formData.category.toLowerCase()} ürünü. Modern tasarım ve yüksek performans ile güvenilir kullanım.`;
      setFormData(prev => ({ ...prev, description }));
      
      toast({
        title: "Başarılı!",
        description: "Ürün açıklaması oluşturuldu"
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Açıklama oluşturulamadı",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submissions
    if (isLoading) {
      return;
    }
    
    if (!formData.name || !formData.originalPrice || !formData.category) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen tüm zorunlu alanları doldurun",
        variant: "destructive"
      });
      return;
    }

    const processedData = {
      ...formData,
      // Price logic: If no discount (price empty), use originalPrice as price
      originalPrice: formData.originalPrice || 0,
      price: formData.price || formData.originalPrice || 0, // Use originalPrice if price is empty
      discountPercentage: formData.originalPrice && formData.price && formData.originalPrice > formData.price 
        ? Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100)
        : 0,
      // Convert subcategory array to string (join with comma) for backend compatibility
      subcategory: Array.isArray(formData.subcategory) ? formData.subcategory.join(',') : '',
      // Convert features string to array (split by newlines or comma)
      features: formData.features ? 
        (typeof formData.features === 'string' ? 
          formData.features.split('\n').filter(f => f.trim()) : 
          Array.isArray(formData.features) ? formData.features : []
        ) : [],
      // Ensure images is an array
      images: Array.isArray(formData.images) ? formData.images : [],
      // Set main image as first uploaded image (required field)
      image: Array.isArray(formData.images) && formData.images.length > 0 
        ? formData.images[0] 
        : "",
      // Ensure brand is set
      brand: "Arçelik"
    };

    onSubmit(processedData);
  };

  const handleImagesUpdate = (newImages: string[]) => {
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  // Arçelik formatından doğru formata çevirme fonksiyonu
  const formatArcelikFeatures = (text: string): string => {
    console.log('Original text:', text);
    
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    const formattedLines: string[] = [];
    
    // Başlık satırlarını atla - bu başlıklar özellik olarak eklenmeyecek
    const headerLines = [
      'Genel Özellikler',
      'Teknolojik Özellikler', 
      'Konfor ve Güvenlik',
      'Programlar',
      'Performans',
      'Ölçüler',
      'Hava Kalitesi',
      'Konfor',
      'Kapasite',
      'Enerji Verimliliği',
      'Sessizlik',
      'Temel Özellikler', 
      'Özel Fonksiyonlar', 
      'Boyutlar',
      'Teknoloji',
      'Özellikler',
      'Detaylar',
      'Bilgiler',
      'Diğer', 
      'Garanti',
      'Aksesuarlar',
      'Esnek',
      'Fonksiyon ve Teknolojiler',
      'Pişirme Fonksiyonları ve Teknolojileri',
      'Program Sıcaklıkları (°C)',
      'Tüketim Bilgileri',
      'Ankastre Fırın Tüketim Bilgileri',
      'İç Hacim',
      'Dış Ölçüler',
      'Kapak Özellikleri',
      'Motor Özellikleri',
      'Güvenlik Özellikleri',
      'Ekran Özellikleri',
      'Ses Özellikleri',
      'Bağlantı Özellikleri',
      'Diğer Bağlantılar',
      'Akıllı TV Özellikleri',
      'Tasarım Özellikleri',
      'Enerji Tüketimi',
      'Oyun ve Performans Özellikleri',
      'Dondurucu Bölme Özellikleri',
      'Soğutucu Bölme Özellikleri',
      'Fırın (Ana Bölme)',
      'Güvenlik',
      'Fonksiyonlar'
    ];
    
    for (let i = 0; i < lines.length; i++) {
      const currentLine = lines[i];
      
      // Başlık satırlarını geç
      if (headerLines.includes(currentLine)) {
        console.log('Skipping header:', currentLine);
        continue;
      }
      
      // Eğer satır ":" içeriyorsa direkt kullan (örn: "Ağırlık: Paketsiz")
      if (currentLine.includes(':')) {
        let formatted = currentLine.replace(/\s*:\s*/, ': ');
        
        // "Paketsiz" kelimesini kaldır
        const containsPaketsiz = /:\s*Paketsiz\s*$/i.test(formatted);
        formatted = formatted.replace(/:\s*Paketsiz\s*$/i, '');
        
        // Eğer Paketsiz kaldırıldıysa veya sadece başlık kaldıysa sonraki satırı değer olarak al
        if (containsPaketsiz || formatted.endsWith(':') || formatted.trim().endsWith(':')) {
          const nextLine = lines[i + 1];
          if (nextLine && !nextLine.includes(':') && !headerLines.includes(nextLine)) {
            formatted = `${formatted.replace(/:\s*$/, '')}: ${nextLine}`;
            i++; // Sonraki satırı atla
          }
        }
        
        console.log('Direct format:', formatted);
        if (formatted.trim() && !formatted.endsWith(':')) {
          formattedLines.push(formatted);
        }
        continue;
      }
      
      // Eğer sonraki satır varsa ve bu satır özellik adı gibi görünüyorsa
      const nextLine = lines[i + 1];
      if (nextLine && !nextLine.includes(':') && !headerLines.includes(nextLine)) {
        // İki satırı birleştir (örn: "Motor Tipi" + "Standart Motor" = "Motor Tipi: Standart Motor")
        const combined = `${currentLine}: ${nextLine}`;
        console.log('Combined format:', combined);
        formattedLines.push(combined);
        i++; // Sonraki satırı atla çünkü zaten işledik
        continue;
      }
    }

    const result = formattedLines.join('\n');
    console.log('Final result:', result);
    console.log('Total lines:', formattedLines.length);
    return result;
  };

  const handleFeaturesPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    console.log('Paste event triggered');
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    console.log('Pasted text:', pastedText);
    
    if (!pastedText || pastedText.trim() === '') {
      console.log('No text to format');
      return;
    }
    
    const formattedText = formatArcelikFeatures(pastedText);
    console.log('Setting formatted text:', formattedText);
    
    setFormData(prev => ({ ...prev, features: formattedText }));
    
    toast({
      title: "Formatlandı!",
      description: `${formattedText.split('\n').length} özellik dönüştürüldü.`,
      duration: 3000
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Temel Bilgiler */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ürün Adı *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Örn: Arçelik Buzdolabı No Frost 480 Lt"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="materialCode">Ürün Linki</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={scrapeFromArcelik}
                disabled={isGenerating}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isGenerating ? "Çekiliyor..." : "Arçelik.com'dan Çek"}
              </Button>
            </div>
            <Input
              id="materialCode"
              value={formData.materialCode}
              onChange={(e) => setFormData(prev => ({ ...prev, materialCode: e.target.value }))}
              placeholder="Örn: camasir-makinesi-9120-tmx, buzdolabi-gardrop-570-lt, vb."
            />
            <p className="text-xs text-gray-500">
              arcelik.com.tr/ sonrasındaki ürün linkini yazın ve "Çek" butonuna tıklayın
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Ürün Açıklaması *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateDescription}
                disabled={isGenerating}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isGenerating ? "Oluşturuluyor..." : "AI ile Oluştur"}
              </Button>
            </div>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Ürünün detaylı açıklamasını yazın..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="originalPrice">Ana Fiyat (TL) *</Label>
              <Input
                id="originalPrice"
                type="number"
                value={formData.originalPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) || 0 }))}
                placeholder="Ana fiyat giriniz"
                min="0"
                step="0.01"
                required
              />
              {formData.originalPrice > 0 && (
                <p className="text-xs text-gray-500">
                  Formatlanmış: {formatPrice(formData.originalPrice)} TL
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">İndirimli Fiyat (TL) - Opsiyonel</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                placeholder="İndirimli fiyat varsa giriniz"
                min="0"
                step="0.01"
              />
              {formData.price > 0 ? (
                <p className="text-xs text-gray-500">
                  Formatlanmış: {formatPrice(formData.price)} TL
                </p>
              ) : (
                <p className="text-xs text-gray-500">
                  İndirimli fiyat 0 ise ana fiyat ({formatPrice(formData.originalPrice)} TL) kullanılır
                </p>
              )}
              {discountPercentage > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm font-semibold text-green-600">
                    %{discountPercentage} İndirim
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatPrice(formData.originalPrice - formData.price)} TL tasarruf
                  </span>
                </div>
              )}
              <p className="text-xs text-gray-400">
                Bu alanı boş bırakırsanız ürün indirimsiz olarak kaydedilir
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Kategori *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => {
                  setFormData(prev => ({ 
                    ...prev, 
                    category: value,
                    subcategory: [] // Reset subcategory when category changes
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent className="z-[65]">
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="subcategory" className="text-base font-medium">Alt Kategoriler (Çoklu Seçim)</Label>
              <div className="border-2 border-gray-200 rounded-lg p-4 min-h-[200px] max-h-[400px] overflow-y-auto space-y-3 bg-gray-50">
                {!formData.category ? (
                  <div className="flex items-center justify-center h-32">
                    <p className="text-gray-500 italic">Önce kategori seçin</p>
                  </div>
                ) : availableSubcategories.length === 0 ? (
                  <div className="flex items-center justify-center h-32">
                    <p className="text-gray-500 italic">Bu kategoride alt kategori yok</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-white rounded-md p-3 border border-blue-200">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="all-subcategories"
                          checked={formData.subcategory.length === availableSubcategories.length && availableSubcategories.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData(prev => ({
                                ...prev,
                                subcategory: [...availableSubcategories]
                              }));
                            } else {
                              setFormData(prev => ({ ...prev, subcategory: [] }));
                            }
                          }}
                          className="h-5 w-5"
                        />
                        <label htmlFor="all-subcategories" className="text-base font-semibold text-blue-700 cursor-pointer">
                          Tüm alt kategoriler seç
                        </label>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      {availableSubcategories.map((subcat: string) => (
                        <div key={subcat} className="bg-white rounded-md p-3 border hover:border-gray-300 transition-colors">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id={`subcat-${subcat}`}
                              checked={formData.subcategory.includes(subcat)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData(prev => ({
                                    ...prev,
                                    subcategory: [...prev.subcategory, subcat]
                                  }));
                                } else {
                                  setFormData(prev => ({
                                    ...prev,
                                    subcategory: prev.subcategory.filter(s => s !== subcat)
                                  }));
                                }
                              }}
                              className="h-4 w-4"
                            />
                            <label htmlFor={`subcat-${subcat}`} className="text-sm font-medium cursor-pointer flex-1">
                              {subcat}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              {formData.category && availableSubcategories.length > 0 && (
                <div className="bg-blue-50 rounded-md p-3">
                  <p className="text-sm font-medium text-blue-800">
                    📊 {formData.subcategory.length} / {availableSubcategories.length} alt kategori seçili
                  </p>
                  {formData.subcategory.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {formData.subcategory.map((selected) => (
                        <span key={selected} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {selected}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ürün Görselleri */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Ürün Görselleri</Label>
            <ProductImageUploader
              currentImages={formData.images}
              onImagesUpdate={handleImagesUpdate}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>


      {/* Teknik Özellikler */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="features">Teknik Özellikler</Label>
          <Textarea
            id="features"
            value={formData.features}
            onChange={(e) => setFormData(prev => ({ ...prev, features: e.target.value }))}
            onPaste={handleFeaturesPaste}
            placeholder="Enerji Sınıfı: A++&#10;Kapasite: 630 Litre&#10;Dondurucu: NoFrost&#10;Motor: Inverter"
            rows={6}
          />
          <p className="text-xs text-gray-500">
            <span className="font-medium text-green-600">✨ Arçelik'ten kopyala-yapıştır:</span> Otomatik formatlanır! Her satıra bir özellik yazın.
          </p>
        </div>
      </div>

      {/* Durum Ayarları */}
      <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
          />
          <Label htmlFor="isActive">Aktif Ürün</Label>
        </div>
      </div>

      {/* Form Butonları */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          <X className="h-4 w-4 mr-2" />
          İptal
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          data-testid="button-save-product"
        >
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "Kaydediliyor..." : initialData ? "Güncelle" : "Kaydet"}
        </Button>
      </div>
    </form>
  );
}