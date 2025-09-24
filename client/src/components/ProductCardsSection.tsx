import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { useRef, useState, useEffect } from "react";

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

export default function ProductCardsSection() {
  const { data: productCards = [], isLoading } = useQuery<ProductCard[]>({
    queryKey: ["/api/product-cards"],
  });

  // Mouse drag scroll functionality
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    
    // Don't start dragging if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button, a, [role="button"]')) {
      return;
    }
    
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX); // Normal scroll speed
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Scroll functions for navigation arrows
  const scrollLeftButton = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRightButton = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // Filter active cards and sort by sortOrder
  const activeCards = productCards
    .filter(card => card.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // Check initial scroll position when cards load
  useEffect(() => {
    // Check scroll position to show/hide arrows
    const checkScrollPosition = () => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };

    // Handle scroll events
    const handleScroll = () => {
      checkScrollPosition();
    };

    if (scrollRef.current && activeCards.length > 0) {
      checkScrollPosition();
      const element = scrollRef.current;
      element.addEventListener('scroll', handleScroll);
      return () => element.removeEventListener('scroll', handleScroll);
    }
  }, [activeCards]);

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-gray-600">Ürün kartları yükleniyor...</div>
          </div>
        </div>
      </section>
    );
  }

  if (activeCards.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50" data-testid="product-cards-section">
      <div className="container mx-auto px-4 overflow-visible">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Öne Çıkan Ürünler
            </h2>
            <p className="text-gray-600 max-w-2xl">
              En kaliteli ve teknolojik ürünlerimizi keşfedin
            </p>
          </div>
          
          {/* Navigation arrows - only show on desktop when scrollable */}
          <div className="hidden md:flex items-center gap-2 mt-4 md:mt-0">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollLeftButton}
              disabled={!canScrollLeft}
              className={`transition-all duration-200 ${
                canScrollLeft 
                  ? 'text-primary hover:bg-primary hover:text-white border-primary' 
                  : 'text-gray-300 border-gray-200 cursor-not-allowed'
              }`}
              data-testid="scroll-left-button"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={scrollRightButton}
              disabled={!canScrollRight}
              className={`transition-all duration-200 ${
                canScrollRight 
                  ? 'text-primary hover:bg-primary hover:text-white border-primary' 
                  : 'text-gray-300 border-gray-200 cursor-not-allowed'
              }`}
              data-testid="scroll-right-button"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Desktop horizontal scroll with drag */}
        <div 
          ref={scrollRef}
          className="hidden md:flex md:overflow-x-auto md:gap-4 md:pb-4 md:pt-4 scrollbar-hide select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {activeCards.map((card) => (
            <div
              key={card.id}
              className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02] flex-shrink-0 w-72"
              style={{ backgroundColor: card.backgroundColor, pointerEvents: isDragging ? 'none' : 'auto' }}
              data-testid={`product-card-${card.id}`}
            >
              <div className="relative text-white min-h-[550px] flex flex-col">
                {/* Content Section - Top */}
                <div className="text-center space-y-2 p-4 pb-2">
                  <h3 className="text-lg font-bold leading-tight">{card.title}</h3>
                  <p className="text-xs opacity-90 leading-relaxed">
                    {card.subtitle}
                  </p>
                  <p className="text-base font-semibold mb-3">{card.price}</p>
                  
                  {/* Button */}
                  <Link href={card.buttonUrl}>
                    <Button 
                      variant="secondary" 
                      className="bg-white text-gray-900 hover:bg-gray-100 transition-colors px-6 py-2 rounded-full font-medium text-sm"
                      data-testid={`button-${card.id}`}
                    >
                      {card.buttonText}
                    </Button>
                  </Link>
                </div>

                {/* Large Product Image - Bottom - Maximum Space */}
                {card.image && card.image !== "/public-objects/uploads/placeholder-product.jpg" && (
                  <div className="flex-1 flex items-center justify-center min-h-[350px] p-4 overflow-hidden">
                    <img 
                      src={card.image}
                      alt={card.title}
                      className="object-contain drop-shadow-xl transition-transform duration-300 hover:scale-105"
                      style={{ 
                        transform: `scale(${card.imageScale || 1.0})`,
                        objectPosition: `${card.imagePositionX || 50}% ${card.imagePositionY || 50}%`,
                        width: '100%',
                        height: '100%'
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile slider */}
        <div className="md:hidden">
          <div 
            className="flex overflow-x-auto gap-3 pb-4 snap-x snap-mandatory scrollbar-hide"
          >
            {activeCards.map((card) => (
              <div
                key={card.id}
                className="flex-none w-56 rounded-2xl overflow-hidden shadow-lg snap-start"
                style={{ backgroundColor: card.backgroundColor }}
                data-testid={`product-card-mobile-${card.id}`}
              >
                <div className="relative text-white min-h-[460px] flex flex-col">
                  {/* Content Section - Top */}
                  <div className="text-center space-y-1 p-3 pb-2">
                    <h3 className="text-base font-bold leading-tight">{card.title}</h3>
                    <p className="text-xs opacity-90 leading-relaxed">
                      {card.subtitle}
                    </p>
                    <p className="text-sm font-semibold mb-2">{card.price}</p>
                    
                    {/* Button */}
                    <Link href={card.buttonUrl}>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        className="bg-white text-gray-900 hover:bg-gray-100 transition-colors px-4 py-1.5 rounded-full font-medium text-xs"
                        data-testid={`button-mobile-${card.id}`}
                      >
                        {card.buttonText}
                      </Button>
                    </Link>
                  </div>

                  {/* Large Product Image - Bottom - Maximum Space */}
                  {card.image && card.image !== "/public-objects/uploads/placeholder-product.jpg" && (
                    <div className="flex-1 flex items-center justify-center min-h-[280px] p-3 overflow-hidden">
                      <img 
                        src={card.image}
                        alt={card.title}
                        className="object-contain drop-shadow-xl transition-transform duration-300 hover:scale-105"
                        style={{ 
                          transform: `scale(${card.imageScale || 1.0})`,
                          objectPosition: `${card.imagePositionX || 50}% ${card.imagePositionY || 50}%`,
                          width: '100%',
                          height: '100%'
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}