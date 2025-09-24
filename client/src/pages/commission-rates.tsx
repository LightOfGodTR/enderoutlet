import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Building2, Info } from "lucide-react";
import BankLogo from "@/components/bank-logo";

export default function CommissionRatesPage() {
  const [selectedBankId, setSelectedBankId] = useState<string>('all');

  // Komisyon oranlarını getir
  const { data: commissionRates = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/commission-rates'],
  });

  // Unique bankaları bul
  const uniqueBanks = commissionRates.reduce((acc: any[], rate: any) => {
    if (!acc.find(bank => bank.id === rate.virtualPosConfigId)) {
      acc.push({
        id: rate.virtualPosConfigId,
        name: rate.bankName
      });
    }
    return acc;
  }, []);

  // Filtrelenmiş komisyon oranları
  const filteredRates = selectedBankId === 'all' 
    ? commissionRates 
    : commissionRates.filter((rate: any) => rate.virtualPosConfigId === selectedBankId);

  // Bankaları grupla
  const groupedByBank = filteredRates.reduce((acc: any, rate: any) => {
    if (!acc[rate.bankName]) {
      acc[rate.bankName] = [];
    }
    acc[rate.bankName].push(rate);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Komisyon Oranları
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Tüm bankalar için güncel taksit komisyon oranlarımızı görüntüleyin
          </p>
          
          {/* Bilgilendirme */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 max-w-4xl mx-auto">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <h3 className="font-semibold text-blue-900 mb-2">Komisyon Oranları Hakkında</h3>
                <p className="text-blue-800 text-sm leading-relaxed">
                  Aşağıdaki komisyon oranları taksitli alışverişlerinizde uygulanmaktadır. 
                  Tek çekim alışverişlerde komisyon ücreti alınmamaktadır. 
                  Komisyon oranları banka ve taksit sayısına göre değişiklik gösterebilir.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtreler */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4 bg-white rounded-lg p-4 shadow-sm">
            <label className="text-sm font-medium text-gray-700">Banka Filtresi:</label>
            <select 
              className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedBankId}
              onChange={(e) => setSelectedBankId(e.target.value)}
            >
              <option value="all">Tüm Bankalar ({commissionRates.length} taksit seçeneği)</option>
              {uniqueBanks.map((bank: any) => {
                const bankRatesCount = commissionRates.filter((r: any) => r.virtualPosConfigId === bank.id).length;
                return (
                  <option key={bank.id} value={bank.id}>
                    {bank.name} ({bankRatesCount} taksit seçeneği)
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        )}

        {/* Komisyon Oranları */}
        {!isLoading && (
          <div className="space-y-8">
            {Object.entries(groupedByBank).map(([bankName, rates]: [string, any]) => (
              <Card key={bankName} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <CardTitle className="text-xl flex items-center gap-3">
                    <BankLogo bankName={bankName} className="w-20 h-16" showName={false} />
                    <Badge variant="outline" className="ml-auto">
                      {rates.length} taksit seçeneği
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left py-3 px-6 font-semibold text-gray-700">Kart Türü</th>
                          <th className="text-left py-3 px-6 font-semibold text-gray-700">Taksit Sayısı</th>
                          <th className="text-left py-3 px-6 font-semibold text-gray-700">Komisyon Oranı</th>
                          <th className="text-left py-3 px-6 font-semibold text-gray-700">Minimum Tutar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rates
                          .sort((a: any, b: any) => a.installmentCount - b.installmentCount)
                          .map((rate: any) => (
                          <tr key={rate.id} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-gray-500" />
                                <span className="font-medium">
                                  {rate.cardType === 'all' ? 'Tüm Kartlar' : rate.cardType.toUpperCase()}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <Badge variant={rate.installmentCount === 1 ? "secondary" : "default"}>
                                {rate.installmentCount === 1 ? 'Tek Çekim' : `${rate.installmentCount} Ay`}
                              </Badge>
                            </td>
                            <td className="py-4 px-6">
                              <div className="text-lg font-bold text-blue-600">
                                %{parseFloat(rate.commissionRate).toFixed(2)}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-gray-600">
                                {parseFloat(rate.minAmount) > 0 ? `${parseFloat(rate.minAmount).toFixed(2)} ₺` : 'Limit yok'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Boş State */}
        {!isLoading && commissionRates.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz Komisyon Oranı Tanımlanmamış</h3>
            <p className="text-gray-600">Şu anda görüntülenecek komisyon oranı bulunmamaktadır.</p>
          </div>
        )}

        {/* Alt Bilgi */}
        <div className="mt-12 max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-orange-900 mb-2">Önemli Bilgiler</h3>
                  <ul className="text-orange-800 text-sm space-y-1">
                    <li>• Komisyon oranları değişiklik gösterebilir ve önceden haber verilmeksizin güncellenebilir.</li>
                    <li>• Tek çekim alışverişlerde komisyon ücreti alınmaz.</li>
                    <li>• Komisyon tutarları sepet toplamından otomatik olarak hesaplanır ve gösterilir.</li>
                    <li>• Farklı bankaların kartları için farklı komisyon oranları uygulanabilir.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}