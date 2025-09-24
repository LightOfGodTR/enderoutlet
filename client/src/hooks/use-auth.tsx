import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { emailOrPhone: string; password: string; rememberMe?: boolean }) => void;
  logout: () => void;
  isLoginLoading: boolean;
  loginError: Error | null;
  register: (userData: { email: string; phone: string; firstName: string; lastName: string; password: string }) => void;
  isRegisterLoading: boolean;
  registerError: Error | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);

  // Query to get current user
  const { data: userData, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  // Update user state when query data changes
  useEffect(() => {
    if (userData) {
      setUser(userData);
    } else if (error) {
      setUser(null);
    }
  }, [userData, error]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: { emailOrPhone: string; password: string; rememberMe?: boolean }) => {
      const response = await apiRequest("/api/auth/login", "POST", credentials);
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Giriş başarısız');
      }
      return response.json();
    },
    onSuccess: (userData) => {
      setUser(userData);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Başarıyla giriş yaptınız",
        description: `Hoş geldiniz, ${userData.firstName}!`,
        className: "bg-green-50 border-green-200 text-green-800",
      });
    },
    onError: (error: any) => {
      let errorMessage = "Giriş yapılırken bir hata oluştu.";
      
      try {
        if (error.message) {
          // Try to parse if it's JSON error response
          if (error.message.includes('{"error"')) {
            const parsed = JSON.parse(error.message);
            if (parsed.details && Array.isArray(parsed.details) && parsed.details.length > 0) {
              // Show the first detailed error message
              errorMessage = parsed.details[0];
            } else {
              errorMessage = parsed.error || errorMessage;
            }
          } else if (error.message.includes("Invalid credentials")) {
            errorMessage = "E-posta/telefon veya şifre hatalı.";
          } else if (error.message.includes("E-posta/telefon veya şifre hatalı")) {
            errorMessage = "E-posta/telefon veya şifre hatalı.";
          } else if (error.message.includes("E-posta/telefon ve şifre gereklidir")) {
            errorMessage = "E-posta/telefon ve şifre gereklidir.";
          } else {
            errorMessage = error.message;
          }
        }
      } catch (e) {
        // Keep default message if parsing fails
      }
      
      toast({
        title: "Giriş başarısız",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: { email: string; phone: string; firstName: string; lastName: string; password: string }) => {
      const response = await apiRequest("/api/auth/register", "POST", userData);
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Kayıt başarısız');
      }
      return response.json();
    },
    onSuccess: (userData) => {
      setUser(userData);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Hesabınız başarıyla oluşturuldu",
        description: `Hoş geldiniz, ${userData.firstName}!`,
        className: "bg-green-50 border-green-200 text-green-800",
      });
    },
    onError: (error: any) => {
      let errorMessage = "Kayıt olurken bir hata oluştu.";
      
      try {
        if (error.message) {
          if (error.message.includes('{"error"')) {
            const parsed = JSON.parse(error.message);
            if (parsed.details && Array.isArray(parsed.details) && parsed.details.length > 0) {
              // Show the first detailed error message
              errorMessage = parsed.details[0];
            } else {
              errorMessage = parsed.error || errorMessage;
            }
          } else {
            errorMessage = error.message;
          }
        }
      } catch (e) {
        // Keep default message if parsing fails
      }
      
      toast({
        title: "Kayıt başarısız",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/auth/logout", "POST", {});
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Çıkış başarısız');
      }
      return response.json();
    },
    onSuccess: () => {
      setUser(null);
      queryClient.clear();
      toast({
        title: "Başarıyla çıkış yaptınız",
        description: "Görüşmek üzere!",
      });
    }
  });

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoginLoading: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutate,
    isRegisterLoading: registerMutation.isPending,
    registerError: registerMutation.error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}