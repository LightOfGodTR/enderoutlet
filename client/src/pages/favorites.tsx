import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart } from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useToast } from "@/hooks/use-toast";

export default function FavoritesPage() {
  const { favorites, isLoading, toggleFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Favoriler</h1>
            <p className="text-gray-600 mb-8">Favori ürünlerinizi görmek için giriş yapın.</p>
            <Link href="/login">
              <Button className="bg-primary hover:bg-primary/90">
                Giriş Yap
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-64 mx-auto"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!favorites || favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Favorileriniz Boş</h1>
            <p className="text-gray-600 mb-8">Henüz favori ürününüz yok. Beğendiğiniz ürünleri favorilere ekleyin!</p>
            <Link href="/products">
              <Button className="bg-primary hover:bg-primary/90">
                Ürünleri Keşfet
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = (productId: string, productName: string) => {
    addToCart(productId, 1);
    toast({
      title: "Sepete eklendi",
      description: `${productName} sepete eklendi.`,
    });
  };

  const handleRemoveFavorite = (productId: string, productName: string) => {
    toggleFavorite(productId);
    toast({
      title: "Favorilerden çıkarıldı",
      description: `${productName} favorilerden çıkarıldı.`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="bg-gray-900 text-white py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-xl font-semibold">Favorilerim ({favorites.length} ürün)</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((favorite: any) => (
            <div key={favorite.id} className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-gray-100 relative">
                {favorite.product?.image && (
                  <img
                    src={favorite.product.image}
                    alt={favorite.product.name}
                    className="w-full h-full object-cover"
                  />
                )}
                <button
                  onClick={() => handleRemoveFavorite(favorite.productId, favorite.product?.name || 'Ürün')}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                >
                  <Heart className="h-5 w-5 text-red-500 fill-current" />
                </button>
              </div>
              
              <div className="p-4">
                <div className="mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">
                    {favorite.product?.name || 'Ürün'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {favorite.product?.brand || 'Arçelik'}
                  </p>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="text-lg font-bold text-primary">
                    {favorite.product?.price ? 
                      parseFloat(favorite.product.price).toLocaleString('tr-TR') : '0'} ₺
                  </div>
                  {favorite.product?.originalPrice && 
                   parseFloat(favorite.product.originalPrice) > parseFloat(favorite.product.price) && (
                    <div className="text-sm text-gray-500 line-through">
                      {parseFloat(favorite.product.originalPrice).toLocaleString('tr-TR')} ₺
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Link href={`/product/${favorite.productId}`}>
                    <Button variant="outline" className="w-full">
                      Ürünü İncele
                    </Button>
                  </Link>
                  <Button
                    onClick={() => handleAddToCart(favorite.productId, favorite.product?.name || 'Ürün')}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Sepete Ekle
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}