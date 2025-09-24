import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Info } from "lucide-react";
import BankLogo from "@/components/bank-logo";

interface CommissionRate {
  id: string;
  virtualPosConfigId: string;
  bankName: string;
  cardType: string;
  installmentCount: number;
  commissionRate: string;
  minAmount: string;
}

interface InstallmentOptionsProps {
  productPrice: number;
  className?: string;
}

export default function InstallmentOptions({ productPrice, className = "" }: InstallmentOptionsProps) {
  // Komisyon oranlarını getir
  const { data: commissionRates = [], isLoading, error } = useQuery<CommissionRate[]>({
    queryKey: ['/api/commission-rates'],
  });

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Taksit Seçenekleri</h3>
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !commissionRates.length) {
    return (
      <div className={`${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Taksit Seçenekleri</h3>
        <div className="bg-gray-50 border rounded-lg p-6 text-center">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Taksit seçenekleri şu anda mevcut değil.</p>
        </div>
      </div>
    );
  }

  // Ürün fiyatına uygun komisyon oranlarını filtrele
  const eligibleRates = commissionRates.filter((rate: CommissionRate) => {
    const minAmount = parseFloat(rate.minAmount);
    return isNaN(minAmount) || minAmount <= 0 || productPrice >= minAmount;
  });

  // Bankaları grupla
  const groupedByBank = eligibleRates.reduce((acc: any, rate: CommissionRate) => {
    if (!acc[rate.bankName]) {
      acc[rate.bankName] = [];
    }
    acc[rate.bankName].push(rate);
    return acc;
  }, {});

  // Taksit hesaplama fonksiyonu
  const calculateInstallment = (rate: CommissionRate) => {
    const installmentCount = rate.installmentCount;
    const commissionRate = parseFloat(rate.commissionRate);
    
    // Tek çekim için komisyon sıfır
    const effectiveCommissionRate = installmentCount === 1 ? 0 : commissionRate;
    
    const totalAmount = productPrice * (1 + effectiveCommissionRate / 100);
    const monthlyAmount = totalAmount / installmentCount;
    
    return {
      totalAmount: totalAmount,
      monthlyAmount: monthlyAmount,
      commissionRate: effectiveCommissionRate
    };
  };

  // Eğer hiç uygun seçenek yoksa
  if (Object.keys(groupedByBank).length === 0) {
    return (
      <div className={`${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Taksit Seçenekleri</h3>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-yellow-800 text-sm">
                Bu ürün için minimum tutarı karşılamadığından taksit seçeneği bulunmamaktadır.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Taksit Seçenekleri</h3>
      
      {/* Bilgilendirme */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-left">
            <p className="text-blue-800 text-sm leading-relaxed">
              Aşağıdaki taksit seçenekleri bu ürün için geçerlidir. 
              Tek çekim alışverişlerde komisyon ücreti alınmaz.
            </p>
          </div>
        </div>
      </div>

      {/* Banka bazında taksit seçenekleri */}
      <div className="space-y-6">
        {Object.entries(groupedByBank).map(([bankName, rates]: [string, any]) => {
          // Taksit sayısına göre sırala
          const sortedRates = rates.sort((a: CommissionRate, b: CommissionRate) => 
            a.installmentCount - b.installmentCount
          );

          return (
            <Card key={bankName} className="overflow-hidden" data-testid={`bank-installments-${bankName.toLowerCase().replace(/\s+/g, '-')}`}>
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 py-3">
                <CardTitle className="text-lg flex items-center gap-3">
                  <BankLogo bankName={bankName} className="w-16 h-12" showName={false} />
                  <span className="font-medium">{bankName}</span>
                  <Badge variant="outline" className="ml-auto">
                    {sortedRates.length} seçenek
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Taksit</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Komisyon</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Aylık Tutar</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Toplam Tutar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedRates.map((rate: CommissionRate) => {
                        const calculation = calculateInstallment(rate);
                        const bankId = bankName.toLowerCase().replace(/\s+/g, '-');
                        
                        return (
                          <tr 
                            key={rate.id} 
                            className="border-b hover:bg-gray-50 transition-colors"
                            data-testid={`row-installment-${bankId}-${rate.installmentCount}`}
                          >
                            <td className="py-3 px-4">
                              <Badge variant={rate.installmentCount === 1 ? "secondary" : "default"}>
                                {rate.installmentCount === 1 ? 'Tek Çekim' : `${rate.installmentCount} Ay`}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`font-semibold ${calculation.commissionRate === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                                %{calculation.commissionRate.toFixed(2)}
                              </span>
                            </td>
                            <td className="py-3 px-4" data-testid={`text-monthly-${bankId}-${rate.installmentCount}`}>
                              <span className="font-bold text-primary">
                                {calculation.monthlyAmount.toLocaleString("tr-TR", { 
                                  minimumFractionDigits: 2, 
                                  maximumFractionDigits: 2 
                                })} ₺
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-gray-700 font-medium">
                                {calculation.totalAmount.toLocaleString("tr-TR", { 
                                  minimumFractionDigits: 2, 
                                  maximumFractionDigits: 2 
                                })} ₺
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}