import { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface Favorite {
  id: string;
  userId: string;
  productId: string;
  createdAt: Date;
  product?: any;
}

interface FavoritesContextType {
  favorites: Favorite[];
  isLoading: boolean;
  toggleFavorite: (productId: string) => void;
  isFavorited: (productId: string) => boolean;
  favoritesCount: number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const { data: favorites = [], isLoading } = useQuery<Favorite[]>({
    queryKey: ["/api/favorites"],
    enabled: isAuthenticated,
  });

  const addToFavoritesMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await apiRequest("/api/favorites", "POST", { productId });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Favorilere eklenemedi');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Ürün favorilere eklenirken bir hata oluştu.",
        variant: "destructive"
      });
    }
  });

  const removeFromFavoritesMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await apiRequest(`/api/favorites/${productId}`, "DELETE");
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Favorilerden çıkarılamadı');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Ürün favorilerden çıkarılırken bir hata oluştu.",
        variant: "destructive"
      });
    }
  });

  const toggleFavorite = (productId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Giriş yapın",
        description: "Favorilere eklemek için giriş yapmanız gerekiyor.",
        variant: "destructive",
      });
      return;
    }

    const isFav = isFavorited(productId);
    if (isFav) {
      removeFromFavoritesMutation.mutate(productId);
    } else {
      addToFavoritesMutation.mutate(productId);
    }
  };

  const isFavorited = (productId: string) => {
    return favorites.some(fav => fav.productId === productId);
  };

  const favoritesCount = favorites.length;

  const value: FavoritesContextType = {
    favorites,
    isLoading,
    toggleFavorite,
    isFavorited,
    favoritesCount,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}