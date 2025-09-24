# BeyazTicaret - Arçelik E-commerce Platform

Modern ve kullanıcı dostu bir e-ticaret platformu. Arçelik markası için tasarlanmış, Türkiye pazarına özel beyaz eşya, küçük ev aletleri ve elektronik ürünlerin satışını destekleyen tam özellikli bir web uygulaması.

![BeyazTicaret](https://img.shields.io/badge/Status-Active-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)

## 🌟 Özellikler

### 🛍️ E-commerce Özellikleri
- **Ürün Kataloğu**: Beyaz eşya, küçük ev aletleri, elektronik kategorileri
- **Gelişmiş Arama**: Ürün filtreleme ve sıralama seçenekleri
- **Sepet Yönetimi**: Ürün ekleme, çıkarma, miktar güncelleme
- **Favori Ürünler**: Beğenilen ürünleri kaydetme
- **Ürün Karşılaştırma**: Benzer ürünleri karşılaştırma

### 👤 Kullanıcı Yönetimi
- **Üye Kayıt/Giriş**: Güvenli kullanıcı kimlik doğrulama
- **Profil Yönetimi**: Kullanıcı bilgileri düzenleme
- **Adres Defteri**: Birden fazla teslimat adresi
- **Sipariş Geçmişi**: Geçmiş siparişleri görüntüleme

### 💳 Ödeme ve Teslimat
- **Güvenli Ödeme**: Kredi kartı ve havale seçenekleri
- **Taksit Seçenekleri**: Banka kampanyaları ve taksit imkanları
- **Kargo Takibi**: Sipariş durumu ve kargo takibi
- **İade Yönetimi**: Kolay iade süreçleri

### 🎯 İş Özellikleri
- **Kampanya Yönetimi**: Dinamik indirim ve kampanyalar
- **Blog Sistemi**: Ürün incelemeleri ve haberler
- **Müşteri Desteği**: Destek bileti sistemi
- **Canlı Destek**: WhatsApp entegrasyonu

### 🔧 Admin Paneli
- **Ürün Yönetimi**: Ürün ekleme, düzenleme, kategori yönetimi
- **Sipariş Yönetimi**: Sipariş durumu güncelleme
- **Kullanıcı Yönetimi**: Müşteri bilgileri ve yetkilendirme
- **İstatistikler**: Satış raporları ve analitikler
- **İçerik Yönetimi**: Slider, banner ve sayfa içerikleri

## 🛠️ Teknoloji Stack'i

### Frontend
- **React 18**: Modern component-based UI
- **TypeScript**: Type-safe geliştirme
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/UI**: Modern UI component kütüphanesi
- **Wouter**: Hafif client-side routing
- **TanStack Query**: Server state yönetimi
- **React Hook Form**: Form validasyonu
- **Vite**: Hızlı build ve geliştirme

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **TypeScript**: Type-safe backend geliştirme
- **Drizzle ORM**: Modern SQL ORM
- **PostgreSQL**: İlişkisel veritabanı
- **Zod**: Schema validation

### Altyapı
- **Neon Database**: Serverless PostgreSQL
- **Replit**: Geliştirme ortamı
- **PM2**: Production process manager

## 🚀 Local Kurulum

### Ön Koşullar
- Node.js 18+ kurulu olmalı
- PostgreSQL veritabanı (veya Neon hesabı)
- Git kurulu olmalı

### 1. Repo'yu Klonla
```bash
git clone https://github.com/username/beyazticaret.git
cd beyazticaret
```

### 2. Dependencies Kur
```bash
npm install
```

### 3. Environment Variables Ayarla
`.env.example` dosyasını `.env` olarak kopyala ve değerleri düzenle:

```bash
cp .env.example .env
```

`.env` dosyasında şu değerleri ayarla:
```env
# Development modunda
NODE_ENV=development
PORT=5000
HOST=localhost

# Database - Local PostgreSQL veya Neon
DATABASE_URL=postgresql://username:password@localhost:5432/beyazticaret_db

# Session secret
SESSION_SECRET=your_super_secret_key_here

# File uploads (local development)
PUBLIC_OBJECT_SEARCH_PATHS=./public/uploads

# Frontend için
VITE_API_URL=http://localhost:5000
```

### 4. Database Kurulumu

#### Local PostgreSQL kullanıyorsanız:
```bash
# PostgreSQL'de database oluştur
createdb beyazticaret_db

# Database schema'sını sync et
npm run db:push
```

#### Neon Database kullanıyorsanız:
1. [Neon Console](https://console.neon.tech)'da yeni bir database oluştur
2. Connection string'i `.env` dosyasına ekle
3. Schema'yı sync et:
```bash
npm run db:push
```

### 5. Uygulamayı Başlat

#### Development modu:
```bash
npm run dev
```

Bu komut hem frontend'i hem backend'i başlatır:
- Frontend: Hot reload ile Vite dev server
- Backend: TypeScript ile Express server
- Database: Otomatik bağlantı ve sync

#### Production build:
```bash
# Frontend'i build et
npm run build

# Production'da çalıştır
npm start
```

### 6. Tarayıcıda Aç
Uygulama `http://localhost:5000` adresinde çalışacak.

## 📁 Proje Yapısı

```
beyazticaret/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # UI komponenler
│   │   ├── pages/        # Sayfa komponenleri
│   │   ├── lib/          # Utility fonksiyonlar
│   │   └── hooks/        # Custom React hooks
├── server/               # Express backend
│   ├── routes.ts         # API endpoints
│   ├── storage.ts        # Database işlemleri
│   ├── index.ts          # Server başlangıç
│   └── db.ts             # Database bağlantısı
├── shared/               # Ortak tipler ve schema
│   └── schema.ts         # Database schema tanımları
├── public/               # Statik dosyalar
└── attached_assets/      # Proje görselleri
```

## 🎯 Geliştirme Komutları

```bash
# Development server başlat
npm run dev

# Frontend build
npm run build

# Production server
npm start

# Type checking
npm run check

# Database schema sync
npm run db:push

# Dependencies temizle ve yeniden kur
npm run install:clean
```

## 🌍 Deployment

### Replit'te Deploy
1. Replit'te projeyi import et
2. Environment variables'ı ayarla
3. `npm run dev` ile başlat

### VPS'te Deploy
1. Projeyi server'a klonla
2. Environment variables ayarla
3. PostgreSQL kur ve konfigüre et
4. `./deploy-vps.sh` script'ini çalıştır

### Production Checklist
- [ ] Environment variables ayarlandı
- [ ] Database bağlantısı test edildi
- [ ] Frontend build başarılı
- [ ] SSL sertifikası kuruldu
- [ ] Domain yapılandırması tamamlandı

## 🔒 Güvenlik

- Tüm API endpoint'lerde input validation
- SQL injection koruması (Drizzle ORM)
- XSS koruması
- CSRF token kullanımı
- Güvenli session yönetimi
- Rate limiting

## 🐛 Troubleshooting

### Yaygın Sorunlar

**Database bağlantı hatası:**
```bash
# Database URL'ini kontrol et
echo $DATABASE_URL

# Database schema'sını sync et
npm run db:push --force
```

**Port 5000 kullanımda:**
```bash
# Port'u değiştir (.env dosyasında)
PORT=3000

# Veya kullanımdaki process'i öldür
lsof -ti:5000 | xargs kill -9
```

**Dependencies hatası:**
```bash
# Node modules'ı temizle ve yeniden kur
npm run install:clean
```

## 🤝 Katkıda Bulunma

1. Fork et
2. Feature branch oluştur (`git checkout -b feature/yeni-ozellik`)
3. Değişiklikleri commit et (`git commit -am 'Yeni özellik eklendi'`)
4. Branch'i push et (`git push origin feature/yeni-ozellik`)
5. Pull Request oluştur

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

- **Proje Sahibi**: [GitHub Profile](https://github.com/username)
- **Website**: [enderouttlet.com](http://enderouttlet.com)

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!