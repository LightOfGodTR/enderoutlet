import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductCarouselProps {
  images: string[];
  alt: string;
  className?: string;
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
}

export default function ProductCarousel({ 
  images, 
  alt, 
  className = "",
  currentIndex: externalIndex,
  onIndexChange 
}: ProductCarouselProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));
  
  // Use external index if provided, otherwise use internal state
  const currentIndex = externalIndex !== undefined ? externalIndex : internalIndex;

  // Preload all images on mount for faster switching
  useEffect(() => {
    if (!images || images.length <= 1) return;
    
    // Immediately preload all images for better performance
    images.forEach((imageSrc, idx) => {
      if (!loadedImages.has(idx)) {
        const img = new Image();
        img.onload = () => {
          setLoadedImages(prev => new Set(prev).add(idx));
        };
        img.src = imageSrc;
      }
    });
  }, [images, loadedImages]);

  if (!images || images.length === 0) {
    return (
      <div className={`bg-gray-200 rounded-lg flex items-center justify-center ${className}`}>
        <span className="text-gray-400">No image</span>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <img
        src={images[0]}
        alt={alt}
        className={`w-full h-full object-cover rounded-lg ${className}`}
        loading="eager"
      />
    );
  }

  const nextImage = () => {
    const newIndex = (currentIndex + 1) % images.length;
    if (onIndexChange) {
      onIndexChange(newIndex);
    } else {
      setInternalIndex(newIndex);
    }
  };

  const prevImage = () => {
    const newIndex = (currentIndex - 1 + images.length) % images.length;
    if (onIndexChange) {
      onIndexChange(newIndex);
    } else {
      setInternalIndex(newIndex);
    }
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Hidden preload images */}
      {images.map((src, index) => (
        index !== currentIndex && (
          <img
            key={`preload-${index}`}
            src={src}
            alt=""
            className="hidden"
            loading="lazy"
          />
        )
      ))}
      
      <img
        src={images[currentIndex]}
        alt={`${alt} ${currentIndex + 1}`}
        className="w-full h-full object-contain rounded-lg transition-opacity duration-200"
        loading="eager"
      />
      
      {/* Navigation Buttons */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-100 z-10"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          prevImage();
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-100 z-10"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          nextImage();
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
      
      {/* Image Indicators */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
        {images.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors duration-100 ${
              index === currentIndex 
                ? "bg-white" 
                : "bg-white/50 hover:bg-white/70"
            }`}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onIndexChange) {
                onIndexChange(index);
              } else {
                setInternalIndex(index);
              }
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          />
        ))}
      </div>
      
      {/* Image Counter */}
      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
        {currentIndex + 1}/{images.length}
      </div>
    </div>
  );
}