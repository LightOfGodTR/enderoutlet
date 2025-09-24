import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageSpecs {
  title: string;
  dimensions: string;
  format: string;
  maxSize: string;
  aspectRatio?: string;
  recommendations?: string[];
}

interface UniversalImageUploaderProps {
  label: string;
  currentImage: string;
  onImageUpdate: (newImageUrl: string) => void;
  disabled?: boolean;
  uploadEndpoint: string;
  imageSpecs: ImageSpecs;
  showUrlInput?: boolean;
}

// Predefined image specifications for different types
export const IMAGE_SPECS = {
  blogCategory: {
    title: "Blog Kategori Görseli",
    dimensions: "400x300 piksel",
    format: "JPG, PNG, WebP",
    maxSize: "2MB",
    aspectRatio: "4:3 oran",
    recommendations: [
      "• Kategoriyi temsil eden görsel seçin",
      "• Temiz ve sade kompozisyon tercih edin",
      "• Yazı okunabilirliği için kontrast önemli"
    ]
  },
  blogPost: {
    title: "Blog Yazısı Öne Çıkan Görseli",
    dimensions: "800x450 piksel",
    format: "JPG, PNG, WebP",
    maxSize: "3MB",
    aspectRatio: "16:9 oran",
    recommendations: [
      "• Yazının konusunu yansıtan görsel",
      "• Sosyal medya paylaşımları için optimize",
      "• Yatay kompozisyon önerilir"
    ]
  },
  ogImage: {
    title: "Open Graph (Sosyal Medya) Görseli",
    dimensions: "1200x630 piksel",
    format: "JPG, PNG",
    maxSize: "2MB",
    aspectRatio: "1.91:1 oran",
    recommendations: [
      "• Facebook ve Twitter için optimize",
      "• Merkeze odaklı kompozisyon",
      "• Şirket logosu eklenebilir"
    ]
  },
  general: {
    title: "Genel Görsel",
    dimensions: "800x600 piksel",
    format: "JPG, PNG, WebP",
    maxSize: "5MB",
    aspectRatio: "4:3 oran",
    recommendations: [
      "• Web kullanımı için optimize edilmiş",
      "• Hızlı yükleme için boyut önemli"
    ]
  },
  BLOG_SLIDER: {
    title: "Blog Slider Görseli",
    dimensions: "1920x1080 piksel", 
    format: "JPG, PNG, WebP",
    maxSize: "5MB",
    aspectRatio: "16:9 oran",
    recommendations: [
      "• Blog yazısının konusunu yansıtan görsel",
      "• Etiket ve yazıların okunabilirliği için kontrast",
      "• Full-screen gösterim için yüksek kalite"
    ]
  }
};

export function UniversalImageUploader({ 
  label,
  currentImage, 
  onImageUpdate, 
  disabled,
  uploadEndpoint,
  imageSpecs,
  showUrlInput = false
}: UniversalImageUploaderProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(currentImage);
  
  // Update local state when currentImage prop changes
  useEffect(() => {
    setImageUrl(currentImage);
  }, [currentImage]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Hata",
        description: "Lütfen sadece görsel dosyalarını seçin.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (convert MB to bytes)
    const maxSizeInBytes = parseFloat(imageSpecs.maxSize.replace('MB', '')) * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      toast({
        title: "Hata", 
        description: `Dosya boyutu maksimum ${imageSpecs.maxSize} olabilir.`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload file directly using form data
      const formData = new FormData();
      formData.append('image', file);
      
      const uploadResponse = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const result = await uploadResponse.json();
      const publicImageUrl = result.imageUrl;

      setImageUrl(publicImageUrl);
      onImageUpdate(publicImageUrl);

      toast({
        title: "Başarılı",
        description: "Görsel başarıyla yüklendi.",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Hata",
        description: "Görsel yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const handleRemoveImage = () => {
    setImageUrl("");
    onImageUpdate("");
    toast({
      title: "Görsel Kaldırıldı",
      description: "Görsel başarıyla kaldırıldı.",
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="image-upload">{label}</Label>
        
        {/* Current Image Preview */}
        {imageUrl && (
          <div className="mt-2 mb-3 relative group">
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-40 object-cover rounded-lg border border-gray-200"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleRemoveImage}
              disabled={disabled}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}

        {/* File Upload */}
        <div className="flex gap-2">
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={disabled || isUploading}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            disabled={disabled || isUploading}
            onClick={() => document.getElementById('image-upload')?.click()}
          >
            <Upload className="w-4 h-4 mr-1" />
            {isUploading ? "Yükleniyor..." : "Seç"}
          </Button>
        </div>

        {/* Image Guidelines */}
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <ImageIcon className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-2">{imageSpecs.title} - Önerilen Özellikler:</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-2 text-xs">
                <div><strong>Boyut:</strong> {imageSpecs.dimensions}</div>
                <div><strong>Format:</strong> {imageSpecs.format}</div>
                <div><strong>Oran:</strong> {imageSpecs.aspectRatio || "Serbest"}</div>
                <div><strong>Max boyut:</strong> {imageSpecs.maxSize}</div>
              </div>
              {imageSpecs.recommendations && (
                <div className="text-xs text-blue-600">
                  {imageSpecs.recommendations.map((rec, index) => (
                    <div key={index}>{rec}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* URL Input Alternative (if enabled) */}
        {showUrlInput && (
          <div className="mt-4">
            <Label htmlFor="image-url">Veya Görsel URL'si Girin</Label>
            <Input
              id="image-url"
              type="text"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                onImageUpdate(e.target.value);
              }}
              placeholder="https://example.com/image.jpg"
              disabled={disabled}
            />
          </div>
        )}
      </div>
    </div>
  );
}