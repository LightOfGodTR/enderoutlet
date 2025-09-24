import { Card, CardContent } from "@/components/ui/card";
import type { Product } from "@shared/schema";
import { Link } from "wouter";
import ProductCarousel from "@/components/ProductCarousel";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // İndirim var mı kontrolü (originalPrice var ve price > 0 ve farklı)
  const hasDiscount = product.originalPrice && 
    parseFloat(product.originalPrice) > 0 && 
    parseFloat(product.price) > 0 && 
    parseFloat(product.price) !== parseFloat(product.originalPrice);
  
  // İndirim yüzdesini hesapla
  const discountPercentage = hasDiscount 
    ? Math.round(((parseFloat(product.originalPrice || "0") - parseFloat(product.price)) / parseFloat(product.originalPrice || "0")) * 100)
    : 0;

  // Gösterilecek fiyat (price = 0 ise originalPrice kullan, değilse price)
  const displayPrice = parseFloat(product.price) === 0 && product.originalPrice 
    ? parseFloat(product.originalPrice) 
    : parseFloat(product.price);

  return (
    <Link href={`/product/${product.id}`}>
      <Card className="product-card group cursor-pointer hover:shadow-lg transition-all duration-300 h-full">
        <CardContent className="p-0 flex flex-col h-full">
          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden bg-gray-50 rounded-t-lg">
            <ProductCarousel
              images={product.images && product.images.length > 0 ? product.images : [product.image]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {/* İndirim rozeti */}
            {hasDiscount && (
              <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-500 text-white text-xs sm:text-sm font-bold px-2 py-1 sm:px-3 sm:py-1.5 rounded z-10 shadow-lg">
                %{discountPercentage} İndirim
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 flex-1 flex flex-col">
            <div className="flex-1">
              <h3 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-3 group-hover:text-primary transition-colors mb-1 sm:mb-2">
                {product.name}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 hidden sm:block">
                {product.description}
              </p>
            </div>

            {/* Price and Stock */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <span className="text-base sm:text-lg font-bold text-primary">
                      {displayPrice.toLocaleString('tr-TR')} TL
                    </span>
                    {hasDiscount && (
                      <span className="text-xs sm:text-sm text-gray-500 line-through">
                        {parseFloat(product.originalPrice || "0").toLocaleString('tr-TR')} TL
                      </span>
                    )}
                  </div>
                  
                  {/* Stock Status */}
                  <div className="text-xs sm:text-sm">
                    {product.inStock ? (
                      <span className="text-green-600 font-medium">✓ Stokta var</span>
                    ) : (
                      <span className="text-red-600 font-medium">Stokta yok</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
