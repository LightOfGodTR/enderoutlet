import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/header";
import { ArrowLeft, Save, IdCard } from "lucide-react";
import { useLocation } from "wouter";

export default function TCKimlikPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [tcKimlik, setTcKimlik] = useState((user as any)?.tcKimlik || "");

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  const updateTcKimlik = useMutation({
    mutationFn: async (data: { tcKimlik: string }) => {
      return await apiRequest(`/api/users/${user?.id}`, "PATCH", data);
    },
    onSuccess: () => {
      toast({
        title: "Başarılı!",
        description: "TC Kimlik numaranız kaydedildi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLocation("/account");
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "TC Kimlik numarası kaydedilemedi: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // TC Kimlik validation
    if (!tcKimlik) {
      toast({
        title: "Hata",
        description: "TC Kimlik numarası gereklidir",
        variant: "destructive",
      });
      return;
    }

    if (tcKimlik.length !== 11) {
      toast({
        title: "Hata",
        description: "TC Kimlik numarası 11 haneli olmalıdır",
        variant: "destructive",
      });
      return;
    }

    if (!/^\d+$/.test(tcKimlik)) {
      toast({
        title: "Hata",
        description: "TC Kimlik numarası sadece rakam içermelidir",
        variant: "destructive",
      });
      return;
    }

    // Basic TC Kimlik algorithm check
    if (!isValidTCKimlik(tcKimlik)) {
      toast({
        title: "Hata",
        description: "Geçersiz TC Kimlik numarası",
        variant: "destructive",
      });
      return;
    }

    updateTcKimlik.mutate({ tcKimlik });
  };

  // TC Kimlik validation algorithm
  const isValidTCKimlik = (tc: string): boolean => {
    if (tc.length !== 11) return false;
    if (tc[0] === '0') return false;
    
    const digits = tc.split('').map(Number);
    
    // Sum of first 10 digits
    const sum = digits.slice(0, 10).reduce((acc, digit, index) => {
      return acc + digit * (index % 2 === 0 ? 1 : 3);
    }, 0);
    
    const checkDigit1 = (sum % 10);
    if (checkDigit1 !== digits[10]) return false;
    
    // Sum of odd positioned digits (1st, 3rd, 5th, 7th, 9th)
    const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
    
    // Sum of even positioned digits (2nd, 4th, 6th, 8th)
    const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
    
    const checkDigit2 = ((oddSum * 7) - evenSum) % 10;
    if (checkDigit2 !== digits[9]) return false;
    
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-md mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => setLocation("/account")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Hesabıma Dön
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IdCard className="h-5 w-5" />
                TC Kimlik Numarası
              </CardTitle>
              <CardDescription>
                TC Kimlik numaranızı güvenli şekilde kaydedin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tcKimlik">TC Kimlik Numarası</Label>
                  <Input
                    id="tcKimlik"
                    type="text"
                    value={tcKimlik}
                    onChange={(e) => setTcKimlik(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder="11 haneli TC Kimlik numaranız"
                    maxLength={11}
                    className="text-center text-lg tracking-wider"
                  />
                  <p className="text-xs text-gray-500">
                    TC Kimlik numaranız güvenli şekilde saklanacaktır
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setLocation("/account")}
                  >
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={updateTcKimlik.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateTcKimlik.isPending ? "Kaydediliyor..." : "Kaydet"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}