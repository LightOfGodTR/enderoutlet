import { useState, useEffect } from "react";
import { Link, useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  Eye, 
  ArrowLeft, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight,
  Clock
} from "lucide-react";

// Sabit kategori renk haritası
const getCategoryColor = (categoryName: string) => {
  const colorMap: { [key: string]: string } = {
    'Puf Noktası': 'bg-purple-400',
    'Alışveriş': 'bg-blue-500', 
    'Dekorasyon ve Tasarım': 'bg-pink-400',
    'Destek ve Bilgi Merkezi': 'bg-orange-400',
    'Teknoloji': 'bg-yellow-400',
    'Sürdürülebilirlik': 'bg-green-400',
    'Mucize Lezzetler': 'bg-red-600',
    'Kahve İçecekleri': 'bg-purple-400',
  };
  return colorMap[categoryName] || 'bg-purple-400';
};

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  status: 'draft' | 'published';
  publishedAt?: string;
  createdAt: string;
  viewCount?: number;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
  };
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
}

interface BlogSlider {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  tagText: string;
  tagColor: string;
  overlayOpacity: number;
  isActive: boolean;
  order: number;
}

// Blog Post Card Component
function BlogPostCard({ post }: { post: BlogPost }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Link to={`/blog/${post.slug}`} className="block">
      <Card 
        className="group hover:shadow-lg transition-all duration-300 cursor-pointer h-full"
        data-testid={`blog-post-${post.slug}`}
      >
        {post.featuredImage && (
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {post.category && (
            <Badge 
              className={`${getCategoryColor(post.category.name)} text-white border-0 absolute top-3 left-3`}
            >
              {post.category.name}
            </Badge>
          )}
        </div>
        )}
        
        <CardHeader>
        <CardTitle className="text-lg group-hover:text-primary transition-colors duration-300 line-clamp-2">
          {post.title}
        </CardTitle>
        
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(post.publishedAt || post.createdAt)}</span>
          </div>
          
          {post.viewCount && (
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{post.viewCount} görüntülenme</span>
            </div>
          )}
        </div>
        </CardHeader>

        {post.excerpt && (
          <CardContent>
            <CardDescription className="line-clamp-3">
              {post.excerpt}
            </CardDescription>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}

// Hero Slider Component
function HeroSlider() {
  const { data: activeSliders = [], isLoading } = useQuery<BlogSlider[]>({
    queryKey: ['/api/blog-sliders'],
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (activeSliders.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSliders.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [activeSliders.length, isPaused]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % activeSliders.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + activeSliders.length) % activeSliders.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  if (isLoading || activeSliders.length === 0) {
    return (
      <div className="h-[500px] bg-gray-200 animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Slider yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="relative h-[500px] overflow-hidden bg-white">
      {activeSliders.map((slider, index) => (
        <div
          key={slider.id}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="container mx-auto px-4 h-full flex items-center">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center w-full">
              <div className="space-y-4 lg:order-1">
                <div className="mb-4">
                  <Badge className={`${
                    slider.tagColor === 'red' ? 'bg-red-500' :
                    slider.tagColor === 'orange' ? 'bg-orange-500' :
                    slider.tagColor === 'purple' ? 'bg-purple-500' :
                    slider.tagColor === 'blue' ? 'bg-blue-500' :
                    slider.tagColor === 'green' ? 'bg-green-500' :
                    'bg-red-500'
                  } text-white border-0 text-sm font-medium px-3 py-1`}>
                    {slider.tagText}
                  </Badge>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight text-gray-900">
                  {slider.title}
                </h2>
                {slider.subtitle && (
                  <p className="text-lg mb-6 text-gray-600 leading-relaxed">
                    {slider.subtitle}
                  </p>
                )}
                <Link to={slider.buttonLink}>
                  <Button 
                    className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-6 py-3 inline-flex items-center"
                  >
                    {slider.buttonText}
                  </Button>
                </Link>
              </div>
              
              <div className="lg:order-2 relative">
                <div className="relative w-full h-80 lg:h-96">
                  <img
                    src={slider.image}
                    alt={slider.title}
                    className="w-full h-full object-contain"
                  />
                  <div 
                    className="absolute inset-0 -z-10 rounded-lg"
                    style={{ 
                      backgroundColor: '#f8f9fa',
                      opacity: slider.overlayOpacity / 100 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {activeSliders.length > 1 && (
        <div className="absolute bottom-4 right-4 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={prevSlide}
            className="w-8 h-8 p-0"
            data-testid="slider-prev"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={nextSlide}
            className="w-8 h-8 p-0"
            data-testid="slider-next"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {activeSliders.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {activeSliders.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
              data-testid={`slider-dot-${index}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Category Buttons Component
function CategoryButtons({ 
  categories, 
  selectedCategory, 
  onCategorySelect 
}: { 
  categories: BlogCategory[];
  selectedCategory: string;
  onCategorySelect: (slug: string) => void;
}) {
  const allCategories = [{ name: 'Tümü', slug: '' }, ...categories];

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex gap-2 overflow-x-auto">
          {allCategories.map((category) => (
            <Button
              key={category.slug}
              variant={selectedCategory === category.slug ? "default" : "outline"}
              className={`whitespace-nowrap ${
                selectedCategory === category.slug 
                  ? `${getCategoryColor(category.name)} text-white border-0` 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => onCategorySelect(category.slug)}
              data-testid={`category-button-${category.slug || 'all'}`}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Ana Blog Sayfası
export default function BlogPage() {
  const [location, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("");

  // URL query parametresinden kategori al
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1]);
    const category = urlParams.get('category') || '';
    setSelectedCategory(category);
  }, [location]);

  // Blog yazılarını getir
  const { data: blogPosts = [], isLoading: postsLoading } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog-posts'],
  });

  // Blog kategorilerini getir
  const { data: blogCategories = [] } = useQuery<BlogCategory[]>({
    queryKey: ['/api/blog-categories'],
  });

  // Published blog yazılarını filtrele (draft da dahil et test için)
  const publishedPosts = blogPosts.filter((post: BlogPost) => 
    post.status === 'published' || post.status === 'draft'
  );

  // Kategorilere göre gruplama
  const getPostsByCategory = (categoryId?: string) => {
    if (!categoryId) return publishedPosts;
    return publishedPosts.filter((post: BlogPost) => post.categoryId === categoryId);
  };

  // Seçili kategoriyi slug'a göre bul
  const selectedCategoryObj = selectedCategory 
    ? blogCategories.find(cat => cat.slug === selectedCategory)
    : null;

  const handleCategorySelect = (categorySlug: string) => {
    if (categorySlug) {
      setLocation(`/blog?category=${categorySlug}`);
    } else {
      setLocation('/blog');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Slider */}
      <HeroSlider />

      {/* Kategori Butonları */}
      <CategoryButtons 
        categories={blogCategories}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
      />

      {/* İçerik Alanı */}
      {selectedCategory && selectedCategoryObj ? (
        // Kategori Sayfası
        <div>
          {(() => {
            const category = selectedCategoryObj;
            const bgColor = getCategoryColor(category.name);
            const categoryPosts = getPostsByCategory(category.id);
            
            return (
              <div key={category.id}>
                {/* Hero Section for Category */}
                <div className={`${bgColor} relative h-[300px] flex items-center justify-center`}>
                  {category.image && (
                    <div className="absolute inset-0">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover opacity-30"
                      />
                    </div>
                  )}
                  
                  <div className="relative z-10 text-center text-white">
                    <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                      {category.name}
                    </h1>
                    {category.description && (
                      <p className="text-xl opacity-90 max-w-2xl">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="container mx-auto px-4 py-8">
                  <div className="flex items-center justify-between mb-8">
                    <p className="text-gray-600">
                      {categoryPosts.length} İçerik
                    </p>
                    
                    <Button
                      variant="outline"
                      onClick={() => handleCategorySelect('')}
                      className="text-gray-600"
                    >
                      Tüm Kategoriler
                    </Button>
                  </div>

                  {categoryPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categoryPosts.map((post) => (
                        <BlogPostCard key={post.id} post={post} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Bu kategoride henüz yazı yok
                      </h3>
                      <p className="text-gray-600">
                        {category.name} kategorisinde yazılar yakında eklenecek.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      ) : (
        // Ana Blog Sayfası - Tüm Kategoriler
        <div className="container mx-auto px-4 py-8">
          {blogCategories.length > 0 ? (
            blogCategories.map((category) => {
              const categoryPosts = getPostsByCategory(category.id);
              const bgColor = getCategoryColor(category.name);
              
              return (
                <section key={category.id} className="mb-16">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-4">
                      <span 
                        className={`${bgColor} text-white px-4 py-2 rounded-lg text-lg font-semibold cursor-pointer hover:opacity-80 transition-opacity`}
                        onClick={() => handleCategorySelect(category.slug)}
                      >
                        {category.name}
                      </span>
                    </h2>
                    
                    {categoryPosts.length > 3 && (
                      <Button
                        variant="ghost"
                        className="text-gray-600 hover:text-primary"
                        onClick={() => handleCategorySelect(category.slug)}
                      >
                        Tümünü Gör
                      </Button>
                    )}
                  </div>

                  {categoryPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categoryPosts.slice(0, 3).map((post) => (
                        <BlogPostCard key={post.id} post={post} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        Bu kategoride henüz yazı yok
                      </h3>
                      <p className="text-gray-500 text-sm">
                        {category.name} kategorisinde yazılar yakında eklenecek.
                      </p>
                    </div>
                  )}
                </section>
              );
            })
          ) : (
            !postsLoading && (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Henüz içerik yok
                </h3>
                <p className="text-gray-600">
                  Blog yazıları yakında burada olacak.
                </p>
              </div>
            )
          )}

          {postsLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          )}
        </div>
      )}
      
      <Footer />
    </div>
  );
}