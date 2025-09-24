import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Image as ImageIcon, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// import { apiRequest } from "@/lib/queryClient"; // Not needed for direct upload

interface SliderImageUploaderProps {
  currentImage: string;
  onImageUpdate: (newImageUrl: string) => void;
  disabled?: boolean;
}

export function SliderImageUploader({ 
  currentImage, 
  onImageUpdate, 
  disabled 
}: SliderImageUploaderProps) {
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

    // Validate file size (max 10MB for 4K images)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Hata", 
        description: "Dosya boyutu maksimum 10MB olabilir. Tam ekran slider için 1920x1080px veya 4K kalitesinde görseller önerilir.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload file directly using form data
      const formData = new FormData();
      formData.append('image', file);
      
      const uploadResponse = await fetch('/api/admin/slider-upload-image', {
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

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="image-upload">Slider Görseli</Label>
        
        {/* Current Image Preview */}
        {imageUrl && (
          <div className="mt-2 mb-3">
            <img
              src={imageUrl}
              alt="Slider preview"
              className="w-full h-32 object-cover rounded-lg border border-gray-200"
            />
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
        <div className="mt-2 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-2">
            <ImageIcon className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Önerilen Görsel Özellikleri:</p>
              <ul className="text-xs space-y-1 text-blue-600">
                <li>• Boyut: 1920x1080 piksel (16:9 oran)</li>
                <li>• Format: JPG, PNG, WebP</li>
                <li>• Dosya boyutu: Maksimum 5MB</li>
                <li>• Çözünürlük: En az 1200px genişlik</li>
                <li>• İçerik: Yatay kompozisyon önerilir</li>
              </ul>
            </div>
          </div>
        </div>

        {/* URL Input Alternative - Removed as requested by user */}
      </div>
    </div>
  );
}