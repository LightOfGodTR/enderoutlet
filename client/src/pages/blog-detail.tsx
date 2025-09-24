import { useEffect } from "react";
import { Link, useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  User, 
  Eye, 
  ArrowLeft, 
  Clock, 
  Share2,
  BookOpen,
  Tag,
  ChevronRight 
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
  updatedAt: string;
  viewCount?: number;
  categoryId?: string;
  authorId: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    description?: string;
  };
  author?: {
    name: string;
    email: string;
  };
  tags?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

export default function BlogDetail() {
  const [match, params] = useRoute("/blog/:slug");
  const slug = params?.slug;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();


  // Blog yazısını getir
  const { data: blogPost, isLoading, error } = useQuery<BlogPost>({
    queryKey: ['/api/blog', slug],
    enabled: !!slug,
  });

  // İlgili yazıları getir
  const { data: relatedPosts = [] } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog-posts', 'related', blogPost?.categoryId],
    enabled: !!blogPost?.categoryId,
  });

  // Görüntülenme sayısını artır
  const incrementViewMutation = useMutation({
    mutationFn: (postId: string) => apiRequest(`/api/blog-posts/${postId}/view`, 'POST', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog', slug] });
    },
  });

  // Sayfa yüklendiğinde görüntülenme sayısını artır
  useEffect(() => {
    if (blogPost?.id) {
      incrementViewMutation.mutate(blogPost.id);
    }
  }, [blogPost?.id]);

  // SEO meta tags güncelle
  useEffect(() => {
    if (blogPost) {
      document.title = blogPost.metaTitle || `${blogPost.title} | Arçelik Blog`;
      
      // Meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', blogPost.metaDescription || blogPost.excerpt || '');
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = blogPost.metaDescription || blogPost.excerpt || '';
        document.head.appendChild(meta);
      }

      // Meta keywords
      if (blogPost.metaKeywords) {
        const metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords) {
          metaKeywords.setAttribute('content', blogPost.metaKeywords);
        } else {
          const meta = document.createElement('meta');
          meta.name = 'keywords';
          meta.content = blogPost.metaKeywords;
          document.head.appendChild(meta);
        }
      }

      // Open Graph tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', blogPost.title);
      } else {
        const meta = document.createElement('meta');
        meta.setAttribute('property', 'og:title');
        meta.content = blogPost.title;
        document.head.appendChild(meta);
      }

      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', blogPost.excerpt || '');
      } else {
        const meta = document.createElement('meta');
        meta.setAttribute('property', 'og:description');
        meta.content = blogPost.excerpt || '';
        document.head.appendChild(meta);
      }

      if (blogPost.featuredImage) {
        const ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage) {
          ogImage.setAttribute('content', blogPost.featuredImage);
        } else {
          const meta = document.createElement('meta');
          meta.setAttribute('property', 'og:image');
          meta.content = blogPost.featuredImage;
          document.head.appendChild(meta);
        }
      }
    }

    // Cleanup function
    return () => {
      document.title = 'Arçelik - Kaliteli Beyaz Eşya ve Elektronik';
    };
  }, [blogPost]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = blogPost?.title || '';

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
      } catch (error) {
        // Kullanıcı paylaşımı iptal etmiş olabilir
      }
    } else {
      // Fallback: URL'yi clipboard'a kopyala
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Bağlantı kopyalandı",
          description: "Blog yazısının bağlantısı panoya kopyalandı",
        });
      } catch (error) {
        toast({
          title: "Hata",
          description: "Bağlantı kopyalanamadı",
          variant: "destructive",
        });
      }
    }
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(' ').length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} dakika okuma`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !blogPost) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Blog yazısı bulunamadı
            </h1>
            <p className="text-gray-600 mb-6">
              Aradığınız blog yazısı mevcut değil veya kaldırılmış olabilir.
            </p>
            <Button onClick={() => setLocation('/blog')} data-testid="back-to-blog-button">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Blog Sayfasına Dön
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // İlgili yazıları filtrele (mevcut yazıyı hariç tut ve sadece yayında olanları al)
  const filteredRelatedPosts = relatedPosts
    .filter((post: BlogPost) => post.id !== blogPost.id && post.status === 'published')
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section with Featured Image */}
      {blogPost.featuredImage && (
        <div className="relative h-[400px] overflow-hidden">
          <img
            src={blogPost.featuredImage}
            alt={blogPost.title}
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black bg-opacity-40" />
          
          {/* Breadcrumb overlaid on hero image */}
          <nav className="absolute top-6 left-0 right-0 z-10" data-testid="breadcrumb">
            <div className="container mx-auto px-4">
              <div className="flex items-center space-x-2 text-sm text-white">
                <Link href="/blog" className="hover:text-gray-200 transition-colors">
                  Blog
                </Link>
                <ChevronRight className="w-4 h-4" />
                {blogPost.category && (
                  <>
                    <span>{blogPost.category.name}</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
                <span className="text-gray-200 truncate">{blogPost.title}</span>
              </div>
            </div>
          </nav>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => setLocation('/blog')}
          data-testid="back-to-blog"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Blog Sayfasına Dön
        </Button>

        <article className="max-w-4xl mx-auto">
          {/* Article Header */}
          <header className="mb-12">
            {/* Category Badge */}
            {blogPost.category && (
              <div className="mb-6">
                <Badge className="bg-red-500 text-white border-0 text-sm font-medium px-4 py-2">
                  {blogPost.category.name}
                </Badge>
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight" data-testid="blog-title">
              {blogPost.title}
            </h1>

            {/* Excerpt */}
            {blogPost.excerpt && (
              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl" data-testid="blog-excerpt">
                {blogPost.excerpt}
              </p>
            )}

            {/* Article Meta */}
            <div className="flex flex-wrap items-center justify-between border-y border-gray-200 py-4 mb-8">
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(blogPost.publishedAt || blogPost.createdAt)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{getReadingTime(blogPost.content)}</span>
                </div>

                {blogPost.viewCount && (
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span data-testid="view-count">{blogPost.viewCount} görüntülenme</span>
                  </div>
                )}
              </div>

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleShare}
                className="text-gray-500 hover:text-primary flex items-center gap-2"
                data-testid="share-button"
              >
                <Share2 className="w-4 h-4" />
                Paylaş
              </Button>
            </div>
          </header>

          {/* Article Content - Enhanced Typography */}
          <div 
            className="prose prose-lg prose-gray max-w-none mb-12 
                       prose-headings:font-bold prose-headings:text-gray-900 
                       prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6
                       prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
                       prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
                       prose-ul:my-6 prose-li:my-2 prose-li:text-gray-700
                       prose-strong:text-gray-900 prose-strong:font-semibold
                       prose-img:rounded-lg prose-img:shadow-lg prose-img:my-8"
            dangerouslySetInnerHTML={{ __html: blogPost.content }}
            data-testid="blog-content"
          />

          {/* Article Tags */}
          {blogPost.tags && blogPost.tags.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-6 mb-12">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5 text-gray-600" />
                <span className="text-lg font-semibold text-gray-900">Etiketler</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {blogPost.tags.map((tag) => (
                  <Badge 
                    key={tag.id} 
                    variant="outline" 
                    className="text-sm px-3 py-1 border-gray-300 hover:bg-primary hover:text-white transition-colors cursor-pointer" 
                    data-testid={`tag-${tag.slug}`}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Author Info (if available) */}
          {blogPost.author && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8 mb-12 border border-gray-200">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1" data-testid="author-name">
                    {blogPost.author.name}
                  </h3>
                  <p className="text-gray-600 font-medium">Arçelik İçerik Editörü</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Ev yaşamını kolaylaştıran teknolojiler hakkında uzman içerikler hazırlıyor.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Related Posts */}
          {filteredRelatedPosts.length > 0 && (
            <section className="border-t border-gray-200 pt-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                İlgili Blog Yazıları
              </h2>
              
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {filteredRelatedPosts.map((post: BlogPost) => (
                  <Card 
                    key={post.id}
                    className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md overflow-hidden"
                    onClick={() => setLocation(`/blog/${post.slug}`)}
                    data-testid={`related-post-${post.slug}`}
                  >
                    {post.featuredImage && (
                      <div className="relative overflow-hidden h-48">
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    )}
                    
                    <CardHeader className="pb-3">
                      {post.category && (
                        <Badge className="bg-red-500 text-white border-0 text-xs font-medium px-2 py-1 w-fit mb-2">
                          {post.category.name}
                        </Badge>
                      )}
                      
                      <CardTitle className="text-lg font-bold group-hover:text-red-500 transition-colors duration-300 line-clamp-2 leading-tight">
                        {post.title}
                      </CardTitle>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                      </div>
                    </CardHeader>

                    {post.excerpt && (
                      <CardContent>
                        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                          {post.excerpt}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
              
              {/* See All Posts Button */}
              <div className="text-center mt-10">
                <Button 
                  onClick={() => setLocation('/blog')}
                  className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full font-semibold"
                >
                  Tüm Blog Yazılarını Gör
                </Button>
              </div>
            </section>
          )}
        </article>
      </main>
      
      <Footer />
    </div>
  );
}