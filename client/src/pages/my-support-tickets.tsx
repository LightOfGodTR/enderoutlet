import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MessageCircleQuestion, 
  Plus, 
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  MessageSquare
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

type SupportTicket = {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

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

export default function MySupportTickets() {
  const [location, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const { data: tickets, isLoading } = useQuery<SupportTicket[]>({
    queryKey: ['/api/support/tickets'],
    enabled: isAuthenticated,
  });

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
                Destek taleplerini görüntülemek için hesabınıza giriş yapmanız gerekir
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
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Destek Taleplerım</h1>
              <p className="text-gray-600 mt-1">Tüm destek taleplerinizi burada görüntüleyebilirsiniz</p>
            </div>
            <Button 
              onClick={() => navigate("/destek-talebi-olustur")}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Yeni Talep
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="flex gap-2">
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !tickets || tickets.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageCircleQuestion className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Henüz destek talebiniz yok
                </h3>
                <p className="text-gray-600 mb-6">
                  Sorunlarınız için destek talebi oluşturup yardım alabilirsiniz
                </p>
                <Button 
                  onClick={() => navigate("/destek-talebi-olustur")}
                  className="flex items-center gap-2 mx-auto"
                >
                  <Plus className="h-4 w-4" />
                  İlk Destek Talebi Oluştur
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => {
                const StatusIcon = getStatusIcon(ticket.status);
                return (
                  <Card key={ticket.id} className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/destek-talebi/${ticket.id}`)}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <StatusIcon className="h-4 w-4 text-gray-500" />
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {ticket.subject}
                            </h3>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <span>#{ticket.id.slice(0, 8)}</span>
                            <span>{translateCategory(ticket.category)}</span>
                            <span>{format(new Date(ticket.createdAt), "dd MMM yyyy", { locale: tr })}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(ticket.status)}>
                              {translateStatus(ticket.status)}
                            </Badge>
                            <Badge className={getPriorityColor(ticket.priority)}>
                              {translatePriority(ticket.priority)}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-400">
                          <MessageSquare className="h-5 w-5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}