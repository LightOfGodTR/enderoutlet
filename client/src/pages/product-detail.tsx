import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import InstallmentOptions from "@/components/installment-options";
import sepetIcon from "@assets/sepeticon_1757587395289.png";
import whatsappIcon from "@assets/WhatsApp_1757587395289.png";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Heart,
  Star,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Shield,
  Truck,
  Phone,
  MessageSquare,
  Tag,
  Calculator,
  CreditCard,
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useFavorites } from "@/hooks/use-favorites";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { ReviewForm } from "@/components/review-form";
import ProductCarousel from "@/components/ProductCarousel";
import Header from "@/components/header";
import Footer from "@/components/footer";
import type { Product } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorited } = useFavorites();
  const { user, isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedWarranty, setSelectedWarranty] = useState<string | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: [`/api/products/${id}`],
    enabled: !!id,
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<any[]>({
    queryKey: ["/api/reviews", id],
    enabled: !!id,
  });

  const { data: averageRating } = useQuery<{ average: number; count: number }>({
    queryKey: ["/api/reviews", id, "average"],
    enabled: !!id,
  });

  const { data: userReview } = useQuery<any>({
    queryKey: ["/api/reviews", id, "user-review"],
    enabled: !!id && isAuthenticated,
  });

  // Fetch similar products
  const { data: similarProducts = [] } = useQuery<Product[]>({
    queryKey: [`/api/products/${id}/similar`],
    enabled: !!id,
  });

  // Fetch warranty pricing for this product's category - MUST be called before early returns
  const productCategory = product?.category || "";
  const productName = product?.name || "";
  const {
    data: warrantyData,
    error: warrantyError,
    isLoading: warrantyLoading,
  } = useQuery<any>({
    queryKey: [`/api/extended-warranty/product`, productCategory, productName],
    enabled: !!productCategory,
  });

  // Record product view when product loads
  useEffect(() => {
    if (product?.id) {
      const recordView = async () => {
        try {
          await apiRequest("/api/statistics/product-view", "POST", {
            productId: product.id,
            userId: user?.id || null,
            ipAddress: null, // Backend will handle IP detection
            userAgent: navigator.userAgent,
            referrer: document.referrer || null,
          });
        } catch (error) {
          // Silently handle tracking errors - don't impact user experience
          console.log("Product view tracking failed:", error);
        }
      };
      recordView();
    }
  }, [product?.id, user?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Ürün bulunamadı
            </h1>
            <Link href="/">
              <Button>Ana sayfaya dön</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product?.id) {
      addToCart(product.id, quantity, selectedWarranty || undefined);
    }
  };

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      toast({
        title: "Giriş yapın",
        description: "Favorilere eklemek için giriş yapmanız gerekiyor.",
        variant: "destructive",
      });
      return;
    }
    if (product?.id) {
      toggleFavorite(product.id);
      toast({
        title: isFavorited(product.id)
          ? "Favorilerden çıkarıldı"
          : "Favorilere eklendi",
        description: `${product.name} ${isFavorited(product.id) ? "favorilerden çıkarıldı" : "favorilere eklendi"}.`,
      });
    }
  };

  const productImages =
    product?.images && product.images.length > 0
      ? product.images
      : product?.image
        ? [product.image]
        : [];

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  // Create warranty options based on category pricing
  const warrantyOptions = [
    {
      id: "none",
      name: "Ek Garanti İstemiyorum",
      price: 0,
      description: "Sadece üretici garantisi",
    },
    ...(warrantyData
      ? [
          {
            id: "2year",
            name: "2 Yıl Ek Garanti",
            price: warrantyData.twoYearPrice || 0,
            description: "Üretici garantisine ek 2 yıl garanti",
          },
          ...(warrantyData.fourYearPrice && warrantyData.fourYearPrice > 0
            ? [
                {
                  id: "4year",
                  name: "4 Yıl Ek Garanti",
                  price: warrantyData.fourYearPrice || 0,
                  description: "Üretici garantisine ek 4 yıl garanti",
                },
              ]
            : []),
        ]
      : []),
  ];

  // İndirim var mı kontrolü (price > 0 ve originalPrice > price)
  const hasDiscount =
    product?.originalPrice &&
    product?.price &&
    parseFloat(product.price) > 0 &&
    parseFloat(product.originalPrice) > parseFloat(product.price);

  // Gösterilecek fiyat (indirim varsa price, yoksa originalPrice)
  const displayPrice = product
    ? hasDiscount
      ? parseFloat(product.price)
      : parseFloat(product.originalPrice || product.price)
    : 0;

  const calculateTotalPrice = () => {
    let basePrice = displayPrice * quantity;
    if (selectedWarranty && selectedWarranty !== "none") {
      const warranty = warrantyOptions.find((w) => w.id === selectedWarranty);
      if (warranty) basePrice += warranty.price;
    }
    return basePrice;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="bg-gray-100 py-4">
        <div className="container mx-auto px-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-primary">
              Ana Sayfa
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-primary">
              Ürünler
            </Link>
            <span>/</span>
            <Link
              href={`/products?category=${product?.category || ""}`}
              className="hover:text-primary"
            >
              {product?.category || "Kategori"}
            </Link>
            <span>/</span>
            <span className="text-gray-900">{product?.name || "Ürün"}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
              <ProductCarousel
                images={productImages}
                alt={product?.name || "Ürün"}
                className="w-full h-full"
                currentIndex={selectedImageIndex}
                onIndexChange={setSelectedImageIndex}
              />
            </div>

            {/* Thumbnail Navigation */}
            {productImages.length > 1 && (
              <div className="flex gap-3 justify-center">
                {productImages.map((image: string, index: number) => (
                  <button
                    key={index}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-3 transition-all ${
                      selectedImageIndex === index
                        ? "border-red-500 shadow-lg ring-1 ring-red-200"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      src={image}
                      alt={`${product?.name || "Ürün"} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product?.name || "Ürün Adı"}
              </h1>
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.round(averageRating?.average || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-500 ml-2">
                    ({averageRating?.count || 0} değerlendirme)
                  </span>
                </div>
              </div>
              {product?.inStock ? (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  ✓ Stokta var
                </Badge>
              ) : (
                <Badge variant="destructive">Stokta yok</Badge>
              )}
            </div>

            {/* Price Section - Enhanced Design */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 space-y-4 border border-blue-100 relative overflow-hidden">
              {/* Decorative element */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full transform translate-x-10 -translate-y-10"></div>
              
              {/* Discount Badge */}
              {hasDiscount && product?.originalPrice && (
                <div className="absolute top-4 left-4">
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    %{Math.round(
                      ((parseFloat(product.originalPrice) - parseFloat(product.price)) /
                        parseFloat(product.originalPrice)) * 100
                    )} İNDİRİM
                  </div>
                </div>
              )}

              {/* Unit Price */}
              <div className="space-y-2 pt-8">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 bg-white/80 px-3 py-1 rounded-full flex items-center">
                    <Tag className="h-4 w-4 mr-2" />
                    Birim Fiyat
                  </span>
                  <div className="text-right">
                    {hasDiscount && product?.originalPrice && (
                      <div className="text-lg text-gray-500 line-through font-medium">
                        {parseFloat(product.originalPrice).toLocaleString("tr-TR")} ₺
                      </div>
                    )}
                    <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                      {displayPrice.toLocaleString("tr-TR")} ₺
                    </div>
                    {hasDiscount && product?.originalPrice && (
                      <div className="text-green-600 font-semibold text-sm">
                        {(parseFloat(product.originalPrice) - parseFloat(product.price)).toLocaleString("tr-TR")} ₺ tasarruf!
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

              {/* Total Price */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-white/50">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-800 flex items-center">
                    <Calculator className="h-5 w-5 mr-2 text-blue-600" />
                    Toplam Fiyat
                  </span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                      {calculateTotalPrice().toLocaleString("tr-TR")} ₺
                    </div>
                    <div className="text-xs text-gray-500">KDV Dahil</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Extended Warranty */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Ek Garanti Seçenekleri
              </h3>
              <div className="space-y-2">
                {warrantyOptions.map((warranty) => (
                  <div
                    key={warranty.id}
                    className="flex items-center space-x-3"
                  >
                    <input
                      type="radio"
                      id={warranty.id}
                      name="warranty"
                      value={warranty.id}
                      checked={selectedWarranty === warranty.id}
                      onChange={(e) =>
                        setSelectedWarranty(
                          e.target.checked ? warranty.id : null,
                        )
                      }
                      className="h-4 w-4 text-primary"
                    />
                    <label htmlFor={warranty.id} className="flex-1 text-sm">
                      <div className="flex justify-between">
                        <div>
                          <span className="font-medium">{warranty.name}</span>
                          <div className="text-gray-500 text-xs">
                            {warranty.description}
                          </div>
                        </div>
                        <span
                          className={`font-semibold ${warranty.price === 0 ? "text-green-600" : "text-primary"}`}
                        >
                          {warranty.price === 0
                            ? "Ücretsiz"
                            : `+${warranty.price} ₺`}
                        </span>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Taksit Seçenekleri - Accordion */}
            <div className="bg-white rounded-lg border">
              <Accordion type="single" collapsible>
                <AccordionItem value="installments" className="border-none">
                  <AccordionTrigger className="px-6 py-4 text-left hover:no-underline" data-testid="button-toggle-installments">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-lg">Taksit Seçenekleri</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-0 pb-0">
                    <InstallmentOptions 
                      productPrice={calculateTotalPrice()} 
                      className="px-6 pb-6"
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">
                  Adet:
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={decrementQuantity}
                    className="p-2 hover:bg-gray-100 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 min-w-[3rem] text-center font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={incrementQuantity}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <Button
                  onClick={handleToggleFavorite}
                  variant="outline"
                  size="icon"
                  className="ml-auto"
                >
                  <Heart
                    className={`h-4 w-4 ${product?.id && isFavorited(product.id) ? "fill-red-500 text-red-500" : ""}`}
                  />
                </Button>
              </div>

              <Button
                onClick={handleAddToCart}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 text-lg"
                disabled={!product?.inStock}
                data-testid="button-add-to-cart"
              >
                <img src={sepetIcon} alt="Sepete Ekle" className="h-5 w-5 mr-2" />
                Sepete Ekle
              </Button>

              {/* WhatsApp Sipariş Butonu */}
              <Button
                onClick={() => {
                  const phoneNumber = "905550816004"; // Placeholder telefon numarası
                  const message = `Merhaba! ${product?.name} ürününü sipariş etmek istiyorum. Toplam Fiyat: ${calculateTotalPrice().toLocaleString("tr-TR")} ₺ (${quantity} adet${selectedWarranty && selectedWarranty !== "none" ? " + garanti" : ""})`;
                  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                  window.open(whatsappUrl, "_blank");
                }}
                variant="outline"
                className="w-full border-green-500 text-green-600 hover:bg-green-50 font-semibold py-3 text-lg mt-3"
                data-testid="button-whatsapp-order"
              >
                <img src={whatsappIcon} alt="WhatsApp" className="h-5 w-5 mr-2" />
                WhatsApp ile Sipariş Ver
              </Button>
            </div>

            {/* Additional Info */}
            {/* Özel Rozetler */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t">
              <div className="flex flex-col items-center text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                <Truck className="h-6 w-6 text-blue-600 mb-2" />
                <span className="text-xs font-medium text-blue-800">
                  Hızlı Gönderi
                </span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-green-50 rounded-lg border border-green-100">
                <Shield className="h-6 w-6 text-green-600 mb-2" />
                <span className="text-xs font-medium text-green-800">
                  Güvenli Alışveriş
                </span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                <MessageSquare className="h-6 w-6 text-orange-600 mb-2" />
                <span className="text-xs font-medium text-orange-800">
                  İstanbul İçi Ücretsiz Kargo
                </span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                <Phone className="h-6 w-6 text-purple-600 mb-2" />
                <span className="text-xs font-medium text-purple-800">
                  7/24 Destek
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="specs" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="specs">Teknik Özellikler</TabsTrigger>
              <TabsTrigger value="reviews">Değerlendirmeler</TabsTrigger>
            </TabsList>

            <TabsContent value="specs" className="mt-6">
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-xl font-semibold mb-4">
                  Teknik Özellikler
                </h3>
                <div className="space-y-4">
                  {product?.features && product.features.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        {product.features
                          .slice(0, Math.ceil(product.features.length / 2))
                          .map((feature: string, index: number) => {
                            const [key, value] = feature.split(":");
                            return (
                              <div key={index} className="space-y-1">
                                <div className="font-semibold text-gray-900">
                                  {key?.trim()}
                                </div>
                                <div className="text-gray-500 text-sm">
                                  {value?.trim()}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                      <div className="space-y-4">
                        {product.features
                          .slice(Math.ceil(product.features.length / 2))
                          .map((feature: string, index: number) => {
                            const [key, value] = feature.split(":");
                            return (
                              <div
                                key={
                                  index +
                                  Math.ceil((product.features?.length || 0) / 2)
                                }
                                className="space-y-1"
                              >
                                <div className="font-semibold text-gray-900">
                                  {key?.trim()}
                                </div>
                                <div className="text-gray-500 text-sm">
                                  {value?.trim()}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Marka:</span>
                          <span>{product?.brand || "Arçelik"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Kategori:</span>
                          <span>{product?.category || "Belirtilmemiş"}</span>
                        </div>
                        {product?.energyClass && (
                          <div className="flex justify-between">
                            <span className="font-medium">Enerji Sınıfı:</span>
                            <span>{product.energyClass}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">
                    Müşteri Değerlendirmeleri
                  </h3>
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      {averageRating?.average || 0}/5
                    </div>
                    <div className="text-sm text-gray-500">
                      {averageRating?.count || 0} değerlendirme
                    </div>
                  </div>
                </div>

                {/* Review Form for Authenticated Users */}
                {isAuthenticated && !userReview && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <Dialog
                      open={isReviewDialogOpen}
                      onOpenChange={setIsReviewDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Bu ürünü değerlendir
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Ürün Değerlendirmesi</DialogTitle>
                        </DialogHeader>
                        <ReviewForm
                          productId={id || ""}
                          onClose={() => setIsReviewDialogOpen(false)}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                )}

                {/* User's existing review */}
                {userReview && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-blue-800">
                        Sizin değerlendirmeniz
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < (userReview?.rating || 0)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {userReview?.comment && userReview.comment.trim() && (
                      <p className="text-gray-700">{userReview.comment}</p>
                    )}
                    <div className="text-sm text-gray-500 mt-2">
                      {userReview?.createdAt &&
                        new Date(userReview.createdAt).toLocaleDateString(
                          "tr-TR",
                        )}
                    </div>
                  </div>
                )}

                {/* Login prompt for non-authenticated users */}
                {!isAuthenticated && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-gray-600 mb-3">
                      Değerlendirme yapmak için giriş yapın
                    </p>
                    <Link href="/login">
                      <Button variant="outline">Giriş Yap</Button>
                    </Link>
                  </div>
                )}

                {/* Reviews List */}
                <div className="space-y-6">
                  {reviewsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-pulse space-y-4">
                        {[...Array(2)].map((_, i) => (
                          <div key={i} className="border-b pb-6">
                            <div className="flex justify-between mb-2">
                              <div className="h-4 bg-gray-200 rounded w-24"></div>
                              <div className="h-4 bg-gray-200 rounded w-20"></div>
                            </div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-20"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Henüz değerlendirme yapılmamış. İlk değerlendirmeyi siz
                      yapın!
                    </div>
                  ) : (
                    reviews.map((review: any) => (
                      <div
                        key={review.id}
                        className="border-b pb-6 last:border-b-0 last:pb-0"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">
                            {review.user
                              ? `${review.user.firstName} ${review.user.lastName.charAt(0)}.`
                              : "Anonim"}
                          </div>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && review.comment.trim() && (
                          <p className="text-gray-700">{review.comment}</p>
                        )}
                        <div className="text-sm text-gray-500 mt-2">
                          {new Date(review.createdAt).toLocaleDateString(
                            "tr-TR",
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Benzer Ürünler Bölümü */}
      {similarProducts.length > 0 && (
        <div className="bg-white py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Benzer Ürünler
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {similarProducts.map((similarProduct) => (
                <div
                  key={similarProduct.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <Link href={`/product/${similarProduct.id}`}>
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      <img
                        src={similarProduct.image}
                        alt={similarProduct.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      {similarProduct.originalPrice &&
                        parseFloat(similarProduct.originalPrice) >
                          parseFloat(similarProduct.price) && (
                          <div className="absolute top-2 left-2">
                            <Badge variant="destructive" className="text-xs">
                              %
                              {Math.round(
                                ((parseFloat(similarProduct.originalPrice) -
                                  parseFloat(similarProduct.price)) /
                                  parseFloat(similarProduct.originalPrice)) *
                                  100,
                              )}
                            </Badge>
                          </div>
                        )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-2">
                        {similarProduct.name}
                      </h3>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          {similarProduct.originalPrice &&
                            parseFloat(similarProduct.originalPrice) >
                              parseFloat(similarProduct.price) && (
                              <span className="text-xs text-gray-500 line-through">
                                {parseFloat(
                                  similarProduct.originalPrice,
                                ).toLocaleString("tr-TR")}{" "}
                                ₺
                              </span>
                            )}
                          <span className="text-lg font-bold text-primary">
                            {parseFloat(similarProduct.price).toLocaleString(
                              "tr-TR",
                            )}{" "}
                            ₺
                          </span>
                        </div>
                      </div>

                      <Button
                        className="w-full mt-3 bg-primary hover:bg-primary/90 text-white text-sm"
                        onClick={(e) => {
                          e.preventDefault();
                          addToCart(similarProduct.id, 1);
                          toast({
                            title: "Ürün sepete eklendi",
                            description: `${similarProduct.name} sepetinize eklendi.`,
                          });
                        }}
                      >
                        Sepete Ekle
                      </Button>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
