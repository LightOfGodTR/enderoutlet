import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  decimal,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  profileImageUrl: text("profile_image_url"),
  role: text("role").default("user"), // user, admin
  tcKimlik: text("tc_kimlik").unique(), // Turkish ID number
  // Verification fields
  emailVerified: boolean("email_verified").default(false),
  emailVerificationToken: text("email_verification_token"),
  emailVerificationExpires: timestamp("email_verification_expires"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const addresses = pgTable("addresses", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  title: text("title").notNull(), // Ev, İş, Diğer etc.
  addressType: text("address_type").notNull().default("bireysel"), // bireysel, kurumsal
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  district: text("district").notNull(),
  city: text("city").notNull(),
  postalCode: text("postal_code"),
  // Kurumsal adres alanları
  companyName: text("company_name"), // Şirket ünvanı (kurumsal için)
  taxNumber: text("tax_number"), // Vergi numarası (kurumsal için)
  taxOffice: text("tax_office"), // Vergi dairesi (kurumsal için)
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const products = pgTable("products", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  brand: text("brand").default("Arçelik"),
  materialCode: text("material_code"), // Arçelik malzeme kodu
  image: text("image").notNull(),
  images: text("images").array().default([]),
  features: text("features").array().default([]),
  inStock: boolean("in_stock").default(true),
  energyClass: text("energy_class"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cartItems = pgTable("cart_items", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text("user_id"),
  productId: text("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  warranty: text("warranty"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const favorites = pgTable("favorites", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text("user_id"),
  productId: text("product_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  productId: text("product_id").notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const generalSettings = pgTable("general_settings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  siteTitle: text("site_title").notNull().default("Arçelik"),
  siteDescription: text("site_description")
    .notNull()
    .default("Türkiye'nin önde gelen beyaz eşya markası"),
  companyAddress: text("company_address")
    .notNull()
    .default(
      "Ginza Residence, Pınartepe, Yavuz Sultan Selim Blv. No:30F/13-14,34500 Büyükçekmece/İstanbu",
    ),
  contactPhone: text("contact_phone").notNull().default("(0212) 880 40 95"),
  contactEmail: text("contact_email")
    .notNull()
    .default("info@enderarcelik.com"),
  instagramUrl: text("instagram_url").default(""),
  whatsappUrl: text("whatsapp_url").default(""),
  // Bank transfer settings
  bankTransferEnabled: boolean("bank_transfer_enabled").default(true),
  bankName: text("bank_name").default("Türkiye İş Bankası"),
  accountHolder: text("account_holder").default("Arçelik San. ve Tic. A.Ş."),
  iban: text("iban").default("TR12 0006 4000 0011 1234 5678 90"),
  accountNumber: text("account_number").default("1234567890"),
  bankTransferInstructions: text("bank_transfer_instructions").default("Havale/EFT yaparken mutlaka açıklama kısmına sipariş numaranızı yazınız. Ödeme onaylandıktan sonra siparişiniz hazırlanmaya başlanacaktır."),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bankAccounts = pgTable("bank_accounts", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  bankName: text("bank_name").notNull(),
  accountHolder: text("account_holder").notNull(), 
  iban: text("iban").notNull(),
  branchCode: text("branch_code"),
  branchName: text("branch_name"),
  accountNumber: text("account_number"),
  swiftCode: text("swift_code"),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const navigationItems = pgTable("navigation_items", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  label: text("label").notNull(),
  path: text("path").notNull(),
  isActive: boolean("is_active").default(true),
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const corporateContent = pgTable("corporate_content", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  pageTitle: text("page_title").notNull().default("Arçelik Hakkında"),
  pageSubtitle: text("page_subtitle")
    .notNull()
    .default(
      "1955'ten bu yana Türkiye'nin önde gelen beyaz eşya markası olarak, milyonlarca aileye kaliteli ürünler sunuyoruz.",
    ),
  stat1Value: text("stat1_value").notNull().default("70+"),
  stat1Label: text("stat1_label").notNull().default("Yıllık Deneyim"),
  stat2Value: text("stat2_value").notNull().default("30M+"),
  stat2Label: text("stat2_label").notNull().default("Memnun Müşteri"),
  stat3Value: text("stat3_value").notNull().default("50+"),
  stat3Label: text("stat3_label").notNull().default("Ülkede Hizmet"),
  stat4Value: text("stat4_value").notNull().default("100+"),
  stat4Label: text("stat4_label").notNull().default("Ürün Çeşidi"),
  aboutTitle: text("about_title").notNull().default("Hikayemiz"),
  aboutParagraph1: text("about_paragraph1")
    .notNull()
    .default(
      "1955 yılında kurulan Arçelik, Türkiye'nin en köklü beyaz eşya markalarından biridir. 70 yılı aşkın süredir, yenilikçi teknolojiler ve kaliteli ürünlerle milyonlarca ailenin hayatını kolaylaştırmaktayız.",
    ),
  aboutParagraph2: text("about_paragraph2")
    .notNull()
    .default(
      "Sürdürülebilir teknolojiler geliştirerek, çevre dostu üretim anlayışımızla geleceğe değer katıyoruz. Ar-Ge yatırımlarımız ve inovatif yaklaşımımızla sektörde öncü konumumuzu korumaktayız.",
    ),
  missionTitle: text("mission_title").notNull().default("Misyonumuz"),
  missionText: text("mission_text")
    .notNull()
    .default(
      "Türkiye ve dünyada yaşam kalitesini artıran, çevre dostu, teknolojik ve estetik açıdan üstün ürünler geliştirerek, tüketicilerin hayatını kolaylaştırmak ve onlara değer katmaktır.",
    ),
  visionTitle: text("vision_title").notNull().default("Vizyonumuz"),
  visionText: text("vision_text")
    .notNull()
    .default(
      "Dünya standartlarında ürünler üreterek, global bir marka olmak ve sürdürülebilir teknolojilerle geleceğe yön veren bir şirket olarak sektörde liderliğimizi sürdürmektir.",
    ),
  contactTitle: text("contact_title").notNull().default("İletişim"),
  contactSubtitle: text("contact_subtitle")
    .notNull()
    .default("Bizimle iletişime geçin, sorularınızı yanıtlayalım"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const campaigns = pgTable("campaigns", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  discount: text("discount").notNull(),
  endDate: text("end_date").notNull(),
  image: text("image").notNull(),
  category: text("category").notNull(),
  redirectUrl: text("redirect_url").default(""),
  isFeatured: boolean("is_featured").default(false),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const categoryIcons = pgTable("category_icons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  icon: text("icon").notNull(),
  linkUrl: text("link_url"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const categoryBanners = pgTable("category_banners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryName: varchar("category_name").notNull(), // Kategori adı (Beyaz Eşya, Klima vs.)
  title: text("title").notNull(), // Banner başlığı
  description: text("description"), // Banner alt açıklaması (opsiyonel)
  imageUrl: text("image_url").notNull(), // Hero banner resmi
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const campaignSettings = pgTable("campaign_settings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  heroBadge: text("hero_badge").notNull().default("Özel Kampanyalar"),
  heroTitle: text("hero_title")
    .notNull()
    .default("Büyük Fırsatlar Sizi Bekliyor!"),
  heroSubtitle: text("hero_subtitle")
    .notNull()
    .default(
      "Arçelik'in özel kampanyalarıyla hayalinizdeki ürünleri uygun fiyatlarla alın",
    ),
  featuredTitle: text("featured_title")
    .notNull()
    .default("Öne Çıkan Kampanyalar"),
  featuredSubtitle: text("featured_subtitle")
    .notNull()
    .default("En popüler ve avantajlı kampanyalarımız"),
  allCampaignsTitle: text("all_campaigns_title")
    .notNull()
    .default("Tüm Kampanyalar"),
  allCampaignsSubtitle: text("all_campaigns_subtitle")
    .notNull()
    .default("Size uygun kampanyayı bulun ve tasarruf edin"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  username: true,
  role: true, // Role is set by system, not by user input
  createdAt: true,
  updatedAt: true,
});

export const registerUserSchema = insertUserSchema
  .extend({
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const loginUserSchema = z.object({
  emailOrPhone: z.string().min(1, "Email or phone number is required"),
  password: z.string().min(1, "Password is required"),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;

export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;

export const insertGeneralSettingsSchema = createInsertSchema(
  generalSettings,
).omit({
  id: true,
  updatedAt: true,
});

export type InsertGeneralSettings = z.infer<typeof insertGeneralSettingsSchema>;
export type GeneralSettings = typeof generalSettings.$inferSelect;

export const insertBankAccountSchema = createInsertSchema(bankAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBankAccount = z.infer<typeof insertBankAccountSchema>;
export type BankAccount = typeof bankAccounts.$inferSelect;

export const insertCorporateContentSchema = createInsertSchema(
  corporateContent,
).omit({
  id: true,
  updatedAt: true,
});

export type InsertCorporateContent = z.infer<
  typeof insertCorporateContentSchema
>;
export type CorporateContent = typeof corporateContent.$inferSelect;

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;

export const insertCampaignSettingsSchema = createInsertSchema(
  campaignSettings,
).omit({
  id: true,
  updatedAt: true,
});

export type InsertCampaignSettings = z.infer<
  typeof insertCampaignSettingsSchema
>;
export type CampaignSettings = typeof campaignSettings.$inferSelect;

// Product Cards table for homepage showcase
export const productCards = pgTable("product_cards", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  price: text("price").notNull(),
  image: text("image").notNull(),
  backgroundColor: varchar("background_color").default("#6366f1"),
  buttonText: text("button_text").default("İncele"),
  buttonUrl: text("button_url").default("/products"),
  imageScale: decimal("image_scale", { precision: 4, scale: 2 }).default("1.0"), // Görsel boyutu 0.5-3.0 arası
  imagePositionX: decimal("image_position_x", { precision: 5, scale: 2 }).default("50"), // X pozisyon % olarak
  imagePositionY: decimal("image_position_y", { precision: 5, scale: 2 }).default("50"), // Y pozisyon % olarak
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProductCardSchema = createInsertSchema(productCards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertProductCard = z.infer<typeof insertProductCardSchema>;
export type ProductCard = typeof productCards.$inferSelect;

export const insertReviewSchema = createInsertSchema(reviews)
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    rating: z.number().min(1).max(5),
    comment: z.string().optional().default(""),
  });

export const insertAddressSchema = createInsertSchema(addresses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export type InsertAddress = z.infer<typeof insertAddressSchema>;
export type Address = typeof addresses.$inferSelect;

// Homepage sections for dynamic content management
export const homepageSections = pgTable("homepage_sections", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  sectionKey: text("section_key").notNull().unique(), // featured_products, popular_products
  title: text("title").notNull(),
  subtitle: text("subtitle").default(""),
  isActive: boolean("is_active").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const homepageProducts = pgTable("homepage_products", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  sectionId: text("section_id").notNull(),
  productId: text("product_id").notNull(),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertHomepageSectionSchema = createInsertSchema(
  homepageSections,
).omit({
  id: true,
  updatedAt: true,
});

export const insertHomepageProductSchema = createInsertSchema(
  homepageProducts,
).omit({
  id: true,
  createdAt: true,
});

export type InsertHomepageSection = z.infer<typeof insertHomepageSectionSchema>;
export type HomepageSection = typeof homepageSections.$inferSelect;

export type InsertHomepageProduct = z.infer<typeof insertHomepageProductSchema>;
export type HomepageProduct = typeof homepageProducts.$inferSelect;

// Sliders for homepage carousel
export const sliders = pgTable("sliders", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  subtitle: text("subtitle").default(""),
  description: text("description").default(""),
  image: text("image").notNull(),
  link: text("link").default(""),
  buttonText: text("button_text").default("İncele"),
  showText: boolean("show_text").default(true), // Yazıyı göster/gizle
  backgroundColor: varchar("background_color").default(""), // Arka plan rengi
  isActive: boolean("is_active").default(true),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Orders table
export const orders = pgTable("orders", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  orderNumber: text("order_number").notNull().unique(),
  status: text("status").notNull().default("preparing"), // preparing, ready_to_ship, shipped, in_transit, delivered, cancelled
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  originalAmount: decimal("original_amount", { precision: 10, scale: 2 }),
  discountAmount: decimal("discount_amount", {
    precision: 10,
    scale: 2,
  }).default("0"),
  couponCode: text("coupon_code"),
  shippingAddress: text("shipping_address").notNull(),
  paymentMethod: text("payment_method").notNull().default("virtual-pos"), // virtual-pos, credit-card, bank-transfer
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, completed, failed, cancelled
  virtualPosConfigId: text("virtual_pos_config_id"), // Which bank/POS was used
  paymentTransactionId: text("payment_transaction_id"), // Link to payment transaction
  installments: integer("installments").default(1),
  trackingCode: text("tracking_code"), // Kargo takip kodu
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order items table
export const orderItems = pgTable("order_items", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  orderId: text("order_id").notNull(),
  productId: text("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  warranty: text("warranty"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Coupons table
export const coupons = pgTable("coupons", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").default(""),
  type: text("type").notNull().default("percentage"), // percentage, fixed_amount
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  minOrderAmount: decimal("min_order_amount", {
    precision: 10,
    scale: 2,
  }).default("0"),
  maxDiscount: decimal("max_discount", { precision: 10, scale: 2 }),
  usageLimit: integer("usage_limit").default(0), // 0 = unlimited
  usedCount: integer("used_count").default(0),
  isActive: boolean("is_active").default(true),
  validFrom: timestamp("valid_from").defaultNow(),
  validUntil: timestamp("valid_until"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSliderSchema = createInsertSchema(sliders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSlider = z.infer<typeof insertSliderSchema>;
export type Slider = typeof sliders.$inferSelect;

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  orderNumber: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

export const insertCouponSchema = createInsertSchema(coupons).omit({
  id: true,
  usedCount: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type Coupon = typeof coupons.$inferSelect;

// User coupons table - kuponların kullanıcılara atanması için
export const userCoupons = pgTable("user_coupons", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  couponId: text("coupon_id").notNull(),
  isUsed: boolean("is_used").default(false),
  usedAt: timestamp("used_at"),
  assignedAt: timestamp("assigned_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserCouponSchema = createInsertSchema(userCoupons).omit({
  id: true,
  assignedAt: true,
  createdAt: true,
});

export type InsertUserCoupon = z.infer<typeof insertUserCouponSchema>;
export type UserCoupon = typeof userCoupons.$inferSelect;

// Virtual POS (Sanal POS) configurations for partner banks
export const virtualPosConfigs = pgTable("virtual_pos_configs", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  bankName: text("bank_name").notNull(), // "Garanti", "İş Bankası", "Akbank" etc.
  posType: text("pos_type").notNull().default("3d"), // "3d", "3d_pay", "non_3d"
  isActive: boolean("is_active").default(true),
  merchantId: text("merchant_id").notNull(),
  terminalId: text("terminal_id").notNull(),
  apiUser: text("api_user"), // API Kullanıcısı - Garanti için PROVAUT
  apiPassword: text("api_password"), // API Şifresi - Garanti için 123456Aa*
  apiUrl: text("api_url").notNull(),
  successUrl: text("success_url").notNull(),
  failUrl: text("fail_url").notNull(),
  // Configuration fields that might be encrypted
  secretKey: text("secret_key").notNull(),
  storeKey: text("store_key"), // 3D Secure İşyeri Anahtarı
  hashAlgorithm: text("hash_algorithm").default("SHA1"), // Garanti için SHA1
  currency: text("currency").default("TRY"),
  language: text("language").default("tr"),
  // Display order and settings
  displayOrder: integer("display_order").default(0),
  minAmount: decimal("min_amount", { precision: 10, scale: 2 }).default("0"),
  maxAmount: decimal("max_amount", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment transactions for tracking virtual POS payments
export const paymentTransactions = pgTable("payment_transactions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  orderId: text("order_id").notNull(),
  userId: text("user_id").notNull(),
  virtualPosConfigId: text("virtual_pos_config_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("TRY"),
  // Transaction identifiers
  transactionId: text("transaction_id"), // Bank transaction ID
  referenceNumber: text("reference_number"), // Our internal reference
  hostReferenceNumber: text("host_reference_number"), // Bank's reference
  // Transaction status
  status: text("status").notNull().default("pending"), // pending, success, failed, cancelled
  errorCode: text("error_code"),
  errorMessage: text("error_message"),
  // 3D Secure fields
  threeDSecure: boolean("three_d_secure").default(true),
  mdStatus: text("md_status"), // 3D Secure MD status
  eciCode: text("eci_code"), // Electronic Commerce Indicator
  cavv: text("cavv"), // Cardholder Authentication Verification Value
  xid: text("xid"), // 3D Secure transaction ID
  // Payment details (masked for security)
  maskedCardNumber: text("masked_card_number"),
  cardHolderName: text("card_holder_name"),
  cardType: text("card_type"), // visa, mastercard, amex
  installments: integer("installments").default(1),
  // Request/Response logs for debugging (should be encrypted in production)
  requestData: text("request_data"),
  responseData: text("response_data"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bank installment options
export const bankInstallments = pgTable("bank_installments", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  virtualPosConfigId: text("virtual_pos_config_id").notNull(),
  cardType: text("card_type").notNull(), // visa, mastercard, amex, all
  installmentCount: integer("installment_count").notNull(),
  commissionRate: decimal("commission_rate", {
    precision: 5,
    scale: 2,
  }).default("0"), // Commission rate %
  isActive: boolean("is_active").default(true),
  minAmount: decimal("min_amount", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVirtualPosConfigSchema = createInsertSchema(
  virtualPosConfigs,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentTransactionSchema = createInsertSchema(
  paymentTransactions,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBankInstallmentSchema = createInsertSchema(
  bankInstallments,
).omit({
  id: true,
  createdAt: true,
});

export type InsertVirtualPosConfig = z.infer<
  typeof insertVirtualPosConfigSchema
>;
export type VirtualPosConfig = typeof virtualPosConfigs.$inferSelect;

export type InsertPaymentTransaction = z.infer<
  typeof insertPaymentTransactionSchema
>;
export type PaymentTransaction = typeof paymentTransactions.$inferSelect;

export type InsertBankInstallment = z.infer<typeof insertBankInstallmentSchema>;
export type BankInstallment = typeof bankInstallments.$inferSelect;

export const insertCategoryIconSchema = createInsertSchema(categoryIcons).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCategoryIcon = z.infer<typeof insertCategoryIconSchema>;
export type CategoryIcon = typeof categoryIcons.$inferSelect;

// Contact messages table - kurumsal iletişim mesajları için
export const contactMessages = pgTable("contact_messages", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  subject: text("subject").default("Genel Bilgi"),
  isRead: boolean("is_read").default(false),
  adminResponse: text("admin_response"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  isRead: true,
  adminResponse: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;

// Extended Warranty Categories and Pricing
export const extendedWarrantyCategories = pgTable("extended_warranty_categories", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  categoryName: text("category_name").notNull().unique(), // "No-frost buzdolabı", "Çamaşır makinesi", etc.
  twoYearPrice: decimal("two_year_price", { precision: 10, scale: 2 }).notNull(),
  fourYearPrice: decimal("four_year_price", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertExtendedWarrantyCategorySchema = createInsertSchema(extendedWarrantyCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertExtendedWarrantyCategory = z.infer<typeof insertExtendedWarrantyCategorySchema>;
export type ExtendedWarrantyCategory = typeof extendedWarrantyCategories.$inferSelect;

// Extended Warranty Category Mappings - defines which product categories are covered by each warranty
export const extendedWarrantyCategoryMappings = pgTable("extended_warranty_category_mappings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  warrantyCategoryId: varchar("warranty_category_id").notNull(),
  productCategory: text("product_category").notNull(),
  productSubcategory: text("product_subcategory"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertExtendedWarrantyCategoryMappingSchema = createInsertSchema(extendedWarrantyCategoryMappings).omit({
  id: true,
  createdAt: true,
});

export type InsertExtendedWarrantyCategoryMapping = z.infer<typeof insertExtendedWarrantyCategoryMappingSchema>;
export type ExtendedWarrantyCategoryMapping = typeof extendedWarrantyCategoryMappings.$inferSelect;

// Support tickets for customer support system
export const supportTickets = pgTable("support_tickets", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  subject: text("subject").notNull(),
  description: text("description").notNull(), // Initial description of the problem
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  status: text("status").notNull().default("open"), // open, in_progress, resolved, closed
  category: text("category").notNull(), // technical, sales, warranty, other
  assignedToAdminId: text("assigned_to_admin_id"), // Which admin is handling this
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Support ticket messages for conversation thread
export const supportTicketMessages = pgTable("support_ticket_messages", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  ticketId: text("ticket_id").notNull(),
  senderId: text("sender_id").notNull(), // Can be user or admin
  senderType: text("sender_type").notNull(), // "user" or "admin"
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupportTicketMessageSchema = createInsertSchema(supportTicketMessages).omit({
  id: true,
  createdAt: true,
});

export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;

export type InsertSupportTicketMessage = z.infer<typeof insertSupportTicketMessageSchema>;
export type SupportTicketMessage = typeof supportTicketMessages.$inferSelect;

// SEO Ayarları Tablosu
export const seoSettings = pgTable("seo_settings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  pageType: text("page_type").notNull(), // "home", "products", "category", "product-detail", "blog"
  pageId: text("page_id"), // Category ID, Product ID, Blog ID vs. - null for global pages
  title: text("title").notNull(),
  description: text("description").notNull(),
  keywords: text("keywords"),
  ogTitle: text("og_title"),
  ogDescription: text("og_description"),
  ogImage: text("og_image"),
  canonicalUrl: text("canonical_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Blog Kategorileri Tablosu
export const blogCategories = pgTable("blog_categories", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  image: text("image"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Blog Yazıları Tablosu
export const blogPosts = pgTable("blog_posts", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"), // Kısa özet
  content: text("content").notNull(), // HTML içerik
  featuredImage: text("featured_image"),
  categoryId: text("category_id"),
  authorId: text("author_id"), // User ID
  status: text("status").default("draft"), // "draft", "published", "archived"
  publishedAt: timestamp("published_at"),
  viewCount: integer("view_count").default(0),
  isActive: boolean("is_active").default(true),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Blog Etiketleri Tablosu
export const blogTags = pgTable("blog_tags", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Blog Post - Tag İlişki Tablosu
export const blogPostTags = pgTable("blog_post_tags", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  postId: text("post_id").notNull(),
  tagId: text("tag_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// SEO Settings Schema
export const insertSeoSettingsSchema = createInsertSchema(seoSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSeoSettings = z.infer<typeof insertSeoSettingsSchema>;
export type SeoSettings = typeof seoSettings.$inferSelect;

// Blog Categories Schema
export const insertBlogCategorySchema = createInsertSchema(blogCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBlogCategory = z.infer<typeof insertBlogCategorySchema>;
export type BlogCategory = typeof blogCategories.$inferSelect;

// Blog Posts Schema
export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
  viewCount: true,
});

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

// Blog Tags Schema
export const insertBlogTagSchema = createInsertSchema(blogTags).omit({
  id: true,
  createdAt: true,
});

export type InsertBlogTag = z.infer<typeof insertBlogTagSchema>;
export type BlogTag = typeof blogTags.$inferSelect;

// Blog Post Tags Schema
export const insertBlogPostTagSchema = createInsertSchema(blogPostTags).omit({
  id: true,
  createdAt: true,
});

export type InsertBlogPostTag = z.infer<typeof insertBlogPostTagSchema>;
export type BlogPostTag = typeof blogPostTags.$inferSelect;

// Blog Slider Tablosu
export const blogSliders = pgTable("blog_sliders", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  blogPostId: text("blog_post_id"), // Hangi blog yazısı (opsiyonel)
  title: text("title").notNull(), // Slider başlığı
  subtitle: text("subtitle").default(""),
  description: text("description").default(""),
  image: text("image").notNull(), // Slider görseli
  buttonText: text("button_text").default("Devamı"),
  buttonLink: text("button_link").default(""), // Yönlendirme linki
  tagText: text("tag_text").default("Ürün İnceleme"), // Üstteki etiket
  tagColor: text("tag_color").default("red"), // Etiket rengi: red, orange, purple, etc.
  overlayOpacity: integer("overlay_opacity").default(40), // Alt karartı yoğunluğu (0-100)
  isActive: boolean("is_active").default(true),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBlogSliderSchema = createInsertSchema(blogSliders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBlogSlider = z.infer<typeof insertBlogSliderSchema>;
export type BlogSlider = typeof blogSliders.$inferSelect;

// Footer Links Tablosu
export const footerLinks = pgTable("footer_links", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  sectionTitle: text("section_title").notNull(), // Ürünler, Destek, İletişim, Yasal Belgeler
  linkText: text("link_text").notNull(), // Link görünen ismi
  linkUrl: text("link_url").notNull(), // Link hedef URL'i
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0), // Sıralama
  sectionOrder: integer("section_order").default(0), // Bölüm sıralaması
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFooterLinkSchema = createInsertSchema(footerLinks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertFooterLink = z.infer<typeof insertFooterLinkSchema>;
export type FooterLink = typeof footerLinks.$inferSelect;

// Returns table for product returns and exchanges
export const returns = pgTable("returns", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  orderId: text("order_id").notNull(),
  userId: text("user_id").notNull(),
  orderItemId: text("order_item_id").notNull(), // Which specific item is being returned
  returnType: text("return_type").notNull().default("return"), // "return" or "exchange"
  returnReason: text("return_reason").notNull(),
  status: text("status").notNull().default("pending"), // "pending", "approved", "rejected"
  adminNotes: text("admin_notes"), // Admin's notes/comments
  requestDate: timestamp("request_date").defaultNow(),
  responseDate: timestamp("response_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertReturnSchema = createInsertSchema(returns).omit({
  id: true,
  requestDate: true,
  responseDate: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertReturn = z.infer<typeof insertReturnSchema>;
export type Return = typeof returns.$inferSelect;

// Product Views Statistics - Ürün görüntülenme istatistikleri
export const productViews = pgTable("product_views", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  productId: text("product_id").notNull(),
  userId: text("user_id"), // Opsiyonel - anonim kullanıcılar için null olabilir
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  referrer: text("referrer"), // Hangi sayfadan geldiği
  viewedAt: timestamp("viewed_at").defaultNow(),
});

export const insertProductViewSchema = createInsertSchema(productViews).omit({
  id: true,
  viewedAt: true,
});

export type InsertProductView = z.infer<typeof insertProductViewSchema>;
export type ProductView = typeof productViews.$inferSelect;

// Slider Clicks Statistics - Slider tıklama istatistikleri  
export const sliderClicks = pgTable("slider_clicks", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  sliderId: text("slider_id").notNull(),
  sliderType: text("slider_type").notNull().default("main"), // main, blog, product vs.
  userId: text("user_id"), // Opsiyonel - anonim kullanıcılar için null olabilir
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  clickedAt: timestamp("clicked_at").defaultNow(),
});

export const insertSliderClickSchema = createInsertSchema(sliderClicks).omit({
  id: true,
  clickedAt: true,
});

export type InsertSliderClick = z.infer<typeof insertSliderClickSchema>;
export type SliderClick = typeof sliderClicks.$inferSelect;

// Popular Searches - Popüler Aramalar
export const popularSearches = pgTable("popular_searches", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  keyword: text("keyword").notNull(),
  redirectUrl: text("redirect_url"), // Tıklandığında yönlendirilecek URL (opsiyonel)
  displayOrder: integer("display_order").default(0), // Sıralama
  isActive: boolean("is_active").default(true), // Aktif/pasif
  clickCount: integer("click_count").default(0), // Kaç kez tıklandığı
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPopularSearchSchema = createInsertSchema(popularSearches).omit({
  id: true,
  clickCount: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPopularSearch = z.infer<typeof insertPopularSearchSchema>;
export type PopularSearch = typeof popularSearches.$inferSelect;

// Category Banners - Kategori Banner'ları
export const insertCategoryBannerSchema = createInsertSchema(categoryBanners).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCategoryBanner = z.infer<typeof insertCategoryBannerSchema>;
export type CategoryBanner = typeof categoryBanners.$inferSelect;
