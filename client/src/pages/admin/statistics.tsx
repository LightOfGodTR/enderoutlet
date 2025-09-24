import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Users, ShoppingCart, Eye, MousePointer, Package, DollarSign, Calendar } from "lucide-react";

export default function Statistics() {
  const [salesPeriod, setSalesPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const queryClient = useQueryClient();

  // Fetch all statistics
  const { data: salesStats, isLoading: salesLoading } = useQuery({
    queryKey: [`/api/admin/statistics/sales?period=${salesPeriod}`],
    enabled: true,
  });

  const { data: userStats, isLoading: userLoading } = useQuery({
    queryKey: ['/api/admin/statistics/users'],
    enabled: true,
  });

  const { data: productViewStats, isLoading: viewsLoading } = useQuery({
    queryKey: ['/api/admin/statistics/product-views?limit=10'],
    enabled: true,
  });

  const { data: sliderClickStats, isLoading: clicksLoading } = useQuery({
    queryKey: ['/api/admin/statistics/slider-clicks?limit=10'],
    enabled: true,
  });

  const { data: orderStats, isLoading: orderLoading } = useQuery({
    queryKey: ['/api/admin/statistics/orders'],
    enabled: true,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('tr-TR');
  };

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const isLoading = salesLoading || userLoading || viewsLoading || clicksLoading || orderLoading;

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Invalidate all statistics queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/statistics'] });
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, queryClient]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">İstatistikler</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">İstatistikler</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <Select value={salesPeriod} onValueChange={(value: any) => setSalesPeriod(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Dönem seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Günlük</SelectItem>
                <SelectItem value="weekly">Haftalık</SelectItem>
                <SelectItem value="monthly">Aylık</SelectItem>
                <SelectItem value="yearly">Yıllık</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="flex items-center gap-2"
            >
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
              {autoRefresh ? 'Otomatik Yenilenme Açık' : 'Otomatik Yenilenme Kapalı'}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/statistics'] })}
            >
              Manuel Yenile
            </Button>
          </div>
        </div>
      </div>

      {/* Özet Kartları */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Kullanıcı</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Bu ay +{userStats?.newUsersThisMonth || 0} yeni kullanıcı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sepetinde Ürün Var</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.usersWithItemsInCart || 0}</div>
            <p className="text-xs text-muted-foreground">
              Potansiyel müşteri
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Sipariş</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              {orderStats?.pendingOrders || 0} beklemede
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(orderStats?.totalRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Ort. {formatCurrency(orderStats?.averageOrderValue || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Satış Grafiği */}
      <Card>
        <CardHeader>
          <CardTitle>Satış Trendi ({salesPeriod === 'daily' ? 'Günlük' : salesPeriod === 'weekly' ? 'Haftalık' : salesPeriod === 'monthly' ? 'Aylık' : 'Yıllık'})</CardTitle>
          <CardDescription>
            Zaman içindeki satış performansı
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesStats || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
              />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                labelFormatter={formatDate}
                formatter={(value: any, name: string) => [
                  name === 'revenue' ? formatCurrency(value) : value,
                  name === 'revenue' ? 'Gelir' : 'Sipariş Sayısı'
                ]}
              />
              <Legend />
              <Bar yAxisId="right" dataKey="orderCount" fill="#8884d8" name="Sipariş Sayısı" />
              <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#82ca9d" name="Gelir" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* En Çok Görüntülenen Ürünler */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              En Çok Görüntülenen Ürünler
            </CardTitle>
            <CardDescription>
              Ürün sayfası görüntülenme sayıları
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productViewStats?.slice(0, 5).map((item: any, index: number) => (
                <div key={item.productId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{index + 1}</Badge>
                    <div className="font-medium">{item.productName}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="font-bold">{item.viewCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* En Çok Tıklanan Slider'lar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MousePointer className="h-5 w-5" />
              En Çok Tıklanan Slider'lar
            </CardTitle>
            <CardDescription>
              Slider tıklama istatistikleri
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sliderClickStats?.slice(0, 5).map((item: any, index: number) => (
                <div key={item.sliderId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{index + 1}</Badge>
                    <div className="font-medium">{item.sliderTitle}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MousePointer className="h-4 w-4 text-muted-foreground" />
                    <span className="font-bold">{item.clickCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kullanıcı Büyüme Trendi */}
      <Card>
        <CardHeader>
          <CardTitle>Kullanıcı Büyüme İstatistikleri</CardTitle>
          <CardDescription>
            Yeni kullanıcı kayıt trendi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{userStats?.newUsersToday || 0}</div>
              <div className="text-sm text-muted-foreground">Bugün</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{userStats?.newUsersThisWeek || 0}</div>
              <div className="text-sm text-muted-foreground">Bu Hafta</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{userStats?.newUsersThisMonth || 0}</div>
              <div className="text-sm text-muted-foreground">Bu Ay</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sipariş Durumu Dağılımı */}
      <Card>
        <CardHeader>
          <CardTitle>Sipariş Durumu Dağılımı</CardTitle>
          <CardDescription>
            Siparişlerin mevcut durumları
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{orderStats?.pendingOrders || 0}</div>
              <div className="text-sm text-muted-foreground">Bekleyen</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{orderStats?.completedOrders || 0}</div>
              <div className="text-sm text-muted-foreground">Tamamlanan</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{(orderStats?.totalOrders || 0) - (orderStats?.pendingOrders || 0) - (orderStats?.completedOrders || 0)}</div>
              <div className="text-sm text-muted-foreground">Diğer</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}