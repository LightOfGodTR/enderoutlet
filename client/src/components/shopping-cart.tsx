import { Minus, Plus, Trash2, X, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";

export default function ShoppingCartPanel() {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    cartTotal,
    cartItemCount,
  } = useCart();

  const handleProductClick = (productId: string) => {
    console.log('Product clicked:', productId);
    setIsCartOpen(false);
    window.location.href = `/product/${productId}`;
  };


  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-50"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Cart Panel */}
      <div className="cart-panel fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Sepetim</h2>
            {cartItemCount > 0 && (
              <Badge variant="secondary">{cartItemCount}</Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sepetiniz boş
              </h3>
              <p className="text-gray-600 mb-4">
                Alışverişe başlamak için ürün ekleyin
              </p>
              <Button onClick={() => setIsCartOpen(false)} className="btn-primary">
                Alışverişe Başla
              </Button>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  {/* Ürün resmi - tıklanabilir */}
                  <img
                    src={item.product?.image}
                    alt={item.product?.name}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0 cursor-pointer hover:opacity-75 transition-opacity"
                    onClick={() => handleProductClick(item.product?.id || '')}
                  />
                  
                  {/* Ürün detayları - tıklanabilir */}
                  <div 
                    className="flex-1 min-w-0 cursor-pointer hover:bg-gray-50 rounded p-2 transition-colors"
                    onClick={() => handleProductClick(item.product?.id || '')}
                  >
                    <h4 
                      className="font-semibold text-sm text-gray-900 line-clamp-2 hover:text-primary cursor-pointer"
                      onClick={() => handleProductClick(item.product?.id || '')}
                    >
                      {item.product?.name}
                    </h4>
                    <p className="text-sm text-primary font-semibold mt-1">
                      {item.product?.price ? parseFloat(item.product.price).toLocaleString('tr-TR') : 0} ₺
                    </p>
                  </div>

                  {/* Kontrol alanı - tıklanabilir değil */}
                  <div className="flex flex-col items-end space-y-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="h-7 w-7 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      
                      <span className="text-sm font-medium w-8 text-center">
                        {item.quantity}
                      </span>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-7 w-7 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <Separator />
            
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Toplam:</span>
              <span className="text-xl font-bold text-primary">
                {cartTotal.toLocaleString('tr-TR')} ₺
              </span>
            </div>
            
            <Button className="w-full btn-primary" size="lg">
              Sepeti Onayla
            </Button>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsCartOpen(false)}
            >
              Alışverişe Devam Et
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
