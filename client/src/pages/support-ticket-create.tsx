import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircleQuestion, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const supportTicketSchema = z.object({
  subject: z.string().min(5, "Konu en az 5 karakter olmalıdır"),
  category: z.string().min(1, "Kategori seçmelisiniz"),
  priority: z.string().min(1, "Öncelik seçmelisiniz"),
  description: z.string().min(20, "Açıklama en az 20 karakter olmalıdır"),
});

type SupportTicketForm = z.infer<typeof supportTicketSchema>;

export default function SupportTicketCreate() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  const form = useForm<SupportTicketForm>({
    resolver: zodResolver(supportTicketSchema),
    defaultValues: {
      subject: "",
      category: "",
      priority: "medium",
      description: "",
    },
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data: SupportTicketForm) => {
      const response = await apiRequest("/api/support/tickets", "POST", data);
      return response.json();
    },
    onSuccess: (ticket) => {
      toast({
        title: "Destek talebi oluşturuldu",
        description: `Talebiniz #${ticket.id} numarası ile kaydedildi. En kısa sürede size dönüş yapacağız.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/support/tickets'] });
      navigate("/destek-taleplerim");
    },
    onError: (error: any) => {
      console.error("Error creating support ticket:", error);
      let errorMessage = "Destek talebi oluşturulurken bir hata oluştu";
      
      if (error.message) {
        if (error.message.includes("401")) {
          errorMessage = "Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.";
        } else if (error.message.includes("400")) {
          errorMessage = "Form bilgileri geçersiz. Lütfen kontrol edin.";
        } else {
          errorMessage = `Hata: ${error.message}`;
        }
      }
      
      toast({
        variant: "destructive",
        title: "Hata",
        description: errorMessage,
      });
    },
  });

  const onSubmit = (data: SupportTicketForm) => {
    console.log("Form submission:", { data, isAuthenticated, user: user?.id });
    
    if (!isAuthenticated || !user) {
      console.log("Not authenticated, redirecting to login");
      toast({
        variant: "destructive",
        title: "Giriş Yapın",
        description: "Destek talebi oluşturmak için giriş yapmanız gerekir",
      });
      navigate("/login");
      return;
    }
    
    console.log("Creating ticket mutation...");
    createTicketMutation.mutate(data);
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <MessageCircleQuestion className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Giriş Yapın</CardTitle>
              <CardDescription>
                Destek talebi oluşturmak için hesabınıza giriş yapmanız gerekir
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate("/login")} 
                className="w-full"
              >
                Giriş Yap
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/contact")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Geri
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Destek Talebi Oluştur</h1>
              <p className="text-gray-600">Sorunlarınız için destek talebi oluşturun</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircleQuestion className="h-5 w-5 text-primary" />
                Yeni Destek Talebi
              </CardTitle>
              <CardDescription>
                Sorununuzu detaylı bir şekilde açıklayın. Destek ekibimiz en kısa sürede size dönüş yapacaktır.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Konu</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Sorunun kısa başlığı..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kategori</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Kategori seçin" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="technical">Teknik Destek</SelectItem>
                              <SelectItem value="sales">Satış</SelectItem>
                              <SelectItem value="warranty">Garanti</SelectItem>
                              <SelectItem value="other">Diğer</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Öncelik</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Öncelik seçin" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Düşük</SelectItem>
                              <SelectItem value="medium">Orta</SelectItem>
                              <SelectItem value="high">Yüksek</SelectItem>
                              <SelectItem value="urgent">Acil</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Açıklama</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Sorununuzu detaylı bir şekilde açıklayın..."
                            className="min-h-[120px] resize-y"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createTicketMutation.isPending}
                  >
                    {createTicketMutation.isPending ? "Oluşturuluyor..." : "Destek Talebi Oluştur"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}