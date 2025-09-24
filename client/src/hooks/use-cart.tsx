import React, { createContext, useContext, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  warranty?: string;
  userId?: string;
  product?: Product;
  warrantyPrice?: number; // Add warranty price from backend
}

interface CartContextType {
  cartItems: CartItem[];
  isLoading: boolean;
  addToCart: (productId: string, quantity?: number, warranty?: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartTotal: number;
  cartItemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: cartItems = [], isLoading } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity, warranty }: { productId: string; quantity: number; warranty?: string }) => {
      const response = await apiRequest("/api/cart", "POST", { productId, quantity, warranty });
      if (!response.ok) {
        // Store status for error handling
        const errorInfo = { status: response.status };
        const errorData = await response.text();
        const error = new Error(errorData || 'Sepete eklenemedi');
        (error as any).status = response.status;
        throw error;
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "🛒 Sepete Eklendi!",
        description: `${variables.quantity} adet ürün sepete başarıyla eklendi.`,
        className: "bg-green-50 border-green-200 text-green-800",
      });
    },
    onError: (error: any) => {
      console.error('Add to cart error:', error);
      
      // Check if it's an authentication error (401)
      if (error.status === 401) {
        toast({
          title: "🔒 Giriş Yapmanız Gerekiyor",
          description: (
            <div>
              Sepete ürün ekleyebilmek için önce giriş yapmalısınız.{" "}
              <a href="/login" className="underline font-medium">
                Giriş yap
              </a>
            </div>
          ),
          variant: "destructive",
          duration: 6000
        });
      } else {
        // Parse JSON error if available
        let errorMessage = "Ürün sepete eklenirken bir hata oluştu.";
        try {
          if (error.message && error.message.includes('{"error"')) {
            const parsed = JSON.parse(error.message);
            errorMessage = parsed.error || errorMessage;
          } else if (error.message) {
            errorMessage = error.message;
          }
        } catch (e) {
          // Keep default message if parsing fails
        }
        
        toast({
          title: "Hata",
          description: errorMessage,
          variant: "destructive"
        });
      }
    }
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const response = await apiRequest(`/api/cart/${id}`, "PUT", { quantity });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Güncelleme başarısız');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest(`/api/cart/${id}`, "DELETE", {});
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Silme başarısız');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "🗑️ Sepetten Çıkarıldı",
        description: "Ürün sepetten başarıyla çıkarıldı.",
        className: "bg-orange-50 border-orange-200 text-orange-800",
      });
    },
  });

  const addToCart = (productId: string, quantity: number = 1, warranty?: string) => {
    addToCartMutation.mutate({ productId, quantity, warranty });
  };

  const updateQuantity = (id: string, quantity: number) => {
    updateQuantityMutation.mutate({ id, quantity });
  };

  const removeFromCart = (id: string) => {
    removeFromCartMutation.mutate(id);
  };

  // No longer needed - warranty price comes from backend

  const cartTotal = cartItems.reduce((total: number, item: CartItem) => {
    // Ensure price is properly parsed as number
    const price = item.product?.price;
    const basePrice = price ? (typeof price === 'number' ? price : parseFloat(price.toString())) * item.quantity : 0;
    const warrantyPrice = item.warrantyPrice || 0; // Use warranty price from backend
    
    
    return total + basePrice + warrantyPrice;
  }, 0);

  const cartItemCount = cartItems.reduce((count: number, item: CartItem) => count + item.quantity, 0);

  const value: CartContextType = {
    cartItems,
    isLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
    isCartOpen,
    setIsCartOpen,
    cartTotal,
    cartItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
