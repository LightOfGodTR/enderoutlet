#!/bin/bash

echo "🚀 BeyazTicaret VPS Deployment - Basit Versiyon"
echo "=============================================="

# Renk kodları
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Hata durumunda çık
set -e

# 1️⃣ Dependencies kurulumu
echo -e "${YELLOW}📦 Dependencies kuruluyor...${NC}"
npm ci

# 2️⃣ Frontend build
echo -e "${YELLOW}🔨 Frontend build yapılıyor...${NC}"
npm run build

# 3️⃣ Database sync
echo -e "${YELLOW}🗄️ Database sync...${NC}"
npm run db:push

# 4️⃣ Log klasörü oluştur
mkdir -p logs

# 5️⃣ PM2 prosesleri temizle (varsa)
echo -e "${YELLOW}🧹 Eski PM2 proseslerini temizliyor...${NC}"
pm2 delete beyazticaret 2>/dev/null || echo "Eski proses bulunamadı, devam ediliyor..."

# 6️⃣ PM2 ile başlat
echo -e "${YELLOW}🚀 Site başlatılıyor...${NC}"
pm2 start ecosystem.config.cjs

# 7️⃣ PM2 ayarları
pm2 save
pm2 startup

# 8️⃣ Durum kontrolü
echo -e "${YELLOW}📊 Durum kontrol ediliyor...${NC}"
sleep 3
pm2 status

# 9️⃣ Port kontrolü
if netstat -tlnp | grep -q ":5000"; then
    echo -e "${GREEN}✅ Site 5000 portunda çalışıyor!${NC}"
else
    echo -e "${RED}❌ 5000 portu dinlenmiyor!${NC}"
fi

echo ""
echo -e "${GREEN}✅ DEPLOYMENT TAMAMLANDI!${NC}"
echo -e "${GREEN}🌐 Site adresleri:${NC}"
echo -e "${GREEN}   - IP: http://84.201.5.238:5000${NC}"
echo -e "${GREEN}   - Domain: http://enderouttlet.com${NC}"
echo ""
echo -e "${YELLOW}📊 Yönetim komutları:${NC}"
echo "   - pm2 status                 (Durum)"
echo "   - pm2 logs beyazticaret      (Loglar)"
echo "   - pm2 restart beyazticaret   (Restart)"
echo ""