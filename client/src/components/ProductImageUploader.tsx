import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, ChevronLeft, ChevronRight } from "lucide-react";

interface ProductImageUploaderProps {
  currentImages: string[];
  onImagesUpdate: (newImages: string[]) => void;
  disabled?: boolean;
}

export default function ProductImageUploader({ 
  currentImages, 
  onImagesUpdate, 
  disabled 
}: ProductImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [images, setImages] = useState<string[]>(currentImages || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { toast } = useToast();

  // Sync with currentImages prop when it changes
  useEffect(() => {
    setImages(currentImages || []);
    setCurrentIndex(0);
  }, [currentImages]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if we already have 4 images
    if (images.length >= 4) {
      toast({
        title: "Limit Aşıldı",
        description: "En fazla 4 fotoğraf yükleyebilirsiniz.",
        variant: "destructive",
      });
      return;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Dosya Çok Büyük",
        description: "Fotoğraf boyutu 5MB'dan küçük olmalıdır.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload file directly using form data
      const formData = new FormData();
      formData.append('image', file);
      
      const uploadResponse = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const result = await uploadResponse.json();
      const publicImageUrl = result.imageUrl;

      const newImages = [...images, publicImageUrl];
      setImages(newImages);
      onImagesUpdate(newImages);

      toast({
        title: "Başarılı",
        description: "Fotoğraf başarıyla yüklendi.",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Hata",
        description: "Fotoğraf yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the input
      if (event.target) event.target.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    const newImages = images.filter((_, index) => index !== indexToRemove);
    setImages(newImages);
    onImagesUpdate(newImages);
    
    // Adjust current index if necessary
    if (currentIndex >= newImages.length) {
      setCurrentIndex(Math.max(0, newImages.length - 1));
    } else if (indexToRemove <= currentIndex && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
    
    toast({
      title: "Fotoğraf Silindi",
      description: "Fotoğraf başarıyla kaldırıldı.",
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="images-upload">Ürün Fotoğrafları ({images.length}/4)</Label>
        
        {/* Current Images Preview */}
        {images.length > 0 && (
          <div className="mt-2 mb-3">
            {images.length === 1 ? (
              <div className="relative group">
                <img
                  src={images[0]}
                  alt={`Ürün fotoğrafı 1`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(0)}
                  disabled={disabled}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <div className="relative group">
                <img
                  src={images[currentIndex]}
                  alt={`Ürün fotoğrafı ${currentIndex + 1}`}
                  className="w-full h-48 object-cover rounded-lg border border-gray-200"
                />
                
                {/* Navigation Arrows */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)}
                  disabled={disabled}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
                  disabled={disabled}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                
                {/* Delete Button */}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(currentIndex)}
                  disabled={disabled}
                >
                  <X className="w-3 h-3" />
                </Button>
                
                {/* Image Indicators */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentIndex 
                          ? "bg-white" 
                          : "bg-white/50 hover:bg-white/70"
                      }`}
                      onClick={() => setCurrentIndex(index)}
                      disabled={disabled}
                    />
                  ))}
                </div>
                
                {/* Image Counter */}
                <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  {currentIndex + 1}/{images.length}
                </div>
              </div>
            )}
          </div>
        )}

        {/* File Upload */}
        <div className="flex gap-2">
          <Input
            id="images-upload"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={disabled || isUploading || images.length >= 4}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            disabled={disabled || isUploading || images.length >= 4}
            onClick={() => document.getElementById('images-upload')?.click()}
          >
            <Upload className="w-4 h-4 mr-1" />
            {isUploading ? "Yükleniyor..." : images.length >= 4 ? "Limit Doldu" : "Ekle"}
          </Button>
        </div>

        {images.length < 4 && (
          <p className="text-sm text-gray-500 mt-1">
            {4 - images.length} fotoğraf daha ekleyebilirsiniz
          </p>
        )}
      </div>
    </div>
  );
}