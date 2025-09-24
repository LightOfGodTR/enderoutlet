import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Trash2, Minus, Plus, LogIn, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function CartPage() {
  const { cartItems, cartTotal, updateQuantity, removeFromCart, cartItemCount, isLoading } = useCart();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(id, newQuantity);
  };

  const handleRemoveItem = (id: string, productName: string) => {
    removeFromCart(id);
    toast({
      title: "Ürün sepetten çıkarıldı",
      description: `${productName} sepetinizden çıkarıldı.`,
    });
  };

  const handleCheckout = () => {
    // Navigate to checkout page with virtual POS
    window.location.href = '/checkout';
  };

  if (authLoading || isLoading) {
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
          <div className="text-center max-w-sm sm:max-w-md mx-auto">
            <div className="bg-blue-50 rounded-full p-3 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
              <LogIn className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Sepetinizi görüntülemek için giriş yapın</h1>
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 leading-relaxed">
              Sepetinizdeki ürünleri görebilmek ve alışverişinizi tamamlayabilmek için önce giriş yapmanız gerekiyor.
            </p>
            <div className="space-y-3">
              <Link href="/login">
                <Button className="w-full bg-primary hover:bg-primary/90" data-testid="button-login">
                  Giriş yap
                </Button>
              </Link>
              <p className="text-xs sm:text-sm text-gray-500">
                Henüz üye değil misiniz?{" "}
                <Link href="/register" className="text-primary hover:underline" data-testid="link-register">
                  Üyelik oluşturun
                </Link>
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
          <div className="text-center max-w-sm sm:max-w-md mx-auto">
            <div className="bg-gray-100 rounded-full p-6 sm:p-8 w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
              <ShoppingCart className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Sepetiniz boş</h1>
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 leading-relaxed">Sepetinizde henüz ürün bulunmuyor. Alışverişe başlayın!</p>
            <Link href="/">
              <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                Alışverişe başla
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="bg-gray-900 text-white py-3 sm:py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-lg sm:text-xl font-semibold">Sepetim ({cartItemCount} ürün)</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              {cartItems.map((item: any, index) => (
                <div key={item.id} className={`p-6 ${index !== cartItems.length - 1 ? 'border-b' : ''}`}>
                  <div className="flex items-start space-x-4">
                    <Link href={`/product/${item.product?.id || ''}`}>
                      <img
                        src={item.product?.image || '/placeholder.jpg'}
                        alt={item.product?.name || 'Ürün'}
                        className="w-24 h-24 object-cover rounded-lg bg-gray-100 cursor-pointer hover:opacity-75 transition-opacity"
                      />
                    </Link>
                    
                    <div className="flex-1">
                      <Link href={`/product/${item.product?.id || ''}`}>
                        <h3 className="font-semibold text-gray-900 mb-1 cursor-pointer hover:text-primary transition-colors">
                          {item.product?.name || 'Bilinmeyen Ürün'}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600 mb-4">
                        {item.product?.description || ''}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center border border-gray-300 rounded">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="p-2 hover:bg-gray-100 transition-colors"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="px-4 py-2 min-w-[3rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="p-2 hover:bg-gray-100 transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => handleRemoveItem(item.id, item.product?.name || 'Ürün')}
                            className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">
                            {(() => {
                              const price = item.product?.price;
                              const basePrice = price ? (typeof price === 'number' ? price : parseFloat(price.toString())) * item.quantity : 0;
                              const warrantyPrice = item.warrantyPrice || 0; // Use warranty price from backend
                              
                              const totalPrice = basePrice + warrantyPrice;
                              return totalPrice.toLocaleString('tr-TR', {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                              });
                            })()} ₺
                          </div>
                          {item.warranty && item.warranty !== 'none' && (
                            <div className="text-xs text-green-600 mt-1">
                              + {item.warranty === '1year' ? '1 Yıl' : item.warranty === '2year' ? '2 Yıl' : item.warranty === '3year' ? '3 Yıl' : '4 Yıl'} Ek Garanti
                              {item.warrantyPrice && item.warrantyPrice > 0 && (
                                <span> ({item.warrantyPrice.toLocaleString('tr-TR', {
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0
                                })} ₺)</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-semibold mb-4">Sipariş Özeti</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span>{cartItemCount} ürün</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Ürün toplamı</span>
                  <span>{(() => {
                    const productTotal = cartItems.reduce((total: number, item: any) => {
                      const price = item.product?.price;
                      const basePrice = price ? (typeof price === 'number' ? price : parseFloat(price.toString())) * item.quantity : 0;
                      return total + basePrice;
                    }, 0);
                    return productTotal.toLocaleString('tr-TR');
                  })()} TL</span>
                </div>
                
                {(() => {
                  const warrantyTotal = cartItems.reduce((total: number, item: any) => {
                    return total + (item.warrantyPrice || 0);
                  }, 0);
                  
                  return warrantyTotal > 0 ? (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Ek garanti</span>
                      <span>+{warrantyTotal.toLocaleString('tr-TR')} TL</span>
                    </div>
                  ) : null;
                })()}
                
                <div className="flex justify-between text-sm">
                  <span>Kargo</span>
                  <span className="text-green-600">Ücretsiz</span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Toplam</span>
                    <span className="text-primary">{cartTotal.toLocaleString('tr-TR')} TL</span>
                  </div>
                </div>
              </div>


              <Button
                onClick={handleCheckout}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3"
disabled={false}
              >
                Sepeti Onayla
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}