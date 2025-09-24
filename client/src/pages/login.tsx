import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
import { Eye, EyeOff } from "lucide-react";
import Header from "@/components/header";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { login, isLoginLoading, loginError, isAuthenticated } = useAuth();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/account");
    }
  }, [isAuthenticated, navigate]);

  // Clear form and error state on successful login
  useEffect(() => {
    if (isAuthenticated) {
      setEmailOrPhone("");
      setPassword("");
    }
  }, [isAuthenticated]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ emailOrPhone, password, rememberMe });
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-2 min-h-[85vh]">
            {/* Left Side - Login Form */}
            <div className="w-full max-w-md">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="text-center mb-4">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Ender Outlet'e hoş geldiniz.
                  </h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <Label
                      htmlFor="emailOrPhone"
                      className="text-sm text-gray-700"
                    >
                      E-posta veya Telefon
                    </Label>
                    <Input
                      id="emailOrPhone"
                      type="text"
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      placeholder="E-posta adresiniz veya telefon numaranız"
                      className="h-10"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="password" className="text-sm text-gray-700">
                      Şifre
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-10 pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) =>
                          setRememberMe(checked === true)
                        }
                      />
                      <label
                        htmlFor="remember"
                        className="text-gray-600 text-sm cursor-pointer"
                      >
                        Beni hatırla
                      </label>
                    </div>
                    <Link
                      href="/forgot-password"
                      className="text-primary hover:underline"
                    >
                      Şifremi unuttum
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-semibold mt-4"
                    disabled={isLoginLoading}
                  >
                    {isLoginLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
                  </Button>

                  <div className="text-center text-sm text-gray-600 mt-3">
                    Henüz hesabınız yok mu?{" "}
                    <Link
                      href="/register"
                      className="text-primary hover:underline font-medium"
                    >
                      Kayıt olun
                    </Link>
                  </div>
                </form>
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="hidden lg:block w-px bg-gray-300 h-96 mx-4"></div>

            {/* Right Side - Benefits */}
            <div className="w-full max-w-lg">
              <div className="text-left">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Hemen üye olun, Bizim ayrıcalıklarımızdan faydalanın!
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-red-100 p-2 rounded-full">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                        %
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Avantajlı Kampanyalardan Haberdar Olun
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Sadece üyeler için hazırlanan sürpriz indirim kodları ve
                        hediye çeklerinden yararlanın.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-red-100 p-2 rounded-full">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm">
                        💳
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Hızlı ve Kolay Ödeme Yapın
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Kredi kartı, banka kartı ve taksit seçenekleriyle
                        güvenli alışverişin keyfini çıkarın.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-red-100 p-2 rounded-full">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm">
                        📍
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Siparişlerinizi Takip Edin
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Kargonuzun nerede olduğunu kolayca öğrenin, teslimat
                        sürecini kontrol edin.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-red-100 p-2 rounded-full">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm">
                        👤
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Hesabınızı Yönetin
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Kayıtlı adresiniz, favori ürünleriniz, için yönetim gibi
                        işlemlerinizi yapın.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
