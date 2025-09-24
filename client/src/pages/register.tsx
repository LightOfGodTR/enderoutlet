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
import { useAuth } from "@/hooks/use-auth";
import { Eye, EyeOff } from "lucide-react";
import Header from "@/components/header";

export default function RegisterPage() {
  const [, navigate] = useLocation();
  const { register, isRegisterLoading, registerError, isAuthenticated } =
    useAuth();
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/account");
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Ad zorunludur";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Soyad zorunludur";
    }



    if (!formData.email.trim()) {
      newErrors.email = "E-posta adresi zorunludur";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Geçerli bir e-posta adresi girin";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Telefon numarası zorunludur";
    } else {
      const digits = formData.phone.replace(/\D/g, '');
      if (digits.length !== 11 || !digits.startsWith('0')) {
        newErrors.phone = "11 haneli geçerli bir telefon numarası girin (05XX XXX XX XX)";
      }
    }

    if (!formData.password) {
      newErrors.password = "Şifre zorunludur";
    } else if (formData.password.length < 6) {
      newErrors.password = "Şifre en az 6 karakter olmalıdır";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Şifreler eşleşmiyor";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const { confirmPassword, ...userData } = formData;
      register(userData);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Limit to 11 digits maximum
    const limitedDigits = digits.slice(0, 11);
    
    // Format: 0XXX XXX XX XX (11 digits total)
    if (limitedDigits.length <= 4) {
      return limitedDigits;
    } else if (limitedDigits.length <= 7) {
      return `${limitedDigits.slice(0, 4)} ${limitedDigits.slice(4)}`;
    } else if (limitedDigits.length <= 9) {
      return `${limitedDigits.slice(0, 4)} ${limitedDigits.slice(4, 7)} ${limitedDigits.slice(7)}`;
    } else {
      return `${limitedDigits.slice(0, 4)} ${limitedDigits.slice(4, 7)} ${limitedDigits.slice(7, 9)} ${limitedDigits.slice(9)}`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      const formattedPhone = formatPhoneNumber(value);
      setFormData((prev) => ({ ...prev, [name]: formattedPhone }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-2 min-h-[85vh]">
            {/* Left Side - Registration Form */}
            <div className="w-full max-w-md">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="text-center mb-4">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Hesap Oluşturun
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Burada alışverişe başlamak için kayıt olun
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label
                        htmlFor="firstName"
                        className="text-sm text-gray-700"
                      >
                        Ad *
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Adınız"
                        className="h-10"
                        required
                      />
                      {errors.firstName && (
                        <p className="text-xs text-red-600">
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor="lastName"
                        className="text-sm text-gray-700"
                      >
                        Soyad *
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Soyadınız"
                        className="h-10"
                        required
                      />
                      {errors.lastName && (
                        <p className="text-xs text-red-600">
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-sm text-gray-700">
                      E-posta adresi *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="E-posta adresiniz"
                      className="h-10"
                      required
                    />
                    {errors.email && (
                      <p className="text-xs text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="phone" className="text-sm text-gray-700">
                      Telefon Numarası *
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="05XX XXX XX XX"
                      className="h-10"
                      required
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-600">{errors.phone}</p>
                    )}
                  </div>



                  <div className="space-y-1">
                    <Label htmlFor="password" className="text-sm text-gray-700">
                      Şifre *
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Şifreniz (min. 6 karakter)"
                        className="h-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-red-600">{errors.password}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-sm text-gray-700"
                    >
                      Şifre Tekrar *
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Şifrenizi tekrar girin"
                        className="h-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-600">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-semibold mt-4"
                    disabled={isRegisterLoading}
                  >
                    {isRegisterLoading ? "Kayıt oluşturuluyor..." : "Kayıt Ol"}
                  </Button>

                  <div className="text-center text-sm text-gray-600 mt-3">
                    Zaten hesabınız var mı?{" "}
                    <Link
                      href="/login"
                      className="text-primary hover:underline font-medium"
                    >
                      Giriş yapın
                    </Link>
                  </div>
                </form>
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="hidden lg:block w-px bg-gray-300 h-96 mx-4"></div>

            {/* Right Side - Same as login page */}
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
