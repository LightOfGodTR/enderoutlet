import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { type User, type InsertUser, type Product, type InsertProduct, type CartItem, type InsertCartItem, type Favorite, type InsertFavorite, type Review, type InsertReview, type Address, type InsertAddress, type HomepageSection, type InsertHomepageSection, type HomepageProduct, type InsertHomepageProduct, type Slider, type InsertSlider, type Order, type InsertOrder, type OrderItem, type InsertOrderItem, type Coupon, type InsertCoupon, type UserCoupon, type InsertUserCoupon, type GeneralSettings, type InsertGeneralSettings, type CorporateContent, type InsertCorporateContent, type Campaign, type InsertCampaign, type CampaignSettings, type InsertCampaignSettings, type VirtualPosConfig, type InsertVirtualPosConfig, type PaymentTransaction, type InsertPaymentTransaction, type BankInstallment, type InsertBankInstallment, type BankAccount, type InsertBankAccount, type SupportTicket, type InsertSupportTicket, type SupportTicketMessage, type InsertSupportTicketMessage, type ContactMessage, type InsertContactMessage, type CategoryIcon, type InsertCategoryIcon, type ProductCard, type InsertProductCard, type ExtendedWarrantyCategory, type InsertExtendedWarrantyCategory, type ExtendedWarrantyCategoryMapping, type InsertExtendedWarrantyCategoryMapping, type SeoSettings, type InsertSeoSettings, type BlogCategory, type InsertBlogCategory, type BlogPost, type InsertBlogPost, type BlogTag, type InsertBlogTag, type BlogPostTag, type InsertBlogPostTag, type BlogSlider, type InsertBlogSlider, type FooterLink, type InsertFooterLink, type Return, type InsertReturn, type ProductView, type InsertProductView, type SliderClick, type InsertSliderClick, type PopularSearch, type InsertPopularSearch, type CategoryBanner, type InsertCategoryBanner, homepageSections, homepageProducts, sliders, users, products, cartItems, favorites, reviews, addresses, orders, orderItems, coupons, userCoupons, generalSettings, navigationItems, corporateContent, campaigns, campaignSettings, virtualPosConfigs, paymentTransactions, bankInstallments, bankAccounts, passwordResetTokens, supportTickets, supportTicketMessages, contactMessages, categoryIcons, productCards, extendedWarrantyCategories, extendedWarrantyCategoryMappings, seoSettings, blogCategories, blogPosts, blogTags, returns, blogPostTags, blogSliders, footerLinks, productViews, sliderClicks, popularSearches, categoryBanners } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<Pick<User, 'firstName' | 'lastName' | 'email' | 'phone' | 'tcKimlik'>>): Promise<User | undefined>;
  
  // Password reset token methods
  createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<any>;
  getPasswordResetToken(token: string): Promise<any>;
  markPasswordResetTokenAsUsed(token: string): Promise<boolean>;
  resetUserPassword(userId: string, newPassword: string): Promise<User | undefined>;
  
  // Email verification methods
  generateEmailVerificationToken(userId: string): Promise<string>;
  verifyEmailToken(token: string): Promise<User | undefined>;
  resendEmailVerification(userId: string): Promise<string>;
  
  
  // Product methods
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  
  // Cart methods
  getCartItems(userId: string): Promise<CartItem[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: string): Promise<boolean>;
  
  // Favorite methods
  getFavorites(userId: string): Promise<(Favorite & { product: Product })[]>;
  addToFavorites(favorite: InsertFavorite): Promise<Favorite>;
  removeFromFavorites(userId: string, productId: string): Promise<boolean>;
  
  // Review methods
  getReviews(productId: string): Promise<Review[]>;
  getReviewsByUser(userId: string): Promise<Review[]>;
  addReview(review: InsertReview): Promise<Review>;
  getUserReviewForProduct(userId: string, productId: string): Promise<Review | undefined>;
  
  // Address methods
  getAddresses(userId: string): Promise<Address[]>;
  addAddress(address: InsertAddress): Promise<Address>;
  updateAddress(id: string, updates: Partial<Address>): Promise<Address | undefined>;
  deleteAddress(id: string): Promise<boolean>;
  setDefaultAddress(userId: string, addressId: string): Promise<boolean>;

  // Homepage sections methods
  getHomepageSections(): Promise<HomepageSection[]>;
  getHomepageSection(sectionKey: string): Promise<HomepageSection | undefined>;
  updateHomepageSection(sectionKey: string, updates: Partial<HomepageSection>): Promise<HomepageSection | undefined>;
  getHomepageProducts(sectionKey: string): Promise<Product[]>;
  updateHomepageProducts(sectionId: string, productIds: string[]): Promise<boolean>;

  // Slider methods
  getSliders(): Promise<Slider[]>;
  getSlider(id: string): Promise<Slider | undefined>;
  createSlider(slider: InsertSlider): Promise<Slider>;
  updateSlider(id: string, updates: Partial<Slider>): Promise<Slider | undefined>;
  deleteSlider(id: string): Promise<boolean>;
  toggleSlider(id: string, isActive: boolean): Promise<Slider | undefined>;

  // Order methods
  getOrders(userId: string): Promise<(Order & { items: (OrderItem & { product: Product })[] })[]>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  getOrder(orderId: string): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined>;
  updateOrderStatus(orderId: string, status: string): Promise<Order | undefined>;
  updateOrderTrackingCode(orderId: string, trackingCode: string): Promise<Order | undefined>;
  
  // Admin order methods
  getAllOrders(): Promise<(Order & { items: (OrderItem & { product: Product })[]; user: Pick<User, 'id' | 'firstName' | 'lastName'> })[]>;
  adminUpdateOrderStatus(orderId: string, status: string): Promise<Order | undefined>;

  // Category methods
  getCategories(): any[];
  addCategory(categoryData: { name: string; icon: string; subcategories?: string[] }): any;
  updateCategory(id: string, updates: { name?: string; icon?: string; subcategories?: string[] }): any;
  deleteCategory(id: string): boolean;
  
  // Extended warranty methods
  getExtendedWarrantyCategories(): Promise<any[]>;
  getExtendedWarrantyByCategory(categoryName: string): Promise<any | undefined>;
  createExtendedWarrantyCategory(data: { categoryName: string; twoYearPrice: number; fourYearPrice: number }): Promise<any>;
  updateExtendedWarrantyCategory(id: string, updates: any): Promise<any | undefined>;
  
  // Extended warranty category mappings
  getWarrantyCategoryMappings(warrantyCategoryId: string): Promise<ExtendedWarrantyCategoryMapping[]>;
  addWarrantyCategoryMapping(mapping: InsertExtendedWarrantyCategoryMapping): Promise<ExtendedWarrantyCategoryMapping>;
  deleteWarrantyCategoryMapping(mappingId: string): Promise<boolean>;
  getAllProductCategories(): Promise<{ category: string; subcategories: string[] }[]>;
  
  // Coupon methods
  getCoupons(): Promise<Coupon[]>;
  getCoupon(id: string): Promise<Coupon | undefined>;
  getCouponByCode(code: string): Promise<Coupon | undefined>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  updateCoupon(id: string, updates: Partial<Coupon>): Promise<Coupon | undefined>;
  deleteCoupon(id: string): Promise<boolean>;
  
  // General settings methods
  getGeneralSettings(): Promise<GeneralSettings>;
  updateGeneralSettings(updates: Partial<InsertGeneralSettings>): Promise<GeneralSettings>;
  
  // Corporate content methods
  getCorporateContent(): Promise<CorporateContent>;
  updateCorporateContent(updates: Partial<InsertCorporateContent>): Promise<CorporateContent>;
  
  // Campaign methods
  getCampaigns(): Promise<Campaign[]>;
  getCampaign(id: string): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: string): Promise<boolean>;
  
  // Campaign settings methods
  getCampaignSettings(): Promise<CampaignSettings>;
  updateCampaignSettings(updates: Partial<InsertCampaignSettings>): Promise<CampaignSettings>;
  
  validateCoupon(code: string, orderAmount: number): Promise<Coupon | null>;
  
  // User coupon methods
  getUserCoupons(userId: string): Promise<(UserCoupon & { coupon: Coupon })[]>;
  assignCouponToUser(userId: string, couponId: string): Promise<UserCoupon>;
  markCouponAsUsed(userCouponId: string): Promise<boolean>;
  
  // Virtual POS methods
  getVirtualPosConfigs(): Promise<VirtualPosConfig[]>;
  getVirtualPosConfig(id: string): Promise<VirtualPosConfig | undefined>;
  getActiveVirtualPosConfigs(): Promise<VirtualPosConfig[]>;
  createVirtualPosConfig(config: InsertVirtualPosConfig): Promise<VirtualPosConfig>;
  updateVirtualPosConfig(id: string, updates: Partial<VirtualPosConfig>): Promise<VirtualPosConfig | undefined>;
  deleteVirtualPosConfig(id: string): Promise<boolean>;
  
  // Payment transaction methods
  createPaymentTransaction(transaction: InsertPaymentTransaction): Promise<PaymentTransaction>;
  updatePaymentTransaction(id: string, updates: Partial<PaymentTransaction>): Promise<PaymentTransaction | undefined>;
  getPaymentTransaction(id: string): Promise<PaymentTransaction | undefined>;
  getPaymentTransactionByOrder(orderId: string): Promise<PaymentTransaction | undefined>;
  
  // Bank installment methods
  getBankInstallments(virtualPosConfigId: string): Promise<BankInstallment[]>;
  createBankInstallment(installment: InsertBankInstallment): Promise<BankInstallment>;
  updateBankInstallment(id: string, updates: Partial<BankInstallment>): Promise<BankInstallment | undefined>;
  deleteBankInstallment(id: string): Promise<boolean>;

  // Bank account methods
  getBankAccounts(): Promise<BankAccount[]>;
  getBankAccount(id: string): Promise<BankAccount | undefined>;
  createBankAccount(account: InsertBankAccount): Promise<BankAccount>;
  updateBankAccount(id: string, updates: Partial<BankAccount>): Promise<BankAccount | undefined>;
  deleteBankAccount(id: string): Promise<boolean>;

  // Admin content methods
  getCategories(): any[];
  getNavigationItems(): Promise<any[]>;
  updateNavigationItem(id: string, updates: any): Promise<any>;
  
  // Support ticket methods
  getSupportTickets(userId?: string): Promise<(SupportTicket & { user: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'> })[]>;
  getSupportTicket(id: string): Promise<(SupportTicket & { user: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'> }) | undefined>;
  getAllSupportTicketsWithUsers(): Promise<(SupportTicket & { user: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'> })[]>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  updateSupportTicket(id: string, updates: Partial<SupportTicket>): Promise<SupportTicket | undefined>;
  assignTicketToAdmin(ticketId: string, adminId: string): Promise<SupportTicket | undefined>;
  
  // Support ticket message methods
  getTicketMessages(ticketId: string): Promise<(SupportTicketMessage & { sender: Pick<User, 'id' | 'firstName' | 'lastName' | 'role'> })[]>;
  createTicketMessage(message: InsertSupportTicketMessage): Promise<SupportTicketMessage>;

  // Contact message methods
  getContactMessages(): Promise<ContactMessage[]>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  markContactMessageAsRead(id: string): Promise<ContactMessage | undefined>;
  addContactMessageResponse(id: string, response: string): Promise<ContactMessage | undefined>;

  // Category icons methods
  getCategoryIcons(): Promise<CategoryIcon[]>;
  getCategoryIcon(id: string): Promise<CategoryIcon | undefined>;
  createCategoryIcon(icon: InsertCategoryIcon): Promise<CategoryIcon>;
  updateCategoryIcon(id: string, updates: Partial<CategoryIcon>): Promise<CategoryIcon | undefined>;
  deleteCategoryIcon(id: string): Promise<boolean>;
  toggleCategoryIcon(id: string, isActive: boolean): Promise<CategoryIcon | undefined>;

  // Product cards methods
  getAllProductCards(): Promise<ProductCard[]>;
  getProductCard(id: string): Promise<ProductCard | undefined>;
  createProductCard(card: InsertProductCard): Promise<ProductCard>;
  updateProductCard(id: string, updates: Partial<ProductCard>): Promise<ProductCard | undefined>;
  deleteProductCard(id: string): Promise<boolean>;
  
  // SEO Settings methods
  getSeoSettings(pageType?: string, pageId?: string): Promise<SeoSettings[]>;
  getSeoSetting(id: string): Promise<SeoSettings | undefined>;
  createSeoSetting(seoSetting: InsertSeoSettings): Promise<SeoSettings>;
  updateSeoSetting(id: string, updates: Partial<SeoSettings>): Promise<SeoSettings | undefined>;
  deleteSeoSetting(id: string): Promise<boolean>;
  
  // Auto SEO Generation methods
  generateProductSeo(product: Product): Promise<SeoSettings>;
  generateCategorySeo(categoryName: string, subcategory?: string): Promise<SeoSettings>;
  generateBlogPostSeo(blogPost: BlogPost, category?: BlogCategory): Promise<SeoSettings>;
  
  // Blog Category methods
  getBlogCategories(): Promise<BlogCategory[]>;
  getBlogCategory(id: string): Promise<BlogCategory | undefined>;
  getBlogCategoryBySlug(slug: string): Promise<BlogCategory | undefined>;
  createBlogCategory(category: InsertBlogCategory): Promise<BlogCategory>;
  updateBlogCategory(id: string, updates: Partial<BlogCategory>): Promise<BlogCategory | undefined>;
  deleteBlogCategory(id: string): Promise<boolean>;
  
  // Blog Post methods
  getBlogPosts(status?: string, categoryId?: string): Promise<(BlogPost & { category?: BlogCategory })[]>;
  getBlogPost(id: string): Promise<(BlogPost & { category?: BlogCategory }) | undefined>;
  getBlogPostBySlug(slug: string): Promise<(BlogPost & { category?: BlogCategory }) | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: string): Promise<boolean>;
  publishBlogPost(id: string): Promise<BlogPost | undefined>;
  incrementViewCount(id: string): Promise<BlogPost | undefined>;
  
  // Blog Tag methods
  getBlogTags(): Promise<BlogTag[]>;
  getBlogTag(id: string): Promise<BlogTag | undefined>;
  getBlogTagBySlug(slug: string): Promise<BlogTag | undefined>;
  createBlogTag(tag: InsertBlogTag): Promise<BlogTag>;
  updateBlogTag(id: string, updates: Partial<BlogTag>): Promise<BlogTag | undefined>;
  deleteBlogTag(id: string): Promise<boolean>;
  
  // Blog Post Tags methods
  getPostTags(postId: string): Promise<(BlogPostTag & { tag: BlogTag })[]>;
  addTagToPost(postTag: InsertBlogPostTag): Promise<BlogPostTag>;
  removeTagFromPost(postId: string, tagId: string): Promise<boolean>;
  
  // Blog Slider methods
  getBlogSliders(): Promise<BlogSlider[]>;
  getBlogSlider(id: string): Promise<BlogSlider | undefined>;
  createBlogSlider(slider: InsertBlogSlider): Promise<BlogSlider>;
  updateBlogSlider(id: string, updates: Partial<BlogSlider>): Promise<BlogSlider | undefined>;
  deleteBlogSlider(id: string): Promise<boolean>;
  toggleBlogSlider(id: string, isActive: boolean): Promise<BlogSlider | undefined>;
  
  // Footer Links methods
  getFooterLinks(): Promise<FooterLink[]>;
  getFooterLink(id: string): Promise<FooterLink | undefined>;
  createFooterLink(link: InsertFooterLink): Promise<FooterLink>;
  updateFooterLink(id: string, updates: Partial<FooterLink>): Promise<FooterLink | undefined>;
  deleteFooterLink(id: string): Promise<boolean>;
  
  // Returns methods
  getUserReturns(userId: string): Promise<any[]>;
  getReturn(returnId: string): Promise<Return | undefined>;
  createReturn(returnData: InsertReturn): Promise<Return>;
  getAllReturns(): Promise<any[]>;
  updateReturnStatus(id: string, status: string, adminNotes?: string): Promise<Return | undefined>;
  getReturnByOrderItem(orderItemId: string): Promise<Return | undefined>;

  // Statistics methods
  recordProductView(productId: string, userId?: string, ipAddress?: string, userAgent?: string, referrer?: string): Promise<ProductView>;
  recordSliderClick(sliderId: string, sliderType: string, userId?: string, ipAddress?: string, userAgent?: string): Promise<SliderClick>;

  // Popular Searches methods
  getPopularSearches(): Promise<PopularSearch[]>;
  createPopularSearch(search: InsertPopularSearch): Promise<PopularSearch>;
  updatePopularSearch(id: string, updates: Partial<PopularSearch>): Promise<PopularSearch | undefined>;
  deletePopularSearch(id: string): Promise<boolean>;
  incrementPopularSearchClick(id: string): Promise<boolean>;
  
  // Category Banners methods
  getCategoryBanners(): Promise<CategoryBanner[]>;
  getCategoryBannerByName(categoryName: string): Promise<CategoryBanner | undefined>;
  createCategoryBanner(banner: InsertCategoryBanner): Promise<CategoryBanner>;
  updateCategoryBanner(id: string, updates: Partial<CategoryBanner>): Promise<CategoryBanner | undefined>;
  deleteCategoryBanner(id: string): Promise<boolean>;
  
  // Analytics methods for admin dashboard
  getSalesStatistics(period: 'daily' | 'weekly' | 'monthly' | 'yearly', startDate?: Date, endDate?: Date): Promise<any>;
  getUserStatistics(): Promise<{
    totalUsers: number;
    usersWithItemsInCart: number;
    newUsersToday: number;
    newUsersThisWeek: number;
    newUsersThisMonth: number;
  }>;
  getProductViewStatistics(limit?: number): Promise<{
    productId: string;
    productName: string;
    viewCount: number;
  }[]>;
  getSliderClickStatistics(limit?: number): Promise<{
    sliderId: string;
    sliderTitle: string;
    clickCount: number;
  }[]>;
  getOrderStatistics(): Promise<{
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Navigation items as class property for in-memory updates
  // Navigation items are now stored in database

  constructor() {
    this.initializeDefaultData();
    this.initializeNavigationItems();
  }

  private async initializeDefaultData() {
    try {
      // Initialize test user if not exists
      const existingUser = await this.getUserByEmail("emreabd123@gmail.com");
      if (!existingUser) {
        await this.createUser({
          password: "emre123",
          email: "emreabd123@gmail.com",
          phone: "+90 532 123 4567",
          firstName: "Emre",
          lastName: "Admin"
        });
        console.log("Test admin user created successfully");
      }

      // Initialize homepage sections if they don't exist
      const existingSections = await db.select().from(homepageSections);
      if (existingSections.length === 0) {
        await db.insert(homepageSections).values([
          {
            sectionKey: "featured_products",
            title: "Öne Çıkan Ürünler",
            subtitle: "En popüler ve özel ürünlerimizi keşfedin",
            isActive: true,
          },
          {
            sectionKey: "popular_products", 
            title: "Popüler Ürünler",
            subtitle: "Müşterilerimizin en çok tercih ettiği ürünler",
            isActive: true,
          }
        ]);
      }

      // Initialize sliders if they don't exist
      const existingSliders = await db.select().from(sliders);
      if (existingSliders.length === 0) {
        await db.insert(sliders).values([
          {
            title: "Klima Sezonunda Büyük Fırsatlar",
            subtitle: "Yaz aylarına hazırlanın",
            description: "Tüm klima modellerinde özel indirim",
            image: "/public-objects/uploads/placeholder-1200x500.jpg",
            link: "/products?category=klima",
            buttonText: "Hemen İncele",
            isActive: true,
            order: 1,
          },
          {
            title: "Çamaşır Makinesi Kampanyası",
            subtitle: "9 kg kapasiteli çamaşır makineleri",
            description: "9 kg kapasiteli çamaşır makineleri avantajlı fiyatlarla",
            image: "/public-objects/uploads/placeholder-1200x500.jpg",
            link: "/products?category=camasir-makinesi",
            buttonText: "Satın Al",
            isActive: true,
            order: 2,
          }
        ]);
      }

      // Initialize category icons if not exist
      const existingIcons = await db.select().from(categoryIcons).limit(1);
      if (existingIcons.length === 0) {
        const defaultCategoryIcons = [
          {
            name: "Beyaz Eşya",
            icon: "https://img.icons8.com/ios/100/washing-machine.png",
            linkUrl: "/category/beyaz-esya",
            sortOrder: 1,
            isActive: true,
          },
          {
            name: "Televizyon",
            icon: "https://img.icons8.com/ios/100/tv.png",
            linkUrl: "/category/televizyon",
            sortOrder: 2,
            isActive: true,
          },
          {
            name: "Küçük Ev Aletleri",
            icon: "https://img.icons8.com/ios/100/kitchen-appliances.png",
            linkUrl: "/category/kucuk-ev-aletleri",
            sortOrder: 3,
            isActive: true,
          },
          {
            name: "Bilgisayar",
            icon: "https://img.icons8.com/ios/100/laptop.png",
            linkUrl: "/category/bilgisayar",
            sortOrder: 4,
            isActive: true,
          },
          {
            name: "Cep Telefonu",
            icon: "https://img.icons8.com/ios/100/smartphone.png",
            linkUrl: "/category/cep-telefonu",
            sortOrder: 5,
            isActive: true,
          },
          {
            name: "Elektrikli Süpürge",
            icon: "https://img.icons8.com/ios/100/vacuum-cleaner.png",
            linkUrl: "/category/elektrikli-supurge",
            sortOrder: 6,
            isActive: true,
          },
          {
            name: "Klima",
            icon: "https://img.icons8.com/ios/100/air-conditioner.png",
            linkUrl: "/category/klima",
            sortOrder: 7,
            isActive: true,
          },
          {
            name: "Ankastre",
            icon: "https://img.icons8.com/ios/100/oven.png",
            linkUrl: "/category/ankastre",
            sortOrder: 8,
            isActive: true,
          },
        ];

        await db.insert(categoryIcons).values(defaultCategoryIcons);
        console.log("✅ Default category icons initialized");
      }
    } catch (error) {
      console.error("Error initializing default data:", error);
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    const allUsers = await db.select().from(users);
    return allUsers;
  }

  async createUser(user: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const [newUser] = await db.insert(users).values({
      ...user,
      password: hashedPassword
    }).returning();
    return newUser;
  }

  async updateUser(id: string, updates: Partial<Pick<User, 'firstName' | 'lastName' | 'email' | 'phone' | 'tcKimlik'>>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.category, category));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined> {
    console.log(`Storage: Updating product ${id} with:`, updates);
    
    // Filter out timestamp and non-updatable fields to prevent type errors
    const { id: productId, createdAt, updatedAt, ...cleanUpdates } = updates as any;
    
    const [updatedProduct] = await db.update(products)
      .set({ ...cleanUpdates, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
      
    console.log(`Storage: Update result for ${id}:`, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Cart methods
  async getCartItems(userId: string): Promise<CartItem[]> {
    return await db.select().from(cartItems).where(eq(cartItems.userId, userId));
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    const [newCartItem] = await db.insert(cartItems).values(cartItem).returning();
    return newCartItem;
  }

  async updateCartItemQuantity(id: string, quantity: number): Promise<CartItem | undefined> {
    const [updatedItem] = await db.update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem;
  }

  async removeFromCart(id: string): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Favorite methods
  async getFavorites(userId: string): Promise<(Favorite & { product: Product })[]> {
    const results = await db
      .select({
        id: favorites.id,
        userId: favorites.userId,
        productId: favorites.productId,
        createdAt: favorites.createdAt,
        product: products
      })
      .from(favorites)
      .leftJoin(products, eq(favorites.productId, products.id))
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));
    
    // Filter out favorites where product is null
    return results.filter(result => result.product !== null) as (Favorite & { product: Product })[];
  }

  async addToFavorites(favorite: InsertFavorite): Promise<Favorite> {
    const [newFavorite] = await db.insert(favorites).values(favorite).returning();
    return newFavorite;
  }

  async removeFromFavorites(userId: string, productId: string): Promise<boolean> {
    const result = await db.delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.productId, productId)));
    return (result.rowCount ?? 0) > 0;
  }

  // Review methods
  async getReviews(productId: string): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.productId, productId));
  }

  async getReviewsByUser(userId: string): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.userId, userId));
  }

  async addReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async getUserReviewForProduct(userId: string, productId: string): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews)
      .where(and(eq(reviews.userId, userId), eq(reviews.productId, productId)));
    return review;
  }

  // Address methods
  async getAddresses(userId: string): Promise<Address[]> {
    return await db.select().from(addresses).where(eq(addresses.userId, userId));
  }

  async addAddress(address: InsertAddress): Promise<Address> {
    const [newAddress] = await db.insert(addresses).values(address).returning();
    return newAddress;
  }

  async updateAddress(id: string, updates: Partial<Address>): Promise<Address | undefined> {
    const [updatedAddress] = await db.update(addresses)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(addresses.id, id))
      .returning();
    return updatedAddress;
  }

  async deleteAddress(id: string): Promise<boolean> {
    const result = await db.delete(addresses).where(eq(addresses.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async setDefaultAddress(userId: string, addressId: string): Promise<boolean> {
    // First, unset all default addresses for the user
    await db.update(addresses)
      .set({ isDefault: false })
      .where(eq(addresses.userId, userId));
    
    // Then set the new default
    const result = await db.update(addresses)
      .set({ isDefault: true })
      .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)));
    
    return (result.rowCount ?? 0) > 0;
  }

  // Homepage sections methods
  async getHomepageSections(): Promise<HomepageSection[]> {
    return await db.select().from(homepageSections);
  }

  async getHomepageSection(sectionKey: string): Promise<HomepageSection | undefined> {
    const [section] = await db.select().from(homepageSections)
      .where(eq(homepageSections.sectionKey, sectionKey));
    return section;
  }

  async updateHomepageSection(sectionKey: string, updates: Partial<HomepageSection>): Promise<HomepageSection | undefined> {
    const [updatedSection] = await db.update(homepageSections)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(homepageSections.sectionKey, sectionKey))
      .returning();
    return updatedSection;
  }

  async getHomepageProducts(sectionKey: string): Promise<Product[]> {
    // Get the section first
    const section = await this.getHomepageSection(sectionKey);
    if (!section) return [];

    // Get the homepage products for this section
    const homepageProductList = await db.select()
      .from(homepageProducts)
      .where(eq(homepageProducts.sectionId, section.id))
      .orderBy(homepageProducts.order);

    // Get the actual product details
    const productIds = homepageProductList.map(hp => hp.productId);
    if (productIds.length === 0) return [];

    const productList = await db.select().from(products)
      .where(eq(products.id, productIds[0])); // Start with first product
    
    // Get all products in the correct order
    const orderedProducts: Product[] = [];
    for (const hp of homepageProductList) {
      const [product] = await db.select().from(products)
        .where(eq(products.id, hp.productId));
      if (product) {
        orderedProducts.push(product);
      }
    }

    return orderedProducts;
  }

  async updateHomepageProducts(sectionId: string, productIds: string[]): Promise<boolean> {
    try {
      console.log(`DatabaseStorage: Updating section ${sectionId} with products:`, productIds);

      // Delete existing homepage products for this section
      await db.delete(homepageProducts)
        .where(eq(homepageProducts.sectionId, sectionId));

      // Insert new homepage products
      if (productIds.length > 0) {
        const homepageProductsData = productIds.map((productId, index) => ({
          sectionId: sectionId,
          productId,
          order: index,
        }));

        await db.insert(homepageProducts).values(homepageProductsData);
        console.log(`DatabaseStorage: Inserted ${homepageProductsData.length} homepage products`);
      }

      return true;
    } catch (error) {
      console.error("Error updating homepage products:", error);
      return false;
    }
  }

  // Slider methods
  async getSliders(): Promise<Slider[]> {
    return await db.select().from(sliders).orderBy(sliders.order);
  }

  async getSlider(id: string): Promise<Slider | undefined> {
    const [slider] = await db.select().from(sliders).where(eq(sliders.id, id));
    return slider;
  }

  async updateSlider(id: string, updates: Partial<Slider>): Promise<Slider | undefined> {
    const [updatedSlider] = await db.update(sliders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(sliders.id, id))
      .returning();
    return updatedSlider;
  }

  async createSlider(slider: InsertSlider): Promise<Slider> {
    const [newSlider] = await db.insert(sliders)
      .values({
        ...slider,
        id: randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return newSlider;
  }

  async deleteSlider(id: string): Promise<boolean> {
    const result = await db.delete(sliders).where(eq(sliders.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async toggleSlider(id: string, isActive: boolean): Promise<Slider | undefined> {
    const [updatedSlider] = await db.update(sliders)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(sliders.id, id))
      .returning();
    return updatedSlider;
  }

  // Admin content methods
  private categories = [
    { id: "1", name: "Beyaz Eşya", icon: "🏠", subcategories: [
      "No Frost Buzdolabı", "Alttan Dondurucullu Buzdolabı", "Üstten Dondurucullu Buzdolabı", 
      "Gardrop Tipi Buzdolabı", "Statik Buzdolabı", "Mini Buzdolabı", "Ankastre Buzdolabı",
      "3 Programlı Bulaşık Makinesi", "4 Programlı Bulaşık Makinesi", "5 Programlı Bulaşık Makinesi",
      "6 Programlı Bulaşık Makinesi", "8 Programlı Bulaşık Makinesi", "Ankastre Bulaşık Makinesi",
      "Sandık Tipi Derin Dondurucu", "Çekmeceli Derin Dondurucu",
      "8 Kg Çamaşır Makinesi", "9 Kg Çamaşır Makinesi", "10 Kg Çamaşır Makinesi", 
      "11 Kg Çamaşır Makinesi", "12 Kg Çamaşır Makinesi",
      "8 Kg Kurutma Makinesi", "9 Kg Kurutma Makinesi", "10 Kg Kurutma Makinesi",
      "11 Kg Kurutma Makinesi", "12 Kg Kurutma Makinesi",
      "Su Sebili"
    ]},
    { id: "2", name: "Ankastre", icon: "🏡", subcategories: [
      "Ankastre Fırın", "Ankastre Standart Fırın", "Buhar Destekli Fırın", "Fry Buhar Destekli Fırın", 
      "Fry Ankastre Fırın", "On Buharlı A Fry Fırın",
      "Ankastre Mikrodalga", "Ankastre Mikrodalga Çerçevesi",
      "Entegre Davlumbazlı Ocak", "İndüksiyonlu Ocak", "Vitroseramik Ocak", "Gazlı Cam Tablalı Ocak",
      "Gazlı Metal Tablalı Ocak", "Domino Ocak", "Elektrikli Ocak",
      "Ankastre Ada Tipi Davlumbaz", "Ankastre Duvar Tipi Davlumbaz",
      "Ankastre Sürgülü Aspiratör", "Ankastre Gömme Aspiratör"
    ]},
    { id: "3", name: "Televizyon", icon: "📺", subcategories: [
      "QLED", "OLED", "Google TV", "Imperium TV", "Full HD & HD", "Dev Ekran TV", "4K TV", "LED TV",
      "32 İnç (80 Ekran) TV", "40 İnç (100 Ekran) TV", "43 İnç (109 Ekran) TV", "50 İnç (127 Ekran) TV",
      "55 İnç (140 Ekran) TV", "65 İnç (165 Ekran) TV", "75 İnç (190 Ekran) TV",
      "Philips TV", "Grundig TV", "TCL TV"
    ]},
    { id: "4", name: "Elektronik", icon: "💻", subcategories: [
      "iPhone Telefon Modelleri", "Android Telefon Modelleri",
      "Yazar Kasa POS", "Android POS", "Pompa Yazarkasa", "Aksesuarlar",
      "Şarj Cihazları", "Şarj Kabloları", "Powerbank", "Diğer Telefon Aksesuarları", "Telefon Kulaklığı", "Telefon Kılıfı",
      "Laptop", "Tablet", "Masaüstü Bilgisayar",
      "Ses Sistemleri", "Kulaklık", "Medya Oynatıcı",
      "VR Gözlük", "Akıllı Saat", "Akıllı Bileklik", "Saat ve Bileklik Aksesuarı",
      "Elektrikli Scooter",
      "Oyun Konsolu", "Fotoğraf Kamera", "Bilgisayar Aksesuarları", "Oyuncu Ekipmanları", 
      "Konsol Oyunları", "Oyun Konsolu Aksesuarları", "Masaüstü Bilgisayarlar", "Bilgisayar Çevre Birimleri"
    ]},
    { id: "5", name: "Isıtma Soğutma", icon: "❄️", subcategories: [
      "Split Klima", "Salon Tipi Klima", "Portatif Klima", "7000 BTU Klima", "9000 BTU Klima", 
      "12000 BTU Klima", "18000 BTU Klima", "24000 BTU Klima", "26000 BTU Klima", "34000 BTU Klima", 
      "48000 BTU Klima", "55000 BTU Klima",
      "Premix Yoğuşmalı Kombi", "Oda Termostatı",
      "Hava Soğutucu",
      "Ayaklı Vantilatör", "Tavan Tipi Vantilatör", "Kule Tipi Vantilatör",
      "Standart Termosifon", "Dijital Termosifon", "Smart Termosifon",
      "Seramik Isıtıcı", "İnfrared Isıtıcı", "Yağlı Radyatör", "Konvektör Isıtıcı"
    ]},
    { id: "6", name: "Küçük Ev Aletleri", icon: "🏠", subcategories: [
      "Küçük Ev Aletleri Mutfak Setleri",
      "Elektrikli Süpürge",
      "Şarjlı Dikey Süpürge", 
      "Robot Süpürge",
      "Toz Torbasız Süpürge",
      "Toz Torbalı Süpürge",
      "Islak Kuru Süpürge",
      "Toz Torbası",
      "Slush ve Buzlu İçecek Makineleri",
      "Semaver",
      "Kettle",
      "Katı Meyve Sıkacağı",
      "Narenciye Sıkacağı",
      "Karıştırıcı & Doğrayıcı",
      "El Blender",
      "Blender",
      "Mikser",
      "Doğrayıcı",
      "Kıyma Makinesi",
      "Mutfak Robotu",
      "Mutfak Makinesi",
      "Ütü",
      "Buharlı Ütü",
      "Kazanlı Ütü",
      "Buharlı Kırışık Giderici",
      "Ütü Masası",
      "Kahve Makinesi",
      "Espresso Makinesi",
      "Türk Kahve Makinesi",
      "Filtre Kahve Makinesi",
      "Kapsüllü Kahve",
      "Kahve Öğütücü",
      "Kahve Demleme Ekipmanları",
      "Çay Makinesi",
      "Pişirici",
      "Tost Makinesi",
      "Ekmek Kızartma Makinesi",
      "Çok Amaçlı Pişirici",
      "Az Yağlı Fritöz",
      "Waffle Makinesi",
      "Yoğurt & Kefir Makinesi",
      "Kişisel Bakım",
      "Saç Kurutma Makinesi",
      "Saç Düzleştirici",
      "Saç Maşası",
      "Baskül",
      "Tıraş Makineleri",
      "Saç Sakal Kesme Makineleri",
      "Epilatör",
      "Outdoor Ekipman",
      "Termos",
      "Buz Makinesi",
      "Küçük Ev Aletleri Yedek Parça ve Aksesuarları"
    ]}
  ];

  getCategories() {
    return [...this.categories];
  }

  addCategory(categoryData: { name: string; icon: string; subcategories?: string[] }) {
    const newCategory = {
      id: (this.categories.length + 1).toString(),
      name: categoryData.name,
      icon: categoryData.icon,
      subcategories: categoryData.subcategories || []
    };
    this.categories.push(newCategory);
    return newCategory;
  }

  updateCategory(id: string, updates: { name?: string; icon?: string; subcategories?: string[] }) {
    const categoryIndex = this.categories.findIndex(cat => cat.id === id);
    if (categoryIndex === -1) return null;
    
    this.categories[categoryIndex] = {
      ...this.categories[categoryIndex],
      ...updates
    };
    return this.categories[categoryIndex];
  }

  deleteCategory(id: string) {
    const categoryIndex = this.categories.findIndex(cat => cat.id === id);
    if (categoryIndex === -1) return false;
    
    this.categories.splice(categoryIndex, 1);
    return true;
  }

  async getNavigationItems() {
    return await db.select().from(navigationItems).orderBy(navigationItems.orderIndex);
  }

  async updateNavigationItem(id: string, updates: any) {
    const [updatedItem] = await db.update(navigationItems)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(navigationItems.id, id))
      .returning();
    
    return updatedItem || null;
  }

  async initializeNavigationItems() {
    // Check if navigation items exist
    const existingItems = await db.select().from(navigationItems);
    if (existingItems.length === 0) {
      // Insert default navigation items
      await db.insert(navigationItems).values([
        { id: "1", label: "Ürünler", path: "/products", isActive: true, orderIndex: 1 },
        { id: "2", label: "Teknolojiler", path: "/technologies", isActive: true, orderIndex: 2 },
        { id: "3", label: "Kampanyalar", path: "/campaigns", isActive: true, orderIndex: 3 },
        { id: "4", label: "Kurumsal", path: "/corporate", isActive: true, orderIndex: 4 }
      ]);
    }
  }

  // Order methods implementation
  async getOrders(userId: string): Promise<(Order & { items: (OrderItem & { product: Product })[] })[]> {
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));

    const ordersWithItems = [];
    for (const order of userOrders) {
      const items = await db
        .select({
          id: orderItems.id,
          orderId: orderItems.orderId,
          productId: orderItems.productId,
          quantity: orderItems.quantity,
          price: orderItems.price,
          warranty: orderItems.warranty,
          createdAt: orderItems.createdAt,
          product: products
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, order.id));

      // Filter out items where product is null
      const validItems = items.filter(item => item.product !== null) as (OrderItem & { product: Product })[];
      ordersWithItems.push({ ...order, items: validItems });
    }
    return ordersWithItems;
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    // Generate order number
    const orderNumber = `ARÇ${Date.now()}`;
    
    const [createdOrder] = await db
      .insert(orders)
      .values({ ...order, orderNumber, status: order.status || 'preparing' })
      .returning();

    // Insert order items
    for (const item of items) {
      await db
        .insert(orderItems)
        .values({ ...item, orderId: createdOrder.id });
    }

    return createdOrder;
  }

  async getOrder(orderId: string): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined> {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) return undefined;

    const items = await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        price: orderItems.price,
        warranty: orderItems.warranty,
        createdAt: orderItems.createdAt,
        product: products
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, order.id));

    // Filter out items where product is null
    const validItems = items.filter(item => item.product !== null) as (OrderItem & { product: Product })[];
    return { ...order, items: validItems };
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();
    
    return updatedOrder;
  }

  async updateOrderTrackingCode(orderId: string, trackingCode: string): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ trackingCode, updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();
    
    return updatedOrder;
  }

  // Admin order methods implementation
  async getAllOrders(): Promise<(Order & { items: (OrderItem & { product: Product })[]; user: Pick<User, 'id' | 'firstName' | 'lastName'> })[]> {
    const allOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt));

    const ordersWithDetails = [];
    for (const order of allOrders) {
      const items = await db
        .select({
          id: orderItems.id,
          orderId: orderItems.orderId,
          productId: orderItems.productId,
          quantity: orderItems.quantity,
          price: orderItems.price,
          warranty: orderItems.warranty,
          createdAt: orderItems.createdAt,
          product: {
            id: products.id,
            name: products.name,
            description: products.description,
            price: products.price,
            originalPrice: products.originalPrice,
            category: products.category,
            subcategory: products.subcategory,
            brand: products.brand,
            materialCode: products.materialCode,
            image: products.image,
            images: products.images,
            features: products.features,
            inStock: products.inStock,
            energyClass: products.energyClass,
            createdAt: products.createdAt,
            updatedAt: products.updatedAt
          }
        })
        .from(orderItems)
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, order.id));

      const user = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName
        })
        .from(users)
        .where(eq(users.id, order.userId))
        .limit(1);

      ordersWithDetails.push({
        ...order,
        items,
        user: user[0] || { id: order.userId, firstName: 'Bilinmeyen', lastName: 'Kullanıcı' }
      });
    }
    
    return ordersWithDetails;
  }

  async adminUpdateOrderStatus(orderId: string, status: string): Promise<Order | undefined> {
    const [result] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();
    
    return result;
  }

  // Coupon methods implementation  
  async getCoupons(): Promise<Coupon[]> {
    return await db.select().from(coupons).orderBy(desc(coupons.createdAt));
  }

  async getCoupon(id: string): Promise<Coupon | undefined> {
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.id, id))
      .limit(1);
    return coupon;
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, code))
      .limit(1);
    return coupon;
  }

  async createCoupon(coupon: InsertCoupon): Promise<Coupon> {
    try {
      const [created] = await db.insert(coupons).values(coupon).returning();
      return created;
    } catch (error) {
      // Log to file since console is not visible  
      const errorMessage = `Storage Error: ${error instanceof Error ? error.message : String(error)}`;
      console.error("COUPON CREATE ERROR:", errorMessage);
      throw new Error(errorMessage);
    }
  }

  async updateCoupon(id: string, updates: Partial<Coupon>): Promise<Coupon | undefined> {
    try {
      const updateData = { ...updates, updatedAt: new Date() };
      const [updated] = await db
        .update(coupons)
        .set(updateData)
        .where(eq(coupons.id, id))
        .returning();
      return updated;
    } catch (error) {
      console.error("Storage updateCoupon error:", error);
      throw error;
    }
  }

  async deleteCoupon(id: string): Promise<boolean> {
    const result = await db.delete(coupons).where(eq(coupons.id, id));
    return (result.rowCount || 0) > 0;
  }

  async validateCoupon(code: string, orderAmount: number): Promise<Coupon | null> {
    const coupon = await this.getCouponByCode(code);
    
    if (!coupon || !coupon.isActive) {
      return null;
    }
    
    const now = new Date();
    
    // validFrom kontrolü (kupon henüz başlamadıysa)
    if (coupon.validFrom && now < coupon.validFrom) {
      return null;
    }
    
    // validUntil kontrolü (kupon süresi bittiyse)
    if (coupon.validUntil && now > coupon.validUntil) {
      return null;
    }
    
    // Minimum sipariş tutarı kontrolü
    if (coupon.minOrderAmount && orderAmount < parseFloat(coupon.minOrderAmount)) {
      return null;
    }
    
    // Kullanım limiti kontrolü
    if (coupon.usageLimit && coupon.usageLimit > 0 && (coupon.usedCount || 0) >= coupon.usageLimit) {
      return null;
    }
    
    return coupon;
  }

  // User coupon methods implementation
  async getUserCoupons(userId: string): Promise<(UserCoupon & { coupon: Coupon })[]> {
    return await db
      .select({
        id: userCoupons.id,
        userId: userCoupons.userId,
        couponId: userCoupons.couponId,
        isUsed: userCoupons.isUsed,
        usedAt: userCoupons.usedAt,
        assignedAt: userCoupons.assignedAt,
        createdAt: userCoupons.createdAt,
        coupon: coupons
      })
      .from(userCoupons)
      .innerJoin(coupons, eq(userCoupons.couponId, coupons.id))
      .where(eq(userCoupons.userId, userId))
      .orderBy(desc(userCoupons.assignedAt));
  }

  async assignCouponToUser(userId: string, couponId: string): Promise<UserCoupon> {
    const [userCoupon] = await db
      .insert(userCoupons)
      .values({ userId, couponId })
      .returning();
    return userCoupon;
  }

  async markCouponAsUsed(userCouponId: string): Promise<boolean> {
    const result = await db
      .update(userCoupons)
      .set({ isUsed: true, usedAt: new Date() })
      .where(eq(userCoupons.id, userCouponId));
    return (result.rowCount || 0) > 0;
  }

  // General settings implementation
  async getGeneralSettings(): Promise<GeneralSettings> {
    const [settings] = await db.select().from(generalSettings).limit(1);
    
    // If no settings exist, create default ones
    if (!settings) {
      const [created] = await db
        .insert(generalSettings)
        .values({})
        .returning();
      return created;
    }
    
    return settings;
  }

  async updateGeneralSettings(updates: Partial<InsertGeneralSettings>): Promise<GeneralSettings> {
    // Get current settings (or create if none exist)
    const currentSettings = await this.getGeneralSettings();
    
    // Update the settings
    const [updated] = await db
      .update(generalSettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(generalSettings.id, currentSettings.id))
      .returning();
    
    return updated;
  }
  
  // Corporate content methods
  async getCorporateContent(): Promise<CorporateContent> {
    const [content] = await db.select().from(corporateContent).limit(1);
    
    // If no content exists, create default ones
    if (!content) {
      const [created] = await db
        .insert(corporateContent)
        .values({})
        .returning();
      return created;
    }
    
    return content;
  }

  async updateCorporateContent(updates: Partial<InsertCorporateContent>): Promise<CorporateContent> {
    // Get current content (or create if none exist)
    const currentContent = await this.getCorporateContent();
    
    // Update the content
    const [updated] = await db
      .update(corporateContent)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(corporateContent.id, currentContent.id))
      .returning();
    
    return updated;
  }
  
  // Campaign methods
  async getCampaigns(): Promise<Campaign[]> {
    return await db.select().from(campaigns).orderBy(campaigns.sortOrder, campaigns.createdAt);
  }

  async getCampaign(id: string): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign;
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const [created] = await db
      .insert(campaigns)
      .values({ ...campaign, updatedAt: new Date() })
      .returning();
    return created;
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign | undefined> {
    const [updated] = await db
      .update(campaigns)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(campaigns.id, id))
      .returning();
    return updated;
  }

  async deleteCampaign(id: string): Promise<boolean> {
    const result = await db.delete(campaigns).where(eq(campaigns.id, id));
    return (result.rowCount || 0) > 0;
  }
  
  // Campaign settings methods
  async getCampaignSettings(): Promise<CampaignSettings> {
    const [settings] = await db.select().from(campaignSettings).limit(1);
    
    // If no settings exist, create default ones
    if (!settings) {
      const [created] = await db
        .insert(campaignSettings)
        .values({})
        .returning();
      return created;
    }
    
    return settings;
  }

  async updateCampaignSettings(updates: Partial<InsertCampaignSettings>): Promise<CampaignSettings> {
    // Get current settings (or create if none exist)
    const currentSettings = await this.getCampaignSettings();
    
    // Update the settings
    const [updated] = await db
      .update(campaignSettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(campaignSettings.id, currentSettings.id))
      .returning();
    
    return updated;
  }

  // Virtual POS implementations
  async getVirtualPosConfigs(): Promise<VirtualPosConfig[]> {
    const result = await db.select().from(virtualPosConfigs).orderBy(virtualPosConfigs.displayOrder);
    return result;
  }

  async getVirtualPosConfig(id: string): Promise<VirtualPosConfig | undefined> {
    const result = await db.select().from(virtualPosConfigs).where(eq(virtualPosConfigs.id, id)).limit(1);
    return result[0];
  }

  async getActiveVirtualPosConfigs(): Promise<VirtualPosConfig[]> {
    const result = await db.select().from(virtualPosConfigs)
      .where(eq(virtualPosConfigs.isActive, true))
      .orderBy(virtualPosConfigs.displayOrder);
    return result;
  }

  async createVirtualPosConfig(config: InsertVirtualPosConfig): Promise<VirtualPosConfig> {
    const result = await db.insert(virtualPosConfigs).values(config).returning();
    return result[0];
  }

  async updateVirtualPosConfig(id: string, updates: Partial<VirtualPosConfig>): Promise<VirtualPosConfig | undefined> {
    const result = await db.update(virtualPosConfigs)
      .set({ ...updates, updatedAt: sql`now()` })
      .where(eq(virtualPosConfigs.id, id))
      .returning();
    return result[0];
  }

  async deleteVirtualPosConfig(id: string): Promise<boolean> {
    const result = await db.delete(virtualPosConfigs).where(eq(virtualPosConfigs.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Payment transaction implementations
  async createPaymentTransaction(transaction: InsertPaymentTransaction): Promise<PaymentTransaction> {
    const result = await db.insert(paymentTransactions).values(transaction).returning();
    return result[0];
  }

  async updatePaymentTransaction(id: string, updates: Partial<PaymentTransaction>): Promise<PaymentTransaction | undefined> {
    const result = await db.update(paymentTransactions)
      .set({ ...updates, updatedAt: sql`now()` })
      .where(eq(paymentTransactions.id, id))
      .returning();
    return result[0];
  }

  async getPaymentTransaction(id: string): Promise<PaymentTransaction | undefined> {
    const result = await db.select().from(paymentTransactions).where(eq(paymentTransactions.id, id)).limit(1);
    return result[0];
  }

  async getPaymentTransactionByOrder(orderId: string): Promise<PaymentTransaction | undefined> {
    const result = await db.select().from(paymentTransactions).where(eq(paymentTransactions.orderId, orderId)).limit(1);
    return result[0];
  }

  // Bank installment implementations
  async getBankInstallments(virtualPosConfigId: string): Promise<BankInstallment[]> {
    const result = await db.select().from(bankInstallments)
      .where(and(
        eq(bankInstallments.virtualPosConfigId, virtualPosConfigId),
        eq(bankInstallments.isActive, true)
      ))
      .orderBy(bankInstallments.installmentCount);
    return result;
  }

  async getAllBankInstallments(): Promise<BankInstallment[]> {
    const result = await db.select().from(bankInstallments)
      .orderBy(bankInstallments.virtualPosConfigId, bankInstallments.installmentCount);
    return result;
  }

  async getAllBankInstallmentsWithVirtualPosInfo(): Promise<any[]> {
    const result = await db.select({
      id: bankInstallments.id,
      virtualPosConfigId: bankInstallments.virtualPosConfigId,
      bankName: virtualPosConfigs.bankName,
      cardType: bankInstallments.cardType,
      installmentCount: bankInstallments.installmentCount,
      commissionRate: bankInstallments.commissionRate,
      isActive: bankInstallments.isActive,
      minAmount: bankInstallments.minAmount,
    })
    .from(bankInstallments)
    .innerJoin(virtualPosConfigs, eq(bankInstallments.virtualPosConfigId, virtualPosConfigs.id))
    .where(eq(bankInstallments.isActive, true))
    .orderBy(virtualPosConfigs.bankName, bankInstallments.installmentCount);
    
    return result;
  }

  async createBankInstallment(installment: InsertBankInstallment): Promise<BankInstallment> {
    const result = await db.insert(bankInstallments).values(installment).returning();
    return result[0];
  }

  async updateBankInstallment(id: string, updates: Partial<BankInstallment>): Promise<BankInstallment | undefined> {
    const result = await db.update(bankInstallments)
      .set(updates)
      .where(eq(bankInstallments.id, id))
      .returning();
    return result[0];
  }

  async deleteBankInstallment(id: string): Promise<boolean> {
    const result = await db.delete(bankInstallments).where(eq(bankInstallments.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Bank account implementations
  async getBankAccounts(): Promise<BankAccount[]> {
    const result = await db.select().from(bankAccounts)
      .orderBy(bankAccounts.isDefault, bankAccounts.bankName);
    return result;
  }

  async getBankAccount(id: string): Promise<BankAccount | undefined> {
    const result = await db.select().from(bankAccounts)
      .where(eq(bankAccounts.id, id))
      .limit(1);
    return result[0];
  }

  async createBankAccount(account: InsertBankAccount): Promise<BankAccount> {
    // If this is set as default, make sure no other account is default
    if (account.isDefault) {
      await db.update(bankAccounts)
        .set({ isDefault: false })
        .where(eq(bankAccounts.isDefault, true));
    }

    const result = await db.insert(bankAccounts).values(account).returning();
    return result[0];
  }

  async updateBankAccount(id: string, updates: Partial<BankAccount>): Promise<BankAccount | undefined> {
    // If this is set as default, make sure no other account is default
    if (updates.isDefault) {
      await db.update(bankAccounts)
        .set({ isDefault: false })
        .where(eq(bankAccounts.isDefault, true));
    }

    // Remove timestamp fields from updates to avoid type conflicts
    const { createdAt, updatedAt, ...validUpdates } = updates;

    const result = await db.update(bankAccounts)
      .set({ ...validUpdates, updatedAt: new Date() })
      .where(eq(bankAccounts.id, id))
      .returning();
    return result[0];
  }

  async deleteBankAccount(id: string): Promise<boolean> {
    const result = await db.delete(bankAccounts).where(eq(bankAccounts.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Password reset token implementations
  async createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<any> {
    const result = await db.insert(passwordResetTokens).values({
      userId,
      token,
      expiresAt,
      used: false,
    }).returning();
    return result[0];
  }

  async getPasswordResetToken(token: string): Promise<any> {
    const result = await db.select().from(passwordResetTokens)
      .where(and(
        eq(passwordResetTokens.token, token),
        eq(passwordResetTokens.used, false),
        gte(passwordResetTokens.expiresAt, new Date())
      ))
      .limit(1);
    return result[0];
  }

  async markPasswordResetTokenAsUsed(token: string): Promise<boolean> {
    const result = await db.update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.token, token));
    return (result.rowCount ?? 0) > 0;
  }

  async resetUserPassword(userId: string, newPassword: string): Promise<User | undefined> {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const result = await db.update(users)
      .set({ 
        password: hashedPassword, 
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  // Email verification methods implementation
  async generateEmailVerificationToken(userId: string): Promise<string> {
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await db.update(users)
      .set({
        emailVerificationToken: token,
        emailVerificationExpires: expiresAt,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    return token;
  }

  async verifyEmailToken(token: string): Promise<User | undefined> {
    const [user] = await db.select()
      .from(users)
      .where(and(
        eq(users.emailVerificationToken, token),
        gte(users.emailVerificationExpires, new Date())
      ))
      .limit(1);

    if (!user) return undefined;

    // Mark email as verified and clear token
    const [updatedUser] = await db.update(users)
      .set({
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id))
      .returning();

    return updatedUser;
  }

  async resendEmailVerification(userId: string): Promise<string> {
    return await this.generateEmailVerificationToken(userId);
  }




  // Support ticket methods implementation
  async getSupportTickets(userId?: string): Promise<(SupportTicket & { user: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'> })[]> {
    try {
      let query = db
        .select({
          id: supportTickets.id,
          userId: supportTickets.userId,
          subject: supportTickets.subject,
          description: supportTickets.description,
          priority: supportTickets.priority,
          status: supportTickets.status,
          category: supportTickets.category,
          assignedToAdminId: supportTickets.assignedToAdminId,
          createdAt: supportTickets.createdAt,
          updatedAt: supportTickets.updatedAt,
          user: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email
          }
        })
        .from(supportTickets)
        .innerJoin(users, eq(supportTickets.userId, users.id))
        .orderBy(desc(supportTickets.createdAt));

      if (userId) {
        return await query.where(eq(supportTickets.userId, userId));
      }
      return await query;
    } catch (error) {
      console.error("Error getting support tickets:", error);
      throw error;
    }
  }

  async getSupportTicket(id: string): Promise<(SupportTicket & { user: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'> }) | undefined> {
    try {
      const result = await db
        .select({
          id: supportTickets.id,
          userId: supportTickets.userId,
          subject: supportTickets.subject,
          description: supportTickets.description,
          priority: supportTickets.priority,
          status: supportTickets.status,
          category: supportTickets.category,
          assignedToAdminId: supportTickets.assignedToAdminId,
          createdAt: supportTickets.createdAt,
          updatedAt: supportTickets.updatedAt,
          user: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email
          }
        })
        .from(supportTickets)
        .innerJoin(users, eq(supportTickets.userId, users.id))
        .where(eq(supportTickets.id, id))
        .limit(1);

      return result[0];
    } catch (error) {
      console.error("Error getting support ticket:", error);
      throw error;
    }
  }

  async getAllSupportTicketsWithUsers(): Promise<(SupportTicket & { user: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'> })[]> {
    try {
      return await db
        .select({
          id: supportTickets.id,
          userId: supportTickets.userId,
          subject: supportTickets.subject,
          description: supportTickets.description,
          priority: supportTickets.priority,
          status: supportTickets.status,
          category: supportTickets.category,
          assignedToAdminId: supportTickets.assignedToAdminId,
          createdAt: supportTickets.createdAt,
          updatedAt: supportTickets.updatedAt,
          user: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email
          }
        })
        .from(supportTickets)
        .innerJoin(users, eq(supportTickets.userId, users.id))
        .orderBy(desc(supportTickets.createdAt));
    } catch (error) {
      console.error("Error getting all support tickets with users:", error);
      throw error;
    }
  }

  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    try {
      const result = await db.insert(supportTickets).values(ticket).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating support ticket:", error);
      throw error;
    }
  }

  async updateSupportTicket(id: string, updates: Partial<SupportTicket>): Promise<SupportTicket | undefined> {
    try {
      const result = await db
        .update(supportTickets)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(supportTickets.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Error updating support ticket:", error);
      throw error;
    }
  }

  async assignTicketToAdmin(ticketId: string, adminId: string): Promise<SupportTicket | undefined> {
    try {
      const result = await db
        .update(supportTickets)
        .set({ assignedToAdminId: adminId, status: "in_progress", updatedAt: new Date() })
        .where(eq(supportTickets.id, ticketId))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Error assigning ticket to admin:", error);
      throw error;
    }
  }

  // Support ticket message methods implementation
  async getTicketMessages(ticketId: string): Promise<(SupportTicketMessage & { sender: Pick<User, 'id' | 'firstName' | 'lastName' | 'role'> })[]> {
    try {
      const messages = await db
        .select({
          id: supportTicketMessages.id,
          ticketId: supportTicketMessages.ticketId,
          senderId: supportTicketMessages.senderId,
          senderType: supportTicketMessages.senderType,
          message: supportTicketMessages.message,
          createdAt: supportTicketMessages.createdAt,
          sender: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            role: users.role
          }
        })
        .from(supportTicketMessages)
        .innerJoin(users, eq(supportTicketMessages.senderId, users.id))
        .where(eq(supportTicketMessages.ticketId, ticketId))
        .orderBy(supportTicketMessages.createdAt);

      return messages;
    } catch (error) {
      console.error("Error getting ticket messages:", error);
      throw error;
    }
  }

  async createTicketMessage(message: InsertSupportTicketMessage): Promise<SupportTicketMessage> {
    try {
      const result = await db.insert(supportTicketMessages).values(message).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating ticket message:", error);
      throw error;
    }
  }

  // Contact message methods implementation
  async getContactMessages(): Promise<ContactMessage[]> {
    try {
      return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      throw error;
    }
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    try {
      const [newMessage] = await db.insert(contactMessages).values(message).returning();
      return newMessage;
    } catch (error) {
      console.error("Error creating contact message:", error);
      throw error;
    }
  }

  async markContactMessageAsRead(id: string): Promise<ContactMessage | undefined> {
    try {
      const [updatedMessage] = await db
        .update(contactMessages)
        .set({ isRead: true, updatedAt: sql`now()` })
        .where(eq(contactMessages.id, id))
        .returning();
      return updatedMessage;
    } catch (error) {
      console.error("Error marking contact message as read:", error);
      throw error;
    }
  }

  async addContactMessageResponse(id: string, response: string): Promise<ContactMessage | undefined> {
    try {
      const [updatedMessage] = await db
        .update(contactMessages)
        .set({ adminResponse: response, isRead: true, updatedAt: sql`now()` })
        .where(eq(contactMessages.id, id))
        .returning();
      return updatedMessage;
    } catch (error) {
      console.error("Error adding contact message response:", error);
      throw error;
    }
  }

  // Category icons implementation
  async getCategoryIcons(): Promise<CategoryIcon[]> {
    try {
      const icons = await db
        .select()
        .from(categoryIcons)
        .orderBy(sql`${categoryIcons.sortOrder} ASC, ${categoryIcons.createdAt} ASC`);
      return icons;
    } catch (error) {
      console.error("Error getting category icons:", error);
      return [];
    }
  }

  async getCategoryIcon(id: string): Promise<CategoryIcon | undefined> {
    try {
      const [icon] = await db
        .select()
        .from(categoryIcons)
        .where(eq(categoryIcons.id, id));
      return icon;
    } catch (error) {
      console.error("Error getting category icon:", error);
      return undefined;
    }
  }

  async createCategoryIcon(icon: InsertCategoryIcon): Promise<CategoryIcon> {
    const [newIcon] = await db
      .insert(categoryIcons)
      .values(icon)
      .returning();
    return newIcon;
  }

  async updateCategoryIcon(id: string, updates: Partial<CategoryIcon>): Promise<CategoryIcon | undefined> {
    try {
      const [updated] = await db
        .update(categoryIcons)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(categoryIcons.id, id))
        .returning();
      return updated;
    } catch (error) {
      console.error("Error updating category icon:", error);
      return undefined;
    }
  }

  async deleteCategoryIcon(id: string): Promise<boolean> {
    try {
      await db
        .delete(categoryIcons)
        .where(eq(categoryIcons.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting category icon:", error);
      return false;
    }
  }

  async toggleCategoryIcon(id: string, isActive: boolean): Promise<CategoryIcon | undefined> {
    try {
      const [updated] = await db
        .update(categoryIcons)
        .set({ isActive, updatedAt: new Date() })
        .where(eq(categoryIcons.id, id))
        .returning();
      return updated;
    } catch (error) {
      console.error("Error toggling category icon:", error);
      return undefined;
    }
  }

  // Product cards implementation
  async getAllProductCards(): Promise<ProductCard[]> {
    try {
      const cards = await db
        .select()
        .from(productCards)
        .orderBy(sql`${productCards.sortOrder} ASC, ${productCards.createdAt} ASC`);
      return cards;
    } catch (error) {
      console.error("Error getting product cards:", error);
      return [];
    }
  }

  async getProductCard(id: string): Promise<ProductCard | undefined> {
    try {
      const [card] = await db
        .select()
        .from(productCards)
        .where(eq(productCards.id, id));
      return card;
    } catch (error) {
      console.error("Error getting product card:", error);
      return undefined;
    }
  }

  async createProductCard(card: InsertProductCard): Promise<ProductCard> {
    const [newCard] = await db
      .insert(productCards)
      .values(card)
      .returning();
    return newCard;
  }

  async updateProductCard(id: string, updates: Partial<ProductCard>): Promise<ProductCard | undefined> {
    try {
      const [updated] = await db
        .update(productCards)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(productCards.id, id))
        .returning();
      return updated;
    } catch (error) {
      console.error("Error updating product card:", error);
      return undefined;
    }
  }

  async deleteProductCard(id: string): Promise<boolean> {
    try {
      await db
        .delete(productCards)
        .where(eq(productCards.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting product card:", error);
      return false;
    }
  }

  // Extended warranty methods implementation
  async getExtendedWarrantyCategories(): Promise<any[]> {
    try {
      // Get warranty categories from database
      const categories = await db.select().from(extendedWarrantyCategories).where(eq(extendedWarrantyCategories.isActive, true));
      
      // Convert decimal strings back to numbers for the API response
      return categories.map(cat => ({
        id: cat.id,
        categoryName: cat.categoryName,
        twoYearPrice: parseFloat(cat.twoYearPrice),
        fourYearPrice: parseFloat(cat.fourYearPrice)
      }));
    } catch (error) {
      console.error("Error getting extended warranty categories:", error);
      return [];
    }
  }

  async getExtendedWarrantyByCategory(categoryName: string): Promise<any | undefined> {
    try {
      const categoryLower = categoryName.toLowerCase();
      
      // Categories that should NOT have extended warranty - return undefined immediately
      const shouldExclude = 
        categoryLower.includes('mini') ||
        categoryLower.includes('küçük ev eşya') ||
        categoryLower.includes('aspiratör') ||
        categoryLower.includes('elektronik') ||
        categoryLower.includes('televizyon') ||
        categoryLower.includes('tv') ||
        categoryLower.includes('su sebili') ||
        // Only exclude if it contains BOTH 'ankastre' AND 'mikrodalga'
        (categoryLower.includes('ankastre') && categoryLower.includes('mikrodalga')) ||
        // Only exclude standalone 'mikrodalga' that doesn't contain 'fırın' 
        (categoryLower.includes('mikrodalga') && !categoryLower.includes('ankastre') && !categoryLower.includes('fırın'));
      
      if (shouldExclude) {
        return undefined; // No warranty for these categories
      }
      
      const allCategories = await this.getExtendedWarrantyCategories();
      
      // Direct match first
      let warranty = allCategories.find(cat => cat.categoryName.toLowerCase() === categoryLower);
      
      // If no direct match, try smart mapping for common categories
      if (!warranty) {
        // For "Beyaz Eşya", don't automatically map to a specific warranty
        // Instead, let the product-specific mapping logic handle it
        if (categoryLower === "beyaz eşya" || categoryLower === "beyaz esya") {
          // Return a generic warranty or the first available one for the logic to work
          warranty = allCategories.find(cat => cat.categoryName.toLowerCase().includes("buzdolab"));
          // If no buzdolabi warranty found, use the first available
          if (!warranty && allCategories.length > 0) {
            warranty = allCategories[0];
          }
        }
        
        // Map categories with smart matching - BUT SKIP if it's a mini or excluded category
        // Fırın kategorileri - ankastre fırınları da dahil et
        else if ((categoryLower.includes("fırın") || categoryLower.includes("firin") || (categoryLower.includes("ankastre") && !categoryLower.includes("mikrodalga"))) && !categoryLower.includes("mini")) {
          warranty = allCategories.find(cat => cat.categoryName.toLowerCase() === "fırın");
        }
        
        // Ocak kategorileri
        else if (categoryLower.includes("ocak") && !categoryLower.includes("mini")) {
          warranty = allCategories.find(cat => cat.categoryName.toLowerCase() === "ocak");
        }
        
        // Davlumbaz kategorileri
        else if (categoryLower.includes("davlumbaz")) {
          warranty = allCategories.find(cat => cat.categoryName.toLowerCase() === "davlumbaz");
        }
        
        // Buzdolabı kategorileri
        else if ((categoryLower.includes("üstten donduru") || categoryLower.includes("ustten donduru")) && !categoryLower.includes("mini")) {
          warranty = allCategories.find(cat => cat.categoryName.toLowerCase() === "üstten donduruculu buzdolabı");
        } else if ((categoryLower.includes("alttan donduru") || categoryLower.includes("alttan donduru")) && !categoryLower.includes("mini")) {
          warranty = allCategories.find(cat => cat.categoryName.toLowerCase() === "alttan donduruculu buzdolabı");
        } else if ((categoryLower.includes("gardırop") || categoryLower.includes("gardirop")) && !categoryLower.includes("mini")) {
          warranty = allCategories.find(cat => cat.categoryName.toLowerCase() === "gardırop tipi buzdolabı");
        } else if ((categoryLower.includes("statik") && categoryLower.includes("buzdolab")) && !categoryLower.includes("mini")) {
          warranty = allCategories.find(cat => cat.categoryName.toLowerCase() === "statik buzdolabı");
        } else if ((categoryLower.includes("buzdolabı") || categoryLower.includes("buzdolabi")) && !categoryLower.includes("mini")) {
          // Default buzdolabı to no-frost
          warranty = allCategories.find(cat => cat.categoryName.toLowerCase() === "no-frost buzdolabı");
        }
        
        // Çamaşır ve kurutma kategorileri
        else if ((categoryLower.includes("kurutmalı çamaşır") || categoryLower.includes("kurutmli camasir")) && !categoryLower.includes("mini")) {
          warranty = allCategories.find(cat => cat.categoryName.toLowerCase() === "kurutmalı çamaşır makinesi");
        } else if ((categoryLower.includes("kurutma") || categoryLower.includes("kurutucu")) && !categoryLower.includes("mini")) {
          warranty = allCategories.find(cat => cat.categoryName.toLowerCase() === "kurutma makinesi");
        } else if ((categoryLower.includes("çamaşır") || categoryLower.includes("camasir")) && !categoryLower.includes("mini")) {
          warranty = allCategories.find(cat => cat.categoryName.toLowerCase() === "çamaşır makinesi");
        }
        
        // Klima kategorileri - tüm varyasyonları dahil et
        else if (categoryLower.includes("klima") || 
                 categoryLower.includes("ısıtma") || 
                 categoryLower.includes("soğutma") || 
                 categoryLower.includes("isitma") || 
                 categoryLower.includes("sogutma") || 
                 categoryLower.includes("inverter") ||
                 categoryLower.includes("split")) {
          warranty = allCategories.find(cat => cat.categoryName.toLowerCase() === "ev tipi klima");
        }
        
        // Bulaşık makinesi
        else if ((categoryLower.includes("bulaşık") || categoryLower.includes("bulasik")) && !categoryLower.includes("mini")) {
          warranty = allCategories.find(cat => cat.categoryName.toLowerCase() === "bulaşık makinesi");
        }
      }
      
      return warranty;
    } catch (error) {
      console.error("Error getting extended warranty by category:", error);
      return undefined;
    }
  }

  async createExtendedWarrantyCategory(data: { categoryName: string; twoYearPrice: number; fourYearPrice: number }): Promise<any> {
    // This would be for admin to add new categories - for now just return the data
    return data;
  }

  async updateExtendedWarrantyCategory(categoryName: string, data: { twoYearPrice: number; fourYearPrice: number }): Promise<any | null> {
    try {
      const decodedCategoryName = decodeURIComponent(categoryName);
      
      const [updatedWarranty] = await db
        .update(extendedWarrantyCategories)
        .set({
          twoYearPrice: data.twoYearPrice.toString(),
          fourYearPrice: data.fourYearPrice.toString(),
          updatedAt: new Date(),
        })
        .where(eq(extendedWarrantyCategories.categoryName, decodedCategoryName))
        .returning();
      
      if (!updatedWarranty) {
        return null;
      }
      
      // Return with proper number formatting
      return {
        categoryName: updatedWarranty.categoryName,
        twoYearPrice: parseFloat(updatedWarranty.twoYearPrice),
        fourYearPrice: parseFloat(updatedWarranty.fourYearPrice)
      };
    } catch (error) {
      console.error("Error updating extended warranty category:", error);
      return null;
    }
  }

  // Extended warranty category mappings methods
  async getWarrantyCategoryMappings(warrantyCategoryId: string): Promise<ExtendedWarrantyCategoryMapping[]> {
    try {
      return await db
        .select()
        .from(extendedWarrantyCategoryMappings)
        .where(eq(extendedWarrantyCategoryMappings.warrantyCategoryId, warrantyCategoryId));
    } catch (error) {
      console.error("Error getting warranty category mappings:", error);
      return [];
    }
  }

  async addWarrantyCategoryMapping(mapping: InsertExtendedWarrantyCategoryMapping): Promise<ExtendedWarrantyCategoryMapping> {
    const [created] = await db
      .insert(extendedWarrantyCategoryMappings)
      .values(mapping)
      .returning();
    return created;
  }

  async deleteWarrantyCategoryMapping(mappingId: string): Promise<boolean> {
    try {
      const result = await db
        .delete(extendedWarrantyCategoryMappings)
        .where(eq(extendedWarrantyCategoryMappings.id, mappingId));
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error("Error deleting warranty category mapping:", error);
      return false;
    }
  }

  async getAllProductCategories(): Promise<{ category: string; subcategories: string[] }[]> {
    try {
      // Mevcut ürünlerden kategoriler ve alt kategorileri çek
      const result = await db.select({
        category: products.category,
        subcategory: products.subcategory
      }).from(products);
      
      const categoryMap = new Map<string, Set<string>>();
      
      result.forEach((item) => {
        if (!categoryMap.has(item.category)) {
          categoryMap.set(item.category, new Set());
        }
        if (item.subcategory) {
          categoryMap.get(item.category)!.add(item.subcategory);
        }
      });

      return Array.from(categoryMap.entries()).map(([category, subcategoriesSet]) => ({
        category,
        subcategories: Array.from(subcategoriesSet).sort()
      }));
    } catch (error) {
      console.error("Error getting product categories:", error);
      return [];
    }
  }

  // SEO Settings methods implementation
  async getSeoSettings(pageType?: string, pageId?: string): Promise<SeoSettings[]> {
    try {
      let whereConditions: any[] = [];
      
      if (pageType) {
        whereConditions.push(eq(seoSettings.pageType, pageType));
      }
      
      const query = whereConditions.length > 0 
        ? db.select().from(seoSettings).where(and(...whereConditions))
        : db.select().from(seoSettings);
      
      const results = await query;
      
      if (pageId) {
        return results.filter(setting => setting.pageId === pageId || !setting.pageId);
      }
      
      return results;
    } catch (error) {
      console.error("Error getting SEO settings:", error);
      return [];
    }
  }

  async getSeoSetting(id: string): Promise<SeoSettings | undefined> {
    try {
      const [result] = await db
        .select()
        .from(seoSettings)
        .where(eq(seoSettings.id, id));
      return result;
    } catch (error) {
      console.error("Error getting SEO setting:", error);
      return undefined;
    }
  }

  async createSeoSetting(seoSetting: InsertSeoSettings): Promise<SeoSettings> {
    const [created] = await db
      .insert(seoSettings)
      .values(seoSetting)
      .returning();
    return created;
  }

  async updateSeoSetting(id: string, updates: Partial<SeoSettings>): Promise<SeoSettings | undefined> {
    try {
      const [updated] = await db
        .update(seoSettings)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(seoSettings.id, id))
        .returning();
      return updated;
    } catch (error) {
      console.error("Error updating SEO setting:", error);
      return undefined;
    }
  }

  async deleteSeoSetting(id: string): Promise<boolean> {
    try {
      const result = await db
        .delete(seoSettings)
        .where(eq(seoSettings.id, id));
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error("Error deleting SEO setting:", error);
      return false;
    }
  }

  // Auto SEO Generation methods implementation
  async generateProductSeo(product: Product): Promise<SeoSettings> {
    // Mevcut SEO ayarını kontrol et
    const existingSeo = await db
      .select()
      .from(seoSettings)
      .where(
        and(
          eq(seoSettings.pageType, 'product'),
          eq(seoSettings.pageId, product.id)
        )
      )
      .limit(1);

    const categoryText = product.subcategory ? `${product.category} - ${product.subcategory}` : product.category;
    const brandText = product.brand ? ` ${product.brand}` : '';
    
    const seoData = {
      pageType: 'product' as const,
      pageId: product.id,
      title: `${product.name}${brandText} - ${categoryText} | Ender Outlet`,
      description: `${product.name} ürününü Ender Outlet'ta uygun fiyatlarla satın alın. ${product.description ? product.description.substring(0, 120) + '...' : 'Kaliteli ürünler, güvenli alışveriş, hızlı teslimat.'} Uzatılmış garanti seçenekleri mevcut.`,
      keywords: `${product.name.toLowerCase()}, ${product.category.toLowerCase()}, ${product.subcategory?.toLowerCase() || ''}, ${product.brand?.toLowerCase() || ''}, beyaz eşya, ev aletleri, ender outlet`.replace(/,\s*,/g, ',').replace(/,\s*$/, ''),
      ogTitle: `${product.name} - Ender Outlet`,
      ogDescription: `${product.name} ürününü güvenle satın alın. En uygun fiyat garantisi ile.`,
      ogImage: product.image || '',
      canonicalUrl: `https://enderoutlet.com/products/${product.id}`,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Eğer mevcut SEO varsa güncelle, yoksa oluştur
    if (existingSeo.length > 0) {
      const [updated] = await db
        .update(seoSettings)
        .set({ ...seoData, updatedAt: new Date() })
        .where(eq(seoSettings.id, existingSeo[0].id))
        .returning();
      return updated;
    } else {
      return await this.createSeoSetting(seoData);
    }
  }

  async generateCategorySeo(categoryName: string, subcategory?: string): Promise<SeoSettings> {
    const categoryText = subcategory ? `${categoryName} - ${subcategory}` : categoryName;
    const pageId = subcategory ? `${categoryName}-${subcategory}` : categoryName;
    const normalizedPageId = pageId.toLowerCase().replace(/\s+/g, '-');

    // Mevcut SEO ayarını kontrol et
    const existingSeo = await db
      .select()
      .from(seoSettings)
      .where(
        and(
          eq(seoSettings.pageType, 'category'),
          eq(seoSettings.pageId, normalizedPageId)
        )
      )
      .limit(1);
    
    const seoData = {
      pageType: 'category' as const,
      pageId: normalizedPageId,
      title: `${categoryText} Ürünleri ve Modelleri | Ender Outlet`,
      description: `${categoryText} kategorisinde en kaliteli ürünleri keşfedin. Ender Outlet'ta ${categoryText.toLowerCase()} ürünlerini uygun fiyatlarla bulabilir, güvenle alışveriş yapabilirsiniz. Ücretsiz kargo fırsatları ve uzatılmış garanti seçenekleri.`,
      keywords: `${categoryName.toLowerCase()}, ${subcategory?.toLowerCase() || ''}, beyaz eşya, ev aletleri, ${categoryName.toLowerCase()} modelleri, ender outlet`.replace(/,\s*,/g, ',').replace(/,\s*$/, ''),
      ogTitle: `${categoryText} - Ender Outlet`,
      ogDescription: `En kaliteli ${categoryText.toLowerCase()} ürünlerini keşfedin`,
      ogImage: `https://enderoutlet.com/assets/categories/${normalizedPageId}.jpg`,
      canonicalUrl: `https://enderoutlet.com/products?category=${encodeURIComponent(categoryName)}${subcategory ? `&subcategory=${encodeURIComponent(subcategory)}` : ''}`,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Eğer mevcut SEO varsa güncelle, yoksa oluştur
    if (existingSeo.length > 0) {
      const [updated] = await db
        .update(seoSettings)
        .set({ ...seoData, updatedAt: new Date() })
        .where(eq(seoSettings.id, existingSeo[0].id))
        .returning();
      return updated;
    } else {
      return await this.createSeoSetting(seoData);
    }
  }

  async generateBlogPostSeo(blogPost: BlogPost, category?: BlogCategory): Promise<SeoSettings> {
    const categoryText = category ? ` - ${category.name}` : '';
    const keywords = [
      blogPost.title.toLowerCase().split(' ').slice(0, 3).join(' '),
      category?.name.toLowerCase() || '',
      'blog',
      'beyaz eşya rehberi',
      'ev aletleri'
    ].filter(Boolean).join(', ');

    const seoData = {
      pageType: 'blog_post' as const,
      pageId: blogPost.id,
      title: blogPost.metaTitle || `${blogPost.title}${categoryText} | Ender Outlet Blog`,
      description: blogPost.metaDescription || blogPost.excerpt || `${blogPost.title} hakkında detaylı bilgi ve öneriler Ender Outlet blogunda. Beyaz eşya ve ev aletleri konularında faydalı içerikler.`,
      keywords: blogPost.metaKeywords || keywords,
      ogTitle: blogPost.title,
      ogDescription: blogPost.excerpt || `${blogPost.title} hakkında detaylı bilgi`,
      ogImage: blogPost.featuredImage || 'https://enderoutlet.com/assets/blog-default.jpg',
      canonicalUrl: `https://enderoutlet.com/blog/${blogPost.slug}`,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return await this.createSeoSetting(seoData);
  }

  // Blog Category methods implementation
  async getBlogCategories(): Promise<BlogCategory[]> {
    try {
      return await db
        .select()
        .from(blogCategories)
        .where(eq(blogCategories.isActive, true))
        .orderBy(blogCategories.name);
    } catch (error) {
      console.error("Error getting blog categories:", error);
      return [];
    }
  }

  async getBlogCategory(id: string): Promise<BlogCategory | undefined> {
    try {
      const [result] = await db
        .select()
        .from(blogCategories)
        .where(eq(blogCategories.id, id));
      return result;
    } catch (error) {
      console.error("Error getting blog category:", error);
      return undefined;
    }
  }

  async getBlogCategoryBySlug(slug: string): Promise<BlogCategory | undefined> {
    try {
      const [result] = await db
        .select()
        .from(blogCategories)
        .where(eq(blogCategories.slug, slug));
      return result;
    } catch (error) {
      console.error("Error getting blog category by slug:", error);
      return undefined;
    }
  }

  async createBlogCategory(category: InsertBlogCategory): Promise<BlogCategory> {
    const [created] = await db
      .insert(blogCategories)
      .values(category)
      .returning();
    return created;
  }

  async updateBlogCategory(id: string, updates: Partial<BlogCategory>): Promise<BlogCategory | undefined> {
    try {
      const [updated] = await db
        .update(blogCategories)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(blogCategories.id, id))
        .returning();
      return updated;
    } catch (error) {
      console.error("Error updating blog category:", error);
      return undefined;
    }
  }

  async deleteBlogCategory(id: string): Promise<boolean> {
    try {
      const result = await db
        .delete(blogCategories)
        .where(eq(blogCategories.id, id));
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error("Error deleting blog category:", error);
      return false;
    }
  }

  // Blog Post methods implementation
  async getBlogPosts(status?: string, categoryId?: string): Promise<(BlogPost & { category?: BlogCategory })[]> {
    try {
      let whereConditions: any[] = [eq(blogPosts.isActive, true)];
      
      if (status) {
        whereConditions.push(eq(blogPosts.status, status));
      }
      
      if (categoryId) {
        whereConditions.push(eq(blogPosts.categoryId, categoryId));
      }

      const query = db
        .select({
          // Blog post fields
          id: blogPosts.id,
          title: blogPosts.title,
          slug: blogPosts.slug,
          excerpt: blogPosts.excerpt,
          content: blogPosts.content,
          featuredImage: blogPosts.featuredImage,
          categoryId: blogPosts.categoryId,
          authorId: blogPosts.authorId,
          status: blogPosts.status,
          publishedAt: blogPosts.publishedAt,
          viewCount: blogPosts.viewCount,
          isActive: blogPosts.isActive,
          metaTitle: blogPosts.metaTitle,
          metaDescription: blogPosts.metaDescription,
          metaKeywords: blogPosts.metaKeywords,
          createdAt: blogPosts.createdAt,
          updatedAt: blogPosts.updatedAt,
          // Category fields
          category: blogCategories,
        })
        .from(blogPosts)
        .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
        .where(and(...whereConditions));

      const results = await query.orderBy(desc(blogPosts.createdAt));

      return results.map(row => ({
        id: row.id,
        title: row.title,
        slug: row.slug,
        excerpt: row.excerpt,
        content: row.content,
        featuredImage: row.featuredImage,
        categoryId: row.categoryId,
        authorId: row.authorId,
        status: row.status,
        publishedAt: row.publishedAt,
        viewCount: row.viewCount,
        isActive: row.isActive,
        metaTitle: row.metaTitle,
        metaDescription: row.metaDescription,
        metaKeywords: row.metaKeywords,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        category: row.category || undefined,
      }));
    } catch (error) {
      console.error("Error getting blog posts:", error);
      return [];
    }
  }

  async getBlogPost(id: string): Promise<(BlogPost & { category?: BlogCategory }) | undefined> {
    try {
      const results = await db
        .select({
          // Blog post fields
          id: blogPosts.id,
          title: blogPosts.title,
          slug: blogPosts.slug,
          excerpt: blogPosts.excerpt,
          content: blogPosts.content,
          featuredImage: blogPosts.featuredImage,
          categoryId: blogPosts.categoryId,
          authorId: blogPosts.authorId,
          status: blogPosts.status,
          publishedAt: blogPosts.publishedAt,
          viewCount: blogPosts.viewCount,
          isActive: blogPosts.isActive,
          metaTitle: blogPosts.metaTitle,
          metaDescription: blogPosts.metaDescription,
          metaKeywords: blogPosts.metaKeywords,
          createdAt: blogPosts.createdAt,
          updatedAt: blogPosts.updatedAt,
          // Category fields
          category: blogCategories,
        })
        .from(blogPosts)
        .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
        .where(eq(blogPosts.id, id));

      if (!results.length) return undefined;

      const row = results[0];
      return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        excerpt: row.excerpt,
        content: row.content,
        featuredImage: row.featuredImage,
        categoryId: row.categoryId,
        authorId: row.authorId,
        status: row.status,
        publishedAt: row.publishedAt,
        viewCount: row.viewCount,
        isActive: row.isActive,
        metaTitle: row.metaTitle,
        metaDescription: row.metaDescription,
        metaKeywords: row.metaKeywords,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        category: row.category || undefined,
      };
    } catch (error) {
      console.error("Error getting blog post:", error);
      return undefined;
    }
  }

  async getBlogPostBySlug(slug: string): Promise<(BlogPost & { category?: BlogCategory }) | undefined> {
    try {
      const results = await db
        .select({
          // Blog post fields
          id: blogPosts.id,
          title: blogPosts.title,
          slug: blogPosts.slug,
          excerpt: blogPosts.excerpt,
          content: blogPosts.content,
          featuredImage: blogPosts.featuredImage,
          categoryId: blogPosts.categoryId,
          authorId: blogPosts.authorId,
          status: blogPosts.status,
          publishedAt: blogPosts.publishedAt,
          viewCount: blogPosts.viewCount,
          isActive: blogPosts.isActive,
          metaTitle: blogPosts.metaTitle,
          metaDescription: blogPosts.metaDescription,
          metaKeywords: blogPosts.metaKeywords,
          createdAt: blogPosts.createdAt,
          updatedAt: blogPosts.updatedAt,
          // Category fields
          category: blogCategories,
        })
        .from(blogPosts)
        .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
        .where(eq(blogPosts.slug, slug));

      if (!results.length) return undefined;

      const row = results[0];
      return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        excerpt: row.excerpt,
        content: row.content,
        featuredImage: row.featuredImage,
        categoryId: row.categoryId,
        authorId: row.authorId,
        status: row.status,
        publishedAt: row.publishedAt,
        viewCount: row.viewCount,
        isActive: row.isActive,
        metaTitle: row.metaTitle,
        metaDescription: row.metaDescription,
        metaKeywords: row.metaKeywords,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        category: row.category || undefined,
      };
    } catch (error) {
      console.error("Error getting blog post by slug:", error);
      return undefined;
    }
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [created] = await db
      .insert(blogPosts)
      .values(post)
      .returning();
    return created;
  }

  async updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<BlogPost | undefined> {
    try {
      const [updated] = await db
        .update(blogPosts)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(blogPosts.id, id))
        .returning();
      return updated;
    } catch (error) {
      console.error("Error updating blog post:", error);
      return undefined;
    }
  }

  async deleteBlogPost(id: string): Promise<boolean> {
    try {
      const result = await db
        .delete(blogPosts)
        .where(eq(blogPosts.id, id));
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error("Error deleting blog post:", error);
      return false;
    }
  }

  async publishBlogPost(id: string): Promise<BlogPost | undefined> {
    try {
      const [updated] = await db
        .update(blogPosts)
        .set({ 
          status: "published",
          publishedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(blogPosts.id, id))
        .returning();
      return updated;
    } catch (error) {
      console.error("Error publishing blog post:", error);
      return undefined;
    }
  }

  async incrementViewCount(id: string): Promise<BlogPost | undefined> {
    try {
      const [updated] = await db
        .update(blogPosts)
        .set({ viewCount: sql`${blogPosts.viewCount} + 1` })
        .where(eq(blogPosts.id, id))
        .returning();
      return updated;
    } catch (error) {
      console.error("Error incrementing view count:", error);
      return undefined;
    }
  }

  // Blog Tag methods implementation
  async getBlogTags(): Promise<BlogTag[]> {
    try {
      return await db
        .select()
        .from(blogTags)
        .orderBy(blogTags.name);
    } catch (error) {
      console.error("Error getting blog tags:", error);
      return [];
    }
  }

  async getBlogTag(id: string): Promise<BlogTag | undefined> {
    try {
      const [result] = await db
        .select()
        .from(blogTags)
        .where(eq(blogTags.id, id));
      return result;
    } catch (error) {
      console.error("Error getting blog tag:", error);
      return undefined;
    }
  }

  async getBlogTagBySlug(slug: string): Promise<BlogTag | undefined> {
    try {
      const [result] = await db
        .select()
        .from(blogTags)
        .where(eq(blogTags.slug, slug));
      return result;
    } catch (error) {
      console.error("Error getting blog tag by slug:", error);
      return undefined;
    }
  }

  async createBlogTag(tag: InsertBlogTag): Promise<BlogTag> {
    const [created] = await db
      .insert(blogTags)
      .values(tag)
      .returning();
    return created;
  }

  async updateBlogTag(id: string, updates: Partial<BlogTag>): Promise<BlogTag | undefined> {
    try {
      const [updated] = await db
        .update(blogTags)
        .set(updates)
        .where(eq(blogTags.id, id))
        .returning();
      return updated;
    } catch (error) {
      console.error("Error updating blog tag:", error);
      return undefined;
    }
  }

  async deleteBlogTag(id: string): Promise<boolean> {
    try {
      const result = await db
        .delete(blogTags)
        .where(eq(blogTags.id, id));
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error("Error deleting blog tag:", error);
      return false;
    }
  }

  // Blog Post Tags methods implementation
  async getPostTags(postId: string): Promise<(BlogPostTag & { tag: BlogTag })[]> {
    try {
      const results = await db
        .select({
          id: blogPostTags.id,
          postId: blogPostTags.postId,
          tagId: blogPostTags.tagId,
          createdAt: blogPostTags.createdAt,
          tag: blogTags,
        })
        .from(blogPostTags)
        .innerJoin(blogTags, eq(blogPostTags.tagId, blogTags.id))
        .where(eq(blogPostTags.postId, postId));

      return results.map(row => ({
        id: row.id,
        postId: row.postId,
        tagId: row.tagId,
        createdAt: row.createdAt,
        tag: row.tag,
      }));
    } catch (error) {
      console.error("Error getting post tags:", error);
      return [];
    }
  }

  async addTagToPost(postTag: InsertBlogPostTag): Promise<BlogPostTag> {
    const [created] = await db
      .insert(blogPostTags)
      .values(postTag)
      .returning();
    return created;
  }

  async removeTagFromPost(postId: string, tagId: string): Promise<boolean> {
    try {
      const result = await db
        .delete(blogPostTags)
        .where(
          and(
            eq(blogPostTags.postId, postId),
            eq(blogPostTags.tagId, tagId)
          )
        );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error("Error removing tag from post:", error);
      return false;
    }
  }

  // Blog Slider methods implementation
  async getBlogSliders(): Promise<BlogSlider[]> {
    try {
      return await db
        .select()
        .from(blogSliders)
        .orderBy(blogSliders.order, blogSliders.createdAt);
    } catch (error) {
      console.error("Error getting blog sliders:", error);
      return [];
    }
  }

  async getBlogSlider(id: string): Promise<BlogSlider | undefined> {
    try {
      const [result] = await db
        .select()
        .from(blogSliders)
        .where(eq(blogSliders.id, id));
      return result;
    } catch (error) {
      console.error("Error getting blog slider:", error);
      return undefined;
    }
  }

  async createBlogSlider(slider: InsertBlogSlider): Promise<BlogSlider> {
    const [created] = await db
      .insert(blogSliders)
      .values(slider)
      .returning();
    return created;
  }

  async updateBlogSlider(id: string, updates: Partial<BlogSlider>): Promise<BlogSlider | undefined> {
    try {
      const [updated] = await db
        .update(blogSliders)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(blogSliders.id, id))
        .returning();
      return updated;
    } catch (error) {
      console.error("Error updating blog slider:", error);
      return undefined;
    }
  }

  async deleteBlogSlider(id: string): Promise<boolean> {
    try {
      const result = await db
        .delete(blogSliders)
        .where(eq(blogSliders.id, id));
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error("Error deleting blog slider:", error);
      return false;
    }
  }

  async toggleBlogSlider(id: string, isActive: boolean): Promise<BlogSlider | undefined> {
    try {
      const [updated] = await db
        .update(blogSliders)
        .set({ isActive, updatedAt: new Date() })
        .where(eq(blogSliders.id, id))
        .returning();
      return updated;
    } catch (error) {
      console.error("Error toggling blog slider:", error);
      return undefined;
    }
  }

  // Footer Links methods implementation
  async getFooterLinks(): Promise<FooterLink[]> {
    try {
      const result = await db
        .select()
        .from(footerLinks)
        .where(eq(footerLinks.isActive, true))
        .orderBy(footerLinks.sectionOrder, footerLinks.sortOrder);
      return result;
    } catch (error) {
      console.error("Error getting footer links:", error);
      return [];
    }
  }

  async getFooterLink(id: string): Promise<FooterLink | undefined> {
    try {
      const [result] = await db
        .select()
        .from(footerLinks)
        .where(eq(footerLinks.id, id));
      return result;
    } catch (error) {
      console.error("Error getting footer link:", error);
      return undefined;
    }
  }

  async createFooterLink(link: InsertFooterLink): Promise<FooterLink> {
    const [created] = await db
      .insert(footerLinks)
      .values(link)
      .returning();
    return created;
  }

  async updateFooterLink(id: string, updates: Partial<FooterLink>): Promise<FooterLink | undefined> {
    try {
      const [updated] = await db
        .update(footerLinks)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(footerLinks.id, id))
        .returning();
      return updated;
    } catch (error) {
      console.error("Error updating footer link:", error);
      return undefined;
    }
  }

  async deleteFooterLink(id: string): Promise<boolean> {
    try {
      const result = await db
        .delete(footerLinks)
        .where(eq(footerLinks.id, id));
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error("Error deleting footer link:", error);
      return false;
    }
  }

  // Returns methods
  async getUserReturns(userId: string): Promise<any[]> {
    try {
      const userReturns = await db
        .select({
          id: returns.id,
          returnType: returns.returnType,
          returnReason: returns.returnReason,
          status: returns.status,
          adminNotes: returns.adminNotes,
          requestDate: returns.requestDate,
          responseDate: returns.responseDate,
          order: {
            id: orders.id,
            orderNumber: orders.orderNumber,
            totalAmount: orders.totalAmount,
            createdAt: orders.createdAt,
            paymentMethod: orders.paymentMethod,
            installments: orders.installments,
          },
          orderItem: {
            id: orderItems.id,
            quantity: orderItems.quantity,
            price: orderItems.price,
            warranty: orderItems.warranty,
          },
          product: {
            id: products.id,
            name: products.name,
            image: products.image,
            price: products.price,
          },
        })
        .from(returns)
        .leftJoin(orders, eq(returns.orderId, orders.id))
        .leftJoin(orderItems, eq(returns.orderItemId, orderItems.id))
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(returns.userId, userId))
        .orderBy(desc(returns.requestDate));

      return userReturns;
    } catch (error) {
      console.error("Error getting user returns:", error);
      return [];
    }
  }

  async getReturn(returnId: string): Promise<Return | undefined> {
    try {
      const [returnData] = await db
        .select()
        .from(returns)
        .where(eq(returns.id, returnId))
        .limit(1);
      return returnData;
    } catch (error) {
      console.error("Error getting return:", error);
      return undefined;
    }
  }

  async createReturn(returnData: any): Promise<any> {
    try {
      const [newReturn] = await db
        .insert(returns)
        .values(returnData)
        .returning();
      return newReturn;
    } catch (error) {
      console.error("Error creating return:", error);
      throw error;
    }
  }

  async getAllReturns(): Promise<any[]> {
    try {
      const allReturns = await db
        .select({
          id: returns.id,
          returnType: returns.returnType,
          returnReason: returns.returnReason,
          status: returns.status,
          adminNotes: returns.adminNotes,
          requestDate: returns.requestDate,
          responseDate: returns.responseDate,
          user: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            phone: users.phone,
          },
          order: {
            id: orders.id,
            orderNumber: orders.orderNumber,
            totalAmount: orders.totalAmount,
            createdAt: orders.createdAt,
            paymentMethod: orders.paymentMethod,
            installments: orders.installments,
          },
          orderItem: {
            id: orderItems.id,
            quantity: orderItems.quantity,
            price: orderItems.price,
            warranty: orderItems.warranty,
          },
          product: {
            id: products.id,
            name: products.name,
            image: products.image,
            price: products.price,
          },
        })
        .from(returns)
        .leftJoin(users, eq(returns.userId, users.id))
        .leftJoin(orders, eq(returns.orderId, orders.id))
        .leftJoin(orderItems, eq(returns.orderItemId, orderItems.id))
        .leftJoin(products, eq(orderItems.productId, products.id))
        .orderBy(desc(returns.requestDate));

      return allReturns;
    } catch (error) {
      console.error("Error getting all returns:", error);
      return [];
    }
  }

  async updateReturnStatus(id: string, status: string, adminNotes?: string): Promise<any> {
    try {
      const updateData: any = {
        status,
        responseDate: new Date(),
        updatedAt: new Date(),
      };

      if (adminNotes) {
        updateData.adminNotes = adminNotes;
      }

      const [updated] = await db
        .update(returns)
        .set(updateData)
        .where(eq(returns.id, id))
        .returning();

      return updated;
    } catch (error) {
      console.error("Error updating return status:", error);
      return undefined;
    }
  }

  async getReturnByOrderItem(orderItemId: string): Promise<any> {
    try {
      const [existingReturn] = await db
        .select()
        .from(returns)
        .where(eq(returns.orderItemId, orderItemId));

      return existingReturn;
    } catch (error) {
      console.error("Error getting return by order item:", error);
      return undefined;
    }
  }

  // Statistics methods implementation
  async recordProductView(productId: string, userId?: string, ipAddress?: string, userAgent?: string, referrer?: string): Promise<ProductView> {
    const [view] = await db
      .insert(productViews)
      .values({
        productId,
        userId,
        ipAddress,
        userAgent,
        referrer,
      })
      .returning();
    return view;
  }

  async recordSliderClick(sliderId: string, sliderType: string, userId?: string, ipAddress?: string, userAgent?: string): Promise<SliderClick> {
    const [click] = await db
      .insert(sliderClicks)
      .values({
        sliderId,
        sliderType,
        userId,
        ipAddress,
        userAgent,
      })
      .returning();
    return click;
  }

  async getSalesStatistics(period: 'daily' | 'weekly' | 'monthly' | 'yearly', startDate?: Date, endDate?: Date): Promise<any> {
    try {
      const now = new Date();
      let start = startDate;
      let end = endDate || now;

      if (!start) {
        switch (period) {
          case 'daily':
            start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'weekly':
            const dayOfWeek = now.getDay();
            start = new Date(now.getTime() - (dayOfWeek * 24 * 60 * 60 * 1000));
            start.setHours(0, 0, 0, 0);
            break;
          case 'monthly':
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case 'yearly':
            start = new Date(now.getFullYear(), 0, 1);
            break;
        }
      }

      const salesData = await db
        .select({
          date: sql`DATE(${orders.createdAt})`,
          revenue: sql`SUM(CAST(${orders.totalAmount} AS DECIMAL))`,
          orderCount: sql`COUNT(*)`,
        })
        .from(orders)
        .where(and(
          gte(orders.createdAt, start),
          lte(orders.createdAt, end)
        ))
        .groupBy(sql`DATE(${orders.createdAt})`)
        .orderBy(sql`DATE(${orders.createdAt})`);

      return salesData;
    } catch (error) {
      console.error("Error getting sales statistics:", error);
      return [];
    }
  }

  async getUserStatistics(): Promise<{
    totalUsers: number;
    usersWithItemsInCart: number;
    newUsersToday: number;
    newUsersThisWeek: number;
    newUsersThisMonth: number;
  }> {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(now.getTime() - (now.getDay() * 24 * 60 * 60 * 1000));
      thisWeek.setHours(0, 0, 0, 0);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [totalUsersResult] = await db
        .select({ count: sql`COUNT(*)` })
        .from(users);

      const [usersWithCartResult] = await db
        .select({ count: sql`COUNT(DISTINCT ${cartItems.userId})` })
        .from(cartItems);

      const [newUsersTodayResult] = await db
        .select({ count: sql`COUNT(*)` })
        .from(users)
        .where(gte(users.createdAt, today));

      const [newUsersThisWeekResult] = await db
        .select({ count: sql`COUNT(*)` })
        .from(users)
        .where(gte(users.createdAt, thisWeek));

      const [newUsersThisMonthResult] = await db
        .select({ count: sql`COUNT(*)` })
        .from(users)
        .where(gte(users.createdAt, thisMonth));

      return {
        totalUsers: Number(totalUsersResult.count) || 0,
        usersWithItemsInCart: Number(usersWithCartResult.count) || 0,
        newUsersToday: Number(newUsersTodayResult.count) || 0,
        newUsersThisWeek: Number(newUsersThisWeekResult.count) || 0,
        newUsersThisMonth: Number(newUsersThisMonthResult.count) || 0,
      };
    } catch (error) {
      console.error("Error getting user statistics:", error);
      return {
        totalUsers: 0,
        usersWithItemsInCart: 0,
        newUsersToday: 0,
        newUsersThisWeek: 0,
        newUsersThisMonth: 0,
      };
    }
  }

  async getProductViewStatistics(limit: number = 10): Promise<{
    productId: string;
    productName: string;
    viewCount: number;
  }[]> {
    try {
      const stats = await db
        .select({
          productId: productViews.productId,
          productName: products.name,
          viewCount: sql`COUNT(*)`,
        })
        .from(productViews)
        .leftJoin(products, eq(productViews.productId, products.id))
        .groupBy(productViews.productId, products.name)
        .orderBy(desc(sql`COUNT(*)`))
        .limit(limit);

      return stats.map(stat => ({
        productId: stat.productId,
        productName: stat.productName || 'Bilinmeyen Ürün',
        viewCount: Number(stat.viewCount),
      }));
    } catch (error) {
      console.error("Error getting product view statistics:", error);
      return [];
    }
  }

  async getSliderClickStatistics(limit: number = 10): Promise<{
    sliderId: string;
    sliderTitle: string;
    clickCount: number;
  }[]> {
    try {
      const stats = await db
        .select({
          sliderId: sliderClicks.sliderId,
          sliderTitle: sliders.title,
          clickCount: sql`COUNT(*)`,
        })
        .from(sliderClicks)
        .leftJoin(sliders, eq(sliderClicks.sliderId, sliders.id))
        .groupBy(sliderClicks.sliderId, sliders.title)
        .orderBy(desc(sql`COUNT(*)`))
        .limit(limit);

      return stats.map(stat => ({
        sliderId: stat.sliderId,
        sliderTitle: stat.sliderTitle || 'Bilinmeyen Slider',
        clickCount: Number(stat.clickCount),
      }));
    } catch (error) {
      console.error("Error getting slider click statistics:", error);
      return [];
    }
  }

  async getOrderStatistics(): Promise<{
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
  }> {
    try {
      const [totalOrdersResult] = await db
        .select({ count: sql`COUNT(*)` })
        .from(orders);

      const [pendingOrdersResult] = await db
        .select({ count: sql`COUNT(*)` })
        .from(orders)
        .where(eq(orders.status, "pending"));

      const [completedOrdersResult] = await db
        .select({ count: sql`COUNT(*)` })
        .from(orders)
        .where(eq(orders.status, "delivered"));

      const [revenueResult] = await db
        .select({ 
          total: sql`SUM(CAST(${orders.totalAmount} AS DECIMAL))`,
          average: sql`AVG(CAST(${orders.totalAmount} AS DECIMAL))`
        })
        .from(orders)
        .where(eq(orders.paymentStatus, "completed"));

      return {
        totalOrders: Number(totalOrdersResult.count) || 0,
        pendingOrders: Number(pendingOrdersResult.count) || 0,
        completedOrders: Number(completedOrdersResult.count) || 0,
        totalRevenue: Number(revenueResult.total) || 0,
        averageOrderValue: Number(revenueResult.average) || 0,
      };
    } catch (error) {
      console.error("Error getting order statistics:", error);
      return {
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
      };
    }
  }

  // Popular Searches methods
  async getPopularSearches(): Promise<PopularSearch[]> {
    try {
      return await db.select().from(popularSearches).orderBy(desc(popularSearches.displayOrder), desc(popularSearches.clickCount));
    } catch (error) {
      console.error("Error getting popular searches:", error);
      return [];
    }
  }

  async createPopularSearch(search: InsertPopularSearch): Promise<PopularSearch> {
    try {
      const [newSearch] = await db.insert(popularSearches).values(search).returning();
      return newSearch;
    } catch (error) {
      console.error("Error creating popular search:", error);
      throw error;
    }
  }

  async updatePopularSearch(id: string, updates: Partial<PopularSearch>): Promise<PopularSearch | undefined> {
    try {
      const [updatedSearch] = await db.update(popularSearches)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(popularSearches.id, id))
        .returning();
      return updatedSearch;
    } catch (error) {
      console.error("Error updating popular search:", error);
      return undefined;
    }
  }

  async deletePopularSearch(id: string): Promise<boolean> {
    try {
      const result = await db.delete(popularSearches).where(eq(popularSearches.id, id));
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error("Error deleting popular search:", error);
      return false;
    }
  }

  async incrementPopularSearchClick(id: string): Promise<boolean> {
    try {
      await db.update(popularSearches)
        .set({ 
          clickCount: sql`${popularSearches.clickCount} + 1`,
          updatedAt: new Date()
        })
        .where(eq(popularSearches.id, id));
      return true;
    } catch (error) {
      console.error("Error incrementing popular search click:", error);
      return false;
    }
  }

  // Category Banners methods
  async getCategoryBanners(): Promise<CategoryBanner[]> {
    try {
      return await db.select().from(categoryBanners).orderBy(desc(categoryBanners.createdAt));
    } catch (error) {
      console.error("Error getting category banners:", error);
      return [];
    }
  }

  async getCategoryBannerByName(categoryName: string): Promise<CategoryBanner | undefined> {
    try {
      const [banner] = await db.select()
        .from(categoryBanners)
        .where(and(
          eq(categoryBanners.categoryName, categoryName),
          eq(categoryBanners.isActive, true)
        ));
      return banner;
    } catch (error) {
      console.error("Error getting category banner by name:", error);
      return undefined;
    }
  }

  async createCategoryBanner(banner: InsertCategoryBanner): Promise<CategoryBanner> {
    try {
      const [newBanner] = await db.insert(categoryBanners).values(banner).returning();
      return newBanner;
    } catch (error) {
      console.error("Error creating category banner:", error);
      throw error;
    }
  }

  async updateCategoryBanner(id: string, updates: Partial<CategoryBanner>): Promise<CategoryBanner | undefined> {
    try {
      const [updatedBanner] = await db.update(categoryBanners)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(categoryBanners.id, id))
        .returning();
      return updatedBanner;
    } catch (error) {
      console.error("Error updating category banner:", error);
      return undefined;
    }
  }

  async deleteCategoryBanner(id: string): Promise<boolean> {
    try {
      const result = await db.delete(categoryBanners).where(eq(categoryBanners.id, id));
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error("Error deleting category banner:", error);
      return false;
    }
  }
}

export const storage = new DatabaseStorage();