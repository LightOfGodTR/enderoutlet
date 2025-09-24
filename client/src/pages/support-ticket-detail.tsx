import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { 
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Send,
  User,
  Shield
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

type SupportTicket = {
  id: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
};

type TicketMessage = {
  id: string;
  message: string;
  senderType: "user" | "admin";
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    role?: string;
  };
};

const messageSchema = z.object({
  message: z.string().min(1, "Mesaj boş olamaz").min(5, "Mesaj en az 5 karakter olmalıdır"),
});

type MessageForm = z.infer<typeof messageSchema>;

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "low": return "bg-green-100 text-green-800";
    case "medium": return "bg-yellow-100 text-yellow-800";
    case "high": return "bg-orange-100 text-orange-800";
    case "urgent": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "open": return "bg-blue-100 text-blue-800";
    case "in_progress": return "bg-yellow-100 text-yellow-800";
    case "resolved": return "bg-green-100 text-green-800";
    case "closed": return "bg-gray-100 text-gray-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "open": return Clock;
    case "in_progress": return AlertCircle;
    case "resolved": return CheckCircle;
    case "closed": return XCircle;
    default: return Clock;
  }
};

const translateCategory = (category: string) => {
  switch (category) {
    case "technical": return "Teknik Destek";
    case "sales": return "Satış";
    case "warranty": return "Garanti";
    case "other": return "Diğer";
    default: return category;
  }
};

const translatePriority = (priority: string) => {
  switch (priority) {
    case "low": return "Düşük";
    case "medium": return "Orta";
    case "high": return "Yüksek";
    case "urgent": return "Acil";
    default: return priority;
  }
};

const translateStatus = (status: string) => {
  switch (status) {
    case "open": return "Açık";
    case "in_progress": return "İşlemde";
    case "resolved": return "Çözümlendi";
    case "closed": return "Kapatıldı";
    default: return status;
  }
};

export default function SupportTicketDetail() {
  const params = useParams<{ id: string }>();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  const form = useForm<MessageForm>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: "",
    },
  });

  const { data: ticket, isLoading: ticketLoading } = useQuery<SupportTicket>({
    queryKey: ['/api/support/tickets', params?.id],
    enabled: !!params?.id && isAuthenticated,
  });

  const { data: messages, isLoading: messagesLoading } = useQuery<TicketMessage[]>({
    queryKey: ['/api/support/tickets', params?.id, 'messages'],
    enabled: !!params?.id && isAuthenticated,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: MessageForm) => {
      const response = await apiRequest(`/api/support/tickets/${params?.id}/messages`, "POST", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Mesaj gönderildi",
        description: "Mesajınız başarıyla gönderildi",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/support/tickets', params?.id, 'messages'] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Mesaj gönderilirken bir hata oluştu",
      });
    },
  });

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle>Giriş Yapın</CardTitle>
              <CardDescription>
                Bu sayfayı görüntülemek için giriş yapmanız gerekir
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/login")} className="w-full">
                Giriş Yap
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (ticketLoading || messagesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <Card>
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-20 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle>Talep Bulunamadı</CardTitle>
              <CardDescription>
                Aradığınız destek talebi bulunamadı veya erişim izniniz yok
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/destek-taleplerim")} className="w-full">
                Taleplerime Dön
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const StatusIcon = getStatusIcon(ticket.status);
  const isTicketClosed = ticket.status === 'closed' || ticket.status === 'resolved';

  const onSubmit = (data: MessageForm) => {
    sendMessageMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/destek-taleplerim")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Taleplerime Dön
            </Button>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusIcon className="h-5 w-5 text-gray-500" />
                    <CardTitle className="text-xl">{ticket.subject}</CardTitle>
                  </div>
                  <CardDescription className="text-base mb-3">
                    Talep #{ticket.id.slice(0, 8)} • {translateCategory(ticket.category)} • 
                    {format(new Date(ticket.createdAt), "dd MMMM yyyy HH:mm", { locale: tr })}
                  </CardDescription>
                  <div className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 mb-1">Açıklama:</p>
                    <p className="whitespace-pre-wrap">{ticket.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Badge className={getStatusColor(ticket.status)}>
                    {translateStatus(ticket.status)}
                  </Badge>
                  <Badge className={getPriorityColor(ticket.priority)}>
                    {translatePriority(ticket.priority)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="space-y-4 mb-6">
            {messages && messages.length > 0 ? (
              messages.map((message) => (
                <Card key={message.id} className={
                  message.senderType === 'admin' 
                    ? 'border-blue-200 bg-blue-50' 
                    : 'border-gray-200'
                }>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className={
                          message.senderType === 'admin' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-gray-100 text-gray-700'
                        }>
                          {message.senderType === 'admin' ? (
                            <Shield className="h-4 w-4" />
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {message.sender.firstName} {message.sender.lastName}
                          </span>
                          {message.senderType === 'admin' && (
                            <Badge variant="secondary" className="text-xs">
                              Destek Ekibi
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">
                            {format(new Date(message.createdAt), "dd MMM HH:mm", { locale: tr })}
                          </span>
                        </div>
                        <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {message.message}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  Henüz mesaj bulunmuyor
                </CardContent>
              </Card>
            )}
          </div>

          {!isTicketClosed && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mesaj Gönder</CardTitle>
                <CardDescription>
                  Destek ekibimizle iletişime geçin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder="Mesajınızı yazın..."
                              className="min-h-[100px] resize-y"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={sendMessageMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        <Send className="h-4 w-4" />
                        {sendMessageMutation.isPending ? "Gönderiliyor..." : "Mesaj Gönder"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {isTicketClosed && (
            <Card className="border-gray-300 bg-gray-50">
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Bu talep {ticket.status === 'resolved' ? 'çözümlendi' : 'kapatıldı'}
                </h3>
                <p className="text-gray-600">
                  Bu talebe artık mesaj gönderemezsiniz. Yeni bir sorunuz varsa yeni bir destek talebi oluşturun.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}