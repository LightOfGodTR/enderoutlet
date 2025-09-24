import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

interface SliderItem {
  id: string;
  title: string;
  subtitle: string;
  buttonText: string;
  link: string;
  image: string;
  isActive: boolean;
  order: number;
}

export default function HeroSlider() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  // Fetch slider data from admin
  const { data: sliders = [], isLoading } = useQuery<SliderItem[]>({
    queryKey: ["/api/admin/sliders"],
  });

  // Filter only active slides and sort by order
  const activeSlides = sliders
    .filter(slide => slide.isActive)
    .sort((a, b) => a.order - b.order);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const [prevTranslate, setPrevTranslate] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  // Preload all slider images on mount
  useEffect(() => {
    if (activeSlides.length > 0) {
      activeSlides.forEach((slide, index) => {
        if (index < 3) { // Preload first 3 images
          const img = new Image();
          img.src = slide.image;
        }
      });
    }
  }, [activeSlides]);

  // Auto-play functionality
  useEffect(() => {
    if (activeSlides.length > 1 && !isDragging) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [activeSlides.length, isDragging]);

  // Show loading state
  if (isLoading) {
    return (
      <section className="relative h-screen bg-gray-200 flex items-center justify-center">
        <div className="text-gray-600">Slider yükleniyor...</div>
      </section>
    );
  }

  // Show message if no active slides
  if (activeSlides.length === 0) {
    return (
      <section className="relative h-screen bg-gray-200 flex items-center justify-center">
        <div className="text-center text-gray-600">
          <h2 className="text-2xl font-bold mb-2">Slider Yok</h2>
          <p>Admin panelinden slider ekleyebilirsiniz</p>
        </div>
      </section>
    );
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Touch and mouse drag handlers
  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setHasMoved(false);
    setStartPos(clientX);
    setPrevTranslate(currentTranslate);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    const currentPosition = clientX;
    const diff = currentPosition - startPos;
    
    // Mark as moved if there's significant movement
    if (Math.abs(diff) > 5) {
      setHasMoved(true);
    }
    
    const dragAmount = diff * 0.6; // Reduce drag sensitivity for smoother interaction
    setCurrentTranslate(prevTranslate + dragAmount);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    const movedBy = currentTranslate - prevTranslate;
    
    // Determine if swipe was significant enough
    if (Math.abs(movedBy) > 80) {
      if (movedBy < 0) {
        // Swiped left - next slide
        setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
      } else {
        // Swiped right - previous slide
        setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
      }
    }
    
    // Reset translate values smoothly
    setCurrentTranslate(0);
    setPrevTranslate(0);
    
    // Reset moved flag after a short delay
    setTimeout(() => setHasMoved(false), 100);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleDragEnd();
    }
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Handle click navigation
  const handleSlideClick = async (slide: SliderItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only navigate if there was no significant movement (not a drag)
    if (!hasMoved && slide.link) {
      // Record slider click before navigation
      try {
        await apiRequest("/api/statistics/slider-click", "POST", {
          sliderId: slide.id,
          sliderType: "main",
          userId: user?.id || null,
          ipAddress: null, // Backend will handle IP detection
          userAgent: navigator.userAgent,
        });
      } catch (error) {
        // Silently handle tracking errors - don't impact user experience
        console.log("Slider click tracking failed:", error);
      }
      
      setLocation(slide.link);
    }
  };

  return (
    <section 
      className="relative overflow-hidden select-none h-screen full-width"
      style={{ 
        WebkitBackfaceVisibility: 'hidden',
        WebkitPerspective: '1000px',
        transform: 'translateZ(0)'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slider Container - Full Screen Images Only */}
      <div className="relative w-full h-full">
        {activeSlides.map((slide, index) => (
          <div
            key={slide.id}
            className="absolute inset-0 w-full h-full"
            style={{
              transform: isDragging 
                ? `translate3d(${(index - currentSlide) * 100 + (currentTranslate / window.innerWidth) * 100}%, 0, 0)` 
                : `translate3d(${(index - currentSlide) * 100}%, 0, 0)`,
              transition: isDragging ? 'none' : 'transform 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              willChange: 'transform'
            }}
          >
            {/* Clickable full-screen image */}
            <div 
              className="block w-full h-full cursor-pointer"
              onClick={(e) => handleSlideClick(slide, e)}
              style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
            >
              <img
                src={slide.image}
                alt=""
                className="w-full h-full object-cover"
                draggable={false}
                loading={index === 0 ? "eager" : "lazy"}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {activeSlides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 border border-white/70 hover:border-white rounded-full p-3 transition-all duration-200 hover:scale-110 backdrop-blur-sm bg-white/10"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 border border-white/70 hover:border-white rounded-full p-3 transition-all duration-200 hover:scale-110 backdrop-blur-sm bg-white/10"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {activeSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide
                  ? "bg-white"
                  : "bg-white/50 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}