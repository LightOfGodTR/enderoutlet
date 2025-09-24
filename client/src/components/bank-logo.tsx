// Import real bank logos
import akbankLogo from "@assets/Akbank_logo.svg_1757584434953.png";
import garantiBBVALogo from "@assets/Garanti_BBVA_1757584434956.png";
import isBankasiLogo from "@assets/pngwing.com_1757584598808.png";

interface BankLogoProps {
  bankName: string;
  className?: string;
  showName?: boolean;
}

export default function BankLogo({ bankName, className = "w-8 h-8", showName = true }: BankLogoProps) {
  const getBankLogoUrl = (name: string): string => {
    const normalizedName = name.toLowerCase().trim();
    
    switch (normalizedName) {
      case 'garanti bbva':
        return garantiBBVALogo;
      case 'iş bankası':
      case 'türkiye iş bankası':
        return isBankasiLogo;
      case 'akbank':
        return akbankLogo;
      case 'halkbank':
        return 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/T%C3%BCrkiye_Halk_Bankas%C4%B1_logo.svg/512px-T%C3%BCrkiye_Halk_Bankas%C4%B1_logo.svg.png';
      case 'vakıfbank':
      case 'vakifbank':
        return 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/VakifBank_logo.svg/512px-VakifBank_logo.svg.png';
      case 'ziraat bankası':
      case 'ziraat':
        return 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Ziraat_Bankas%C4%B1_logo.svg/512px-Ziraat_Bankas%C4%B1_logo.svg.png';
      case 'yapı kredi':
      case 'yapı kredi bankası':
        return 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Yapi_Kredi_logo.svg/512px-Yapi_Kredi_logo.svg.png';
      case 'denizbank':
        return 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/DenizBank_logo.svg/512px-DenizBank_logo.svg.png';
      default:
        // Generic bank icon fallback
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgMTBIMjFWMTJIM1YxMFoiIGZpbGw9IiM0Qjc3QkUiLz4KPHA7cmVjdCB4PSI1IiB5PSIxMiIgd2lkdGg9IjIiIGhlaWdodD0iOCIgZmlsbD0iIzRCNzdCRSIvPgo8cmVjdCB4PSI5IiB5PSIxMiIgd2lkdGg9IjIiIGhlaWdodD0iOCIgZmlsbD0iIzRCNzdCRSIvPgo8cmVjdCB4PSIxMyIgeT0iMTIiIHdpZHRoPSIyIiBoZWlnaHQ9IjgiIGZpbGw9IiM0Qjc3QkUiLz4KPHJlY3QgeD0iMTciIHk9IjEyIiB3aWR0aD0iMiIgaGVpZ2h0PSI4IiBmaWxsPSIjNEI3N0JFIi8+CjxyZWN0IHg9IjMiIHk9IjIwIiB3aWR0aD0iMTgiIGhlaWdodD0iMiIgZmlsbD0iIzRCNzdCRSIvPgo8cGF0aCBkPSJNMTIgNEwzIDhIMjFMMTIgNFoiIGZpbGw9IiM0Qjc3QkUiLz4KPC9zdmc+';
    }
  };

  const getBankDisplayName = (name: string): string => {
    const normalizedName = name.toLowerCase().trim();
    
    switch (normalizedName) {
      case 'garanti bbva':
        return 'Garanti BBVA';
      case 'iş bankası':
      case 'türkiye iş bankası':
        return 'İş Bankası';
      case 'akbank':
        return 'Akbank';
      case 'halkbank':
        return 'Halkbank';
      case 'vakıfbank':
      case 'vakifbank':
        return 'VakıfBank';
      case 'ziraat bankası':
      case 'ziraat':
        return 'Ziraat Bankası';
      case 'yapı kredi':
      case 'yapı kredi bankası':
        return 'Yapı Kredi';
      case 'denizbank':
        return 'DenizBank';
      default:
        return name;
    }
  };

  const logoUrl = getBankLogoUrl(bankName);
  const displayName = getBankDisplayName(bankName);

  if (showName) {
    return (
      <div className="flex items-center space-x-3">
        <img
          src={logoUrl}
          alt={`${displayName} Logo`}
          className={`object-contain ${className}`}
          onError={(e) => {
            // Fallback to generic bank icon if image fails to load
            const target = e.target as HTMLImageElement;
            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHA7cmVjdCB4PSI0IiB5PSIxMCIgd2lkdGg9IjE2IiBoZWlnaHQ9IjIiIGZpbGw9IiM0Qjc3QkUiLz4KPHJlY3QgeD0iNiIgeT0iMTIiIHdpZHRoPSIyIiBoZWlnaHQ9IjgiIGZpbGw9IiM0Qjc3QkUiLz4KPHJlY3QgeD0iMTAiIHk9IjEyIiB3aWR0aD0iMiIgaGVpZ2h0PSI4IiBmaWxsPSIjNEI3N0JFIi8+CjxyZWN0IHg9IjE0IiB5PSIxMiIgd2lkdGg9IjIiIGhlaWdodD0iOCIgZmlsbD0iIzRCNzdCRSIvPgo8cmVjdCB4PSIzIiB5PSIyMCIgd2lkdGg9IjE4IiBoZWlnaHQ9IjIiIGZpbGw9IiM0Qjc3QkUiLz4KPHA7cGF0aCBkPSJNMTIgNEwzIDhIMjFMMTIgNFoiIGZpbGw9IiM0Qjc3QkUiLz4KPC9zdmc+';
          }}
        />
        <span>{displayName}</span>
      </div>
    );
  }

  // Only show logo
  return (
    <img
      src={logoUrl}
      alt={`${displayName} Logo`}
      className={`object-contain ${className}`}
      onError={(e) => {
        // Fallback to generic bank icon if image fails to load
        const target = e.target as HTMLImageElement;
        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHA7cmVjdCB4PSI0IiB5PSIxMCIgd2lkdGg9IjE2IiBoZWlnaHQ9IjIiIGZpbGw9IiM0Qjc3QkUiLz4KPHJlY3QgeD0iNiIgeT0iMTIiIHdpZHRoPSIyIiBoZWlnaHQ9IjgiIGZpbGw9IiM0Qjc3QkUiLz4KPHJlY3QgeD0iMTAiIHk9IjEyIiB3aWR0aD0iMiIgaGVpZ2h0PSI4IiBmaWxsPSIjNEI3N0JFIi8+CjxyZWN0IHg9IjE0IiB5PSIxMiIgd2lkdGg9IjIiIGhlaWdodD0iOCIgZmlsbD0iIzRCNzdCRSIvPgo8cmVjdCB4PSIzIiB5PSIyMCIgd2lkdGg9IjE4IiBoZWlnaHQ9IjIiIGZpbGw9IiM0Qjc3QkUiLz4KPHA7cGF0aCBkPSJNMTIgNEwzIDhIMjFMMTIgNFoiIGZpbGw9IiM0Qjc3QkUiLz4KPC9zdmc+';
      }}
    />
  );
}