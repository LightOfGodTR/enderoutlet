import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      console.error('EMAIL_USER and EMAIL_PASS environment variables are required');
      return;
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  }

  async sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.error('Email transporter not configured');
      return false;
    }

    try {
      const mailOptions = {
        from: `"Ender Arçelik" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to: ${to}`);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  async sendOrderConfirmationEmail(
    email: string, 
    order: any, 
    orderItems: any[], 
    userAddress: any
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sipariş Onayı - Ender Arçelik</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
          }
          
          .email-container {
            max-width: 680px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
          }
          
          .header {
            background: linear-gradient(135deg, #e53e3e 0%, #c53030 50%, #9b2c2c 100%);
            padding: 80px 50px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.08) 2px, transparent 2px);
            background-size: 40px 40px;
            animation: float 30s infinite linear;
          }
          
          @keyframes float {
            0% { transform: rotate(0deg) scale(1); }
            50% { transform: rotate(180deg) scale(1.1); }
            100% { transform: rotate(360deg) scale(1); }
          }
          
          .logo {
            position: relative;
            z-index: 3;
            display: inline-block;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(30px);
            padding: 40px 80px;
            border-radius: 24px;
            border: 2px solid rgba(255, 255, 255, 0.15);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          }
          
          .logo-text {
            font-size: 56px;
            font-weight: 900;
            color: #ffffff;
            text-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
            letter-spacing: 8px;
            margin-bottom: 12px;
            font-family: 'Arial Black', sans-serif;
          }
          
          .logo-subtitle {
            font-size: 20px;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.92);
            letter-spacing: 14px;
            text-transform: uppercase;
          }
          
          .content {
            padding: 60px 50px;
          }
          
          .success-header {
            text-align: center;
            margin-bottom: 50px;
          }
          
          .success-icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
            color: white;
            margin: 0 auto 25px;
            box-shadow: 0 15px 35px rgba(72, 187, 120, 0.3);
          }
          
          .success-title {
            font-size: 32px;
            font-weight: 800;
            color: #1a202c;
            margin-bottom: 15px;
            text-align: center;
          }
          
          .success-subtitle {
            font-size: 18px;
            color: #4a5568;
            line-height: 1.6;
            text-align: center;
          }
          
          .order-badge {
            background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
            border: 2px solid #e2e8f0;
            border-radius: 20px;
            padding: 30px;
            margin: 40px 0;
            text-align: center;
          }
          
          .order-number {
            font-size: 24px;
            font-weight: 800;
            color: #2d3748;
            margin-bottom: 8px;
          }
          
          .order-date {
            font-size: 16px;
            color: #718096;
          }
          
          .card {
            background: #ffffff;
            border-radius: 20px;
            margin: 35px 0;
            overflow: hidden;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
            border: 1px solid #f0f0f0;
          }
          
          .card-header {
            background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
            color: white;
            padding: 25px 35px;
            font-size: 20px;
            font-weight: 700;
            display: flex;
            align-items: center;
          }
          
          .card-icon {
            font-size: 28px;
            margin-right: 15px;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
          }
          
          .product-list {
            padding: 0;
          }
          
          .product-item {
            padding: 30px 35px;
            border-bottom: 1px solid #f7fafc;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: all 0.3s ease;
          }
          
          .product-item:hover {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            transform: translateY(-1px);
          }
          
          .product-item:last-child {
            border-bottom: none;
          }
          
          .product-info {
            flex: 1;
          }
          
          .product-name {
            font-size: 18px;
            font-weight: 700;
            color: #1a202c;
            margin-bottom: 8px;
          }
          
          .product-details {
            font-size: 15px;
            color: #718096;
            line-height: 1.5;
          }
          
          .product-price {
            font-size: 20px;
            font-weight: 800;
            color: #e53e3e;
            background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%);
            padding: 12px 20px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(229, 62, 62, 0.15);
          }
          
          .total-section {
            background: linear-gradient(135deg, #e6fffa 0%, #b2f5ea 50%, #81e6d9 100%);
            padding: 40px;
            border-radius: 24px;
            text-align: center;
            margin: 40px 0;
            border: 3px solid #4fd1c7;
            box-shadow: 0 12px 30px rgba(79, 209, 199, 0.2);
          }
          
          .total-label {
            font-size: 18px;
            font-weight: 600;
            color: #234e52;
            margin-bottom: 10px;
          }
          
          .total-amount {
            font-size: 38px;
            font-weight: 900;
            color: #1a202c;
            margin-bottom: 20px;
            text-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
          }
          
          .payment-status {
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            color: white;
            padding: 15px 30px;
            border-radius: 50px;
            font-size: 18px;
            font-weight: 700;
            display: inline-block;
            box-shadow: 0 6px 20px rgba(72, 187, 120, 0.4);
          }
          
          .address-info {
            padding: 30px 35px;
          }
          
          .address-name {
            font-size: 18px;
            font-weight: 700;
            color: #1a202c;
            margin-bottom: 12px;
          }
          
          .address-details {
            font-size: 16px;
            color: #4a5568;
            line-height: 1.7;
          }
          
          .footer {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 50px;
            text-align: center;
            border-top: 4px solid #cbd5e0;
          }
          
          .company-info {
            margin-bottom: 30px;
          }
          
          .company-name {
            font-size: 18px;
            font-weight: 800;
            color: #2d3748;
            margin-bottom: 15px;
          }
          
          .contact-info {
            background: #ffffff;
            padding: 25px;
            border-radius: 16px;
            font-size: 16px;
            color: #4a5568;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          }
          
          .disclaimer {
            margin-top: 25px;
            font-size: 13px;
            color: #a0aec0;
            line-height: 1.6;
          }
          
          @media only screen and (max-width: 600px) {
            body { padding: 20px 10px; }
            .email-container { border-radius: 16px; }
            .header { padding: 50px 30px; }
            .content { padding: 40px 25px; }
            .footer { padding: 40px 25px; }
            .logo { padding: 25px 50px; }
            .logo-text { font-size: 40px; letter-spacing: 4px; }
            .logo-subtitle { letter-spacing: 10px; font-size: 16px; }
            .product-item { 
              flex-direction: column; 
              align-items: flex-start;
              text-align: left;
            }
            .product-price { 
              margin-top: 15px; 
              align-self: flex-end;
            }
            .total-amount { font-size: 28px; }
            .success-title { font-size: 24px; }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="logo">
              <div class="logo-text">ENDER</div>
              <div class="logo-subtitle">ARÇELİK</div>
            </div>
          </div>
          
          <div class="content">
            <div class="success-header">
              <div class="success-icon">✨</div>
              <div class="success-title">Siparişiniz Başarıyla Alındı!</div>
              <div class="success-subtitle">
                Siparişiniz tarafımıza ulaşmıştır ve en kısa sürede işleme alınacaktır. 
                Aşağıdan sipariş detaylarınızı inceleyebilirsiniz.
              </div>
            </div>
            
            <div class="order-badge">
              <div class="order-number">📋 Sipariş No: ${order.orderNumber}</div>
              <div class="order-date">📅 Sipariş Tarihi: ${new Date().toLocaleDateString('tr-TR', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}</div>
            </div>
            
            <div class="card">
              <div class="card-header">
                <span class="card-icon">🛍️</span>
                Sipariş Detayları
              </div>
              <div class="product-list">
                ${orderItems.map(item => `
                  <div class="product-item">
                    <div class="product-info">
                      <div class="product-name">${item.product?.name || 'Ürün'}</div>
                      <div class="product-details">
                        📦 Adet: ${item.quantity} • 🛡️ ${item.warranty || 'Standart Garanti'}
                      </div>
                    </div>
                    <div class="product-price">₺${parseFloat(item.price).toLocaleString('tr-TR')}</div>
                  </div>
                `).join('')}
              </div>
            </div>
            
            <div class="total-section">
              <div class="total-label">Toplam Tutar</div>
              <div class="total-amount">₺${parseFloat(order.totalAmount).toLocaleString('tr-TR')}</div>
              <div class="payment-status">✅ Ödeme Onaylandı</div>
            </div>
            
            <div class="card">
              <div class="card-header">
                <span class="card-icon">🚚</span>
                Teslimat Bilgileri
              </div>
              <div class="address-info">
                <div class="address-name">${userAddress?.fullName || 'Sayın Müşterimiz'}</div>
                <div class="address-details">
                  📍 ${userAddress?.address || 'Adres bilgisi mevcut değil'}<br>
                  ${userAddress?.district || ''} ${userAddress?.city || ''}<br>
                  📱 Tel: ${userAddress?.phoneNumber || 'Telefon bilgisi mevcut değil'}
                </div>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <div class="company-info">
              <div class="company-name">ENDER DAY. TÜKETİM MALLARI İNŞ. TUR. SAN. VE TİC. LTD. ŞTİ.</div>
            </div>
            <div class="contact-info">
              📞 <strong>(0212) 880 40 95</strong> • ✉️ <strong>info@enderarcelik.com</strong>
            </div>
            <div class="disclaimer">
              Bu e-posta otomatik olarak gönderilmiştir. Sorularınız için müşteri hizmetlerimizle iletişime geçebilirsiniz.<br>
              Siparişinizle ilgili güncellemeler için e-posta adresinizi takip etmeyi unutmayın.
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `✨ Siparişiniz Onaylandı - ${order.orderNumber} - Ender Arçelik`,
      html,
    });
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hoş Geldiniz - Ender Arçelik</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
          }
          .header {
            background: linear-gradient(135deg, #e53e3e 0%, #c53030 50%, #9b2c2c 100%);
            padding: 60px 40px;
            text-align: center;
            color: white;
          }
          .logo-text {
            font-size: 42px;
            font-weight: 900;
            color: #ffffff;
            text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            margin-bottom: 10px;
          }
          .welcome-subtitle {
            font-size: 20px;
            color: rgba(255, 255, 255, 0.9);
            font-weight: 300;
          }
          .content {
            padding: 50px 40px;
            text-align: center;
          }
          .welcome-message {
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            color: white;
            padding: 30px;
            border-radius: 16px;
            margin: 30px 0;
          }
          .features-list {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 16px;
            margin: 30px 0;
            text-align: left;
          }
          .feature-item {
            display: flex;
            align-items: center;
            margin: 15px 0;
            font-size: 16px;
            color: #2d3748;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: bold;
            font-size: 18px;
            margin: 20px 0;
            box-shadow: 0 8px 20px rgba(229, 62, 62, 0.3);
          }
          .footer {
            background: #f8f9fa;
            padding: 40px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          .company-info {
            font-size: 14px;
            color: #4a5568;
            margin-bottom: 10px;
          }
          .contact-info {
            font-size: 14px;
            color: #718096;
            margin-bottom: 15px;
          }
          .disclaimer {
            font-size: 12px;
            color: #a0aec0;
            line-height: 1.5;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="logo-text">ENDER ARÇELİK</div>
            <p class="welcome-subtitle">Ailemize Hoş Geldiniz!</p>
          </div>
          
          <div class="content">
            <div class="welcome-message">
              <h2 style="margin-bottom: 15px;">🎉 Hoş Geldiniz ${firstName}!</h2>
              <p style="font-size: 18px; margin: 0;">
                Ender Arçelik ailesine katıldığınız için teşekkür ederiz! Kaliteli ev aletleri dünyasına adım attınız.
              </p>
            </div>
            
            <div class="features-list">
              <h3 style="color: #2d3748; margin-bottom: 20px; text-align: center;">Size Sunduğumuz Avantajlar</h3>
              <div class="feature-item">
                🏠 <span style="margin-left: 12px;"><strong>Geniş Ürün Yelpazesi:</strong> Buzdolabı, çamaşır makinesi, fırın ve daha fazlası</span>
              </div>
              <div class="feature-item">
                🚚 <span style="margin-left: 12px;"><strong>Hızlı Teslimat:</strong> Türkiye geneli güvenli kargo</span>
              </div>
              <div class="feature-item">
                🔧 <span style="margin-left: 12px;"><strong>Profesyonel Servis:</strong> Uzman teknik destek ekibimiz</span>
              </div>
              <div class="feature-item">
                💰 <span style="margin-left: 12px;"><strong>Özel Kampanyalar:</strong> Sadece üyelerimize özel indirimler</span>
              </div>
              <div class="feature-item">
                📞 <span style="margin-left: 12px;"><strong>7/24 Müşteri Hizmetleri:</strong> Her zaman yanınızdayız</span>
              </div>
            </div>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/products" class="cta-button">
              🛍️ Alışverişe Başla
            </a>
            
            <p style="margin-top: 30px; color: #718096;">
              Hesabınızı güvenli tutmak için e-posta ve telefon numaranızı doğrulamayı unutmayın!
            </p>
          </div>
          
          <div class="footer">
            <div class="company-info">
              <div style="font-weight: bold; color: #2d3748; margin-bottom: 5px;">ENDER DAY. TÜKETİM MALLARI İNŞ. TUR. SAN. VE TİC. LTD. ŞTİ.</div>
            </div>
            <div class="contact-info">
              📞 <strong>(0212) 880 40 95</strong> • ✉️ <strong>info@enderarcelik.com</strong>
            </div>
            <div class="disclaimer">
              Bu e-posta güvenlik amacıyla otomatik olarak gönderilmiştir.<br>
              Sorularınız için müşteri hizmetlerimizle 7/24 iletişime geçebilirsiniz.
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log(`Welcome email sent to: ${email}`);
    return this.sendEmail({
      to: email,
      subject: '🎉 Hoş Geldiniz! Ender Arçelik Ailesine Katıldınız',
      html,
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    const baseUrl = process.env.REPLIT_DOMAINS?.split(',')[0] || 'https://your-domain.replit.dev';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Şifre Sıfırlama - Ender Arçelik</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
          }
          
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
          }
          
          .header {
            background: linear-gradient(135deg, #e53e3e 0%, #c53030 50%, #9b2c2c 100%);
            padding: 80px 50px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.08) 2px, transparent 2px);
            background-size: 40px 40px;
            animation: float 30s infinite linear;
          }
          
          @keyframes float {
            0% { transform: rotate(0deg) scale(1); }
            50% { transform: rotate(180deg) scale(1.1); }
            100% { transform: rotate(360deg) scale(1); }
          }
          
          .logo {
            position: relative;
            z-index: 3;
            display: inline-block;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(30px);
            padding: 40px 80px;
            border-radius: 24px;
            border: 2px solid rgba(255, 255, 255, 0.15);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          }
          
          .logo-text {
            font-size: 56px;
            font-weight: 900;
            color: #ffffff;
            text-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
            letter-spacing: 8px;
            margin-bottom: 12px;
            font-family: 'Arial Black', sans-serif;
          }
          
          .logo-subtitle {
            font-size: 20px;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.92);
            letter-spacing: 14px;
            text-transform: uppercase;
          }
          
          .content {
            padding: 60px 50px;
          }
          
          .security-header {
            text-align: center;
            margin-bottom: 50px;
          }
          
          .security-icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #3182ce 0%, #2c5282 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
            color: white;
            margin: 0 auto 25px;
            box-shadow: 0 15px 35px rgba(49, 130, 206, 0.3);
          }
          
          .security-title {
            font-size: 32px;
            font-weight: 800;
            color: #1a202c;
            margin-bottom: 15px;
          }
          
          .security-subtitle {
            font-size: 18px;
            color: #4a5568;
            line-height: 1.6;
          }
          
          .info-card {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border: 2px solid #bfdbfe;
            border-radius: 20px;
            padding: 35px;
            margin: 40px 0;
            text-align: center;
          }
          
          .info-text {
            font-size: 17px;
            color: #1e40af;
            line-height: 1.7;
            margin-bottom: 25px;
          }
          
          .reset-button {
            display: inline-block;
            background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
            color: white;
            padding: 18px 40px;
            border-radius: 50px;
            font-size: 18px;
            font-weight: 700;
            text-decoration: none;
            box-shadow: 0 8px 25px rgba(229, 62, 62, 0.3);
            transition: all 0.3s ease;
          }
          
          .reset-button:hover {
            background: linear-gradient(135deg, #c53030 0%, #9b2c2c 100%);
            transform: translateY(-2px);
            box-shadow: 0 12px 35px rgba(229, 62, 62, 0.4);
          }
          
          .security-notice {
            background: linear-gradient(135deg, #fef5e7 0%, #fed7aa 100%);
            border: 2px solid #f6ad55;
            border-radius: 16px;
            padding: 25px;
            margin: 40px 0;
          }
          
          .notice-title {
            font-size: 18px;
            font-weight: 700;
            color: #c05621;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
          }
          
          .notice-icon {
            font-size: 24px;
            margin-right: 10px;
          }
          
          .notice-text {
            font-size: 15px;
            color: #744210;
            line-height: 1.6;
          }
          
          .footer {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 50px;
            text-align: center;
            border-top: 4px solid #cbd5e0;
          }
          
          .company-info {
            margin-bottom: 30px;
          }
          
          .company-name {
            font-size: 18px;
            font-weight: 800;
            color: #2d3748;
            margin-bottom: 15px;
          }
          
          .contact-info {
            background: #ffffff;
            padding: 25px;
            border-radius: 16px;
            font-size: 16px;
            color: #4a5568;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          }
          
          .disclaimer {
            margin-top: 25px;
            font-size: 13px;
            color: #a0aec0;
            line-height: 1.6;
          }
          
          @media only screen and (max-width: 600px) {
            body { padding: 20px 10px; }
            .email-container { border-radius: 16px; }
            .header { padding: 50px 30px; }
            .content { padding: 40px 25px; }
            .footer { padding: 40px 25px; }
            .logo { padding: 25px 50px; }
            .logo-text { font-size: 40px; letter-spacing: 4px; }
            .logo-subtitle { letter-spacing: 10px; font-size: 16px; }
            .security-title { font-size: 24px; }
            .reset-button { padding: 15px 30px; font-size: 16px; }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="logo">
              <div class="logo-text">ENDER</div>
              <div class="logo-subtitle">ARÇELİK</div>
            </div>
          </div>
          
          <div class="content">
            <div class="security-header">
              <div class="security-icon">🔒</div>
              <div class="security-title">Şifre Sıfırlama Talebi</div>
              <div class="security-subtitle">
                Hesabınız için şifre sıfırlama talebinde bulundunuz.
                Güvenliğiniz bizim önceliğimizdir.
              </div>
            </div>
            
            <div class="info-card">
              <div class="info-text">
                Şifrenizi sıfırlamak için aşağıdaki butona tıklayın. Bu link 1 saat süreyle geçerli olacaktır.
              </div>
              <a href="${resetUrl}" class="reset-button">
                🔑 Şifremi Sıfırla
              </a>
            </div>
            
            <div class="security-notice">
              <div class="notice-title">
                <span class="notice-icon">⚠️</span>
                Güvenlik Uyarısı
              </div>
              <div class="notice-text">
                • Bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz<br>
                • Linke tıklamadan önce URL'nin doğru olduğundan emin olun<br>
                • Şifrenizi kimseyle paylaşmayın ve güvenli bir şifre seçin<br>
                • Hesabınızda şüpheli aktivite fark ederseniz derhal bizimle iletişime geçin
              </div>
            </div>
          </div>
          
          <div class="footer">
            <div class="company-info">
              <div class="company-name">ENDER DAY. TÜKETİM MALLARI İNŞ. TUR. SAN. VE TİC. LTD. ŞTİ.</div>
            </div>
            <div class="contact-info">
              📞 <strong>(0212) 880 40 95</strong> • ✉️ <strong>info@enderarcelik.com</strong>
            </div>
            <div class="disclaimer">
              Bu e-posta güvenlik amacıyla otomatik olarak gönderilmiştir.<br>
              Sorularınız için müşteri hizmetlerimizle 7/24 iletişime geçebilirsiniz.
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log(`Password reset email sent to: ${email}`);
    return this.sendEmail({
      to: email,
      subject: '🔒 Şifre Sıfırlama Talebi - Ender Arçelik',
      html,
    });
  }

  async sendOrderStatusUpdateEmail(
    email: string,
    order: any,
    oldStatus: string,
    newStatus: string
  ): Promise<boolean> {
    const statusTexts: { [key: string]: string } = {
      pending: 'Ödeme Bekleniyor',
      preparing: 'Hazırlanıyor',
      ready_to_ship: 'Çıkışa Hazır',
      shipped: 'Kargoya Teslim Edildi',
      in_transit: 'Kargodan Çıktı',
      delivered: 'Teslim Edildi',
      cancelled: 'İptal Edildi'
    };

    const statusDescriptions: { [key: string]: string } = {
      pending: '💳 Ödemeniz henüz tamamlanmadı. Lütfen ödeme işlemini tamamlayın.',
      preparing: '🔧 Siparişiniz özenle hazırlanıyor! Ürünleriniz kalite kontrol sürecinden geçiyor ve ambalajlanıyor.',
      ready_to_ship: '📦 Harika! Siparişiniz hazır ve en kısa sürede kargo şirketine teslim edilecek.',
      shipped: '🚛 Siparişiniz kargo şirketine teslim edildi! ' + (order.trackingCode ? `Kargo takip kodunuz: ${order.trackingCode}` : 'Kargo takip numaranız yakında e-posta ile sizinle paylaşılacaktır.'),
      in_transit: '🚚 Siparişiniz yolda! Kargo aracında ve size doğru geliyoruz.',
      delivered: '🎉 Muhteşem! Siparişiniz teslim edildi. Ürünlerimizi beğeneceğinizi umuyoruz!',
      cancelled: '❌ Siparişiniz iptal edildi. Herhangi bir sorunuz varsa müşteri hizmetlerimizle iletişime geçebilirsiniz.'
    };

    const statusColors: { [key: string]: string } = {
      pending: '#e53e3e',
      preparing: '#3182ce',
      ready_to_ship: '#805ad5',
      shipped: '#38a169',
      in_transit: '#dd6b20',
      delivered: '#38a169',
      cancelled: '#e53e3e'
    };

    const html = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sipariş Durumu Güncellemesi - Ender Arçelik</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
          }
          .header {
            background: linear-gradient(135deg, #e53e3e 0%, #c53030 50%, #9b2c2c 100%);
            padding: 60px 40px;
            text-align: center;
            color: white;
          }
          .logo-text {
            font-size: 36px;
            font-weight: 900;
            margin-bottom: 10px;
          }
          .content {
            padding: 40px;
          }
          .status-update {
            background: linear-gradient(135deg, ${statusColors[newStatus]} 0%, ${statusColors[newStatus]}bb 100%);
            color: white;
            padding: 30px;
            border-radius: 16px;
            text-align: center;
            margin: 20px 0;
          }
          .order-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 12px;
            margin: 20px 0;
          }
          .order-number {
            font-size: 18px;
            font-weight: bold;
            color: #e53e3e;
          }
          .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            font-size: 14px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="logo-text">Ender Arçelik</div>
            <p>Siparişinizde güncelleme var!</p>
          </div>
          
          <div class="content">
            <div class="status-update">
              <h2>📦 Sipariş Durumu Güncellendi</h2>
              <p style="margin-top: 15px; font-size: 18px;">
                <strong>${statusTexts[newStatus] || newStatus}</strong>
              </p>
            </div>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; margin: 20px 0; border-left: 4px solid ${statusColors[newStatus]};">
              <p style="font-size: 16px; color: #2d3748; margin: 0; line-height: 1.6;">
                ${statusDescriptions[newStatus] || ''}
              </p>
            </div>
            
            <div class="order-info">
              <div class="order-number">Sipariş No: ${order.orderNumber || order.id?.slice(0, 8).toUpperCase()}</div>
              <p><strong>Sipariş Tarihi:</strong> ${new Date(order.createdAt).toLocaleDateString('tr-TR')}</p>
              <p><strong>Toplam Tutar:</strong> ${parseFloat(order.totalAmount).toLocaleString('tr-TR')} ₺</p>
              <p><strong>Eski Durum:</strong> ${statusTexts[oldStatus] || oldStatus}</p>
              <p><strong>Yeni Durum:</strong> ${statusTexts[newStatus] || newStatus}</p>
              ${order.trackingCode ? `<p><strong>🚛 Kargo Takip Kodu:</strong> <span style="background: #e2e8f0; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${order.trackingCode}</span></p>` : ''}
            </div>
            
            <p>Siparişinizin detaylarını görmek için hesabınıza giriş yapabilirsiniz.</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2025 Ender Arçelik. Tüm hakları saklıdır.</p>
            <p>Bu e-posta otomatik olarak gönderilmiştir.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: email,
      subject: `Sipariş Durumu Güncellendi - ${statusTexts[newStatus]} - Ender Arçelik`,
      html
    });
  }

  async sendReturnApprovedEmail(
    email: string,
    returnRequest: any,
    product: any
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>İade Talebi Onaylandı - Ender Arçelik</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
          }
          .header {
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            padding: 60px 40px;
            text-align: center;
            color: white;
          }
          .logo-text {
            font-size: 36px;
            font-weight: 900;
            margin-bottom: 10px;
          }
          .content {
            padding: 40px;
          }
          .success-message {
            background: #f0fff4;
            border-left: 4px solid #48bb78;
            padding: 20px;
            margin: 20px 0;
          }
          .return-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 12px;
            margin: 20px 0;
          }
          .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            font-size: 14px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="logo-text">Ender Arçelik</div>
            <p>İade talebiniz onaylandı!</p>
          </div>
          
          <div class="content">
            <div class="success-message">
              <h2>✅ İade Talebi Onaylandı</h2>
              <p style="margin-top: 10px;">İade talebiniz incelendi ve onaylandı. Kargo süreci yakında başlayacaktır.</p>
            </div>
            
            <div class="return-info">
              <h3>İade Detayları</h3>
              <p><strong>Ürün:</strong> ${product?.name || 'Ürün adı'}</p>
              <p><strong>İade Sebebi:</strong> ${returnRequest.reason}</p>
              <p><strong>İade Tarihi:</strong> ${new Date(returnRequest.createdAt).toLocaleDateString('tr-TR')}</p>
              <p><strong>Durum:</strong> Onaylandı</p>
            </div>
            
            <p>Kargo şirketi size ulaşacak ve ürününüzü teslim alacaktır. İade işlemi tamamlandığında size bilgi verilecektir.</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2025 Ender Arçelik. Tüm hakları saklıdır.</p>
            <p>Bu e-posta otomatik olarak gönderilmiştir.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: email,
      subject: 'İade Talebi Onaylandı - Ender Arçelik',
      html
    });
  }

  async sendReturnRejectedEmail(
    email: string,
    returnRequest: any,
    product: any,
    rejectionReason: string
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>İade Talebi Reddedildi - Ender Arçelik</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
          }
          .header {
            background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
            padding: 60px 40px;
            text-align: center;
            color: white;
          }
          .logo-text {
            font-size: 36px;
            font-weight: 900;
            margin-bottom: 10px;
          }
          .content {
            padding: 40px;
          }
          .rejection-message {
            background: #fed7d7;
            border-left: 4px solid #e53e3e;
            padding: 20px;
            margin: 20px 0;
          }
          .return-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 12px;
            margin: 20px 0;
          }
          .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            font-size: 14px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="logo-text">Ender Arçelik</div>
            <p>İade talebiniz hakkında</p>
          </div>
          
          <div class="content">
            <div class="rejection-message">
              <h2>❌ İade Talebi Reddedildi</h2>
              <p style="margin-top: 10px;">Maalesef iade talebiniz aşağıdaki nedenle reddedilmiştir:</p>
              <p style="margin-top: 10px; font-weight: bold;">${rejectionReason}</p>
            </div>
            
            <div class="return-info">
              <h3>İade Detayları</h3>
              <p><strong>Ürün:</strong> ${product?.name || 'Ürün adı'}</p>
              <p><strong>İade Sebebi:</strong> ${returnRequest.reason}</p>
              <p><strong>İade Tarihi:</strong> ${new Date(returnRequest.createdAt).toLocaleDateString('tr-TR')}</p>
              <p><strong>Durum:</strong> Reddedildi</p>
            </div>
            
            <p>Sorularınız için müşteri hizmetlerimiz ile iletişime geçebilirsiniz.</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2025 Ender Arçelik. Tüm hakları saklıdır.</p>
            <p>Bu e-posta otomatik olarak gönderilmiştir.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: email,
      subject: 'İade Talebi Reddedildi - Ender Arçelik',
      html
    });
  }

  async sendCampaignEmail(
    email: string,
    campaign: any
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Yeni Kampanya - ${campaign.title} - Ender Arçelik</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
          }
          .header {
            background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
            padding: 60px 40px;
            text-align: center;
            color: white;
          }
          .logo-text {
            font-size: 36px;
            font-weight: 900;
            margin-bottom: 10px;
          }
          .content {
            padding: 40px;
          }
          .campaign-banner {
            background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
            color: white;
            padding: 30px;
            border-radius: 16px;
            text-align: center;
            margin: 20px 0;
          }
          .campaign-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 12px;
            margin: 20px 0;
          }
          .discount-badge {
            background: #e53e3e;
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            font-weight: bold;
            display: inline-block;
            margin: 10px 0;
          }
          .cta-button {
            background: #e53e3e;
            color: white;
            padding: 15px 30px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
            display: inline-block;
            margin: 20px 0;
          }
          .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            font-size: 14px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="logo-text">Ender Arçelik</div>
            <p>🎉 Yeni Kampanya Başladı!</p>
          </div>
          
          <div class="content">
            <div class="campaign-banner">
              <h2>${campaign.title}</h2>
              ${campaign.discountPercentage ? `<div class="discount-badge">%${campaign.discountPercentage} İndirim</div>` : ''}
            </div>
            
            <div class="campaign-info">
              <h3>Kampanya Detayları</h3>
              <p><strong>Açıklama:</strong> ${campaign.description || 'Kampanya açıklaması'}</p>
              <p><strong>Başlangıç:</strong> ${new Date(campaign.startDate).toLocaleDateString('tr-TR')}</p>
              <p><strong>Bitiş:</strong> ${new Date(campaign.endDate).toLocaleDateString('tr-TR')}</p>
              ${campaign.minimumAmount ? `<p><strong>Minimum Sipariş:</strong> ${parseFloat(campaign.minimumAmount).toLocaleString('tr-TR')} ₺</p>` : ''}
              ${campaign.code ? `<p><strong>Kampanya Kodu:</strong> <code style="background: #f1f1f1; padding: 4px 8px; border-radius: 4px;">${campaign.code}</code></p>` : ''}
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.REPLIT_DOMAINS?.split(',')[0] || 'https://your-domain.replit.dev'}" class="cta-button">
                Alışverişe Başla
              </a>
            </div>
            
            <p style="margin-top: 20px;">Bu fırsatı kaçırmayın! Kampanya süreli olarak geçerlidir.</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2025 Ender Arçelik. Tüm hakları saklıdır.</p>
            <p>Bu e-posta kampanya bildirimi içindir.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: email,
      subject: `🎉 Yeni Kampanya: ${campaign.title} - Ender Arçelik`,
      html
    });
  }

  async sendEmailVerificationEmail(
    email: string,
    verificationToken: string
  ): Promise<boolean> {
    const baseUrl = process.env.REPLIT_DOMAINS?.split(',')[0] || 'https://your-domain.replit.dev';
    const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;

    const html = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>E-posta Doğrulama - Ender Arçelik</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
          }
          .header {
            background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
            padding: 60px 40px;
            text-align: center;
            color: white;
          }
          .logo-text {
            font-size: 36px;
            font-weight: 900;
            margin-bottom: 10px;
          }
          .content {
            padding: 40px;
          }
          .verification-box {
            background: #ebf4ff;
            border-left: 4px solid #4299e1;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
          }
          .cta-button {
            background: #4299e1;
            color: white;
            padding: 15px 30px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
            display: inline-block;
            margin: 20px 0;
          }
          .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            font-size: 14px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="logo-text">Ender Arçelik</div>
            <p>📧 E-posta Doğrulama</p>
          </div>
          
          <div class="content">
            <div class="verification-box">
              <h2>✉️ E-posta Adresinizi Doğrulayın</h2>
              <p style="margin-top: 15px;">Hesabınızı güvenli hale getirmek için e-posta adresinizi doğrulamanız gerekiyor.</p>
            </div>
            
            <p>Aşağıdaki butona tıklayarak e-posta adresinizi doğrulayabilirsiniz:</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="cta-button">
                E-posta Adresimi Doğrula
              </a>
            </div>
            
            <p style="margin-top: 20px; color: #666; font-size: 14px;">
              Bu link 24 saat içinde geçerliliğini yitirecektir. Eğer bu e-postayı siz almadıysanız lütfen dikkate almayın.
            </p>
          </div>
          
          <div class="footer">
            <p>&copy; 2025 Ender Arçelik. Tüm hakları saklıdır.</p>
            <p>Bu e-posta güvenlik amaçlıdır.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: email,
      subject: 'E-posta Doğrulama - Ender Arçelik',
      html
    });
  }

}

export const emailService = new EmailService();