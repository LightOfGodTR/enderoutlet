import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/hooks/use-cart";
import { FavoritesProvider } from "@/hooks/use-favorites";
import { AuthProvider } from "@/hooks/use-auth";
import { useEffect, Suspense, lazy } from "react";

// Lazy load components for better performance and security
const Home = lazy(() => import("@/pages/home"));
const Products = lazy(() => import("@/pages/products"));
const CategoryPage = lazy(() => import("@/pages/category"));
const Corporate = lazy(() => import("@/pages/corporate"));
const Privacy = lazy(() => import("@/pages/privacy"));
const DistanceSelling = lazy(() => import("@/pages/distance-selling"));
const ReturnPolicy = lazy(() => import("@/pages/return-policy"));
const Terms = lazy(() => import("@/pages/terms"));
const Cookies = lazy(() => import("@/pages/cookies"));
const Contact = lazy(() => import("@/pages/contact"));
const Campaigns = lazy(() => import("@/pages/campaigns"));
const LoginPage = lazy(() => import("@/pages/login"));
const RegisterPage = lazy(() => import("@/pages/register"));
const ForgotPasswordPage = lazy(() => import("@/pages/forgot-password"));
const ResetPasswordPage = lazy(() => import("@/pages/reset-password"));
const AccountPage = lazy(() => import("@/pages/account"));
const EditProfilePage = lazy(() => import("@/pages/edit-profile"));
const ProductDetailPage = lazy(() => import("@/pages/product-detail"));
const CartPage = lazy(() => import("@/pages/cart"));
const CheckoutPage = lazy(() => import("@/pages/checkout"));
const FavoritesPage = lazy(() => import("@/pages/favorites"));
const OrdersPage = lazy(() => import("@/pages/orders"));
const AdminPanel = lazy(() => import("@/pages/admin"));
const TCKimlikPage = lazy(() => import("@/pages/tc-kimlik"));
const AddressesPage = lazy(() => import("@/pages/addresses"));
const OrderConfirmationPage = lazy(() => import("@/pages/order-confirmation"));
const SupportTicketCreate = lazy(() => import("@/pages/support-ticket-create"));
const MySupportTickets = lazy(() => import("@/pages/my-support-tickets"));
const SupportTicketDetail = lazy(() => import("@/pages/support-ticket-detail"));
const BlogPage = lazy(() => import("@/pages/blog"));
const BlogDetailPage = lazy(() => import("@/pages/blog-detail"));
const FAQPage = lazy(() => import("@/pages/faq"));
const ReturnsPage = lazy(() => import("@/pages/returns"));
const VerifyEmailPage = lazy(() => import("@/pages/verify-email"));
const CommissionRatesPage = lazy(() => import("@/pages/commission-rates"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Loading component for better UX
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" aria-label="Yükleniyor..."></div>
  </div>
);

function Router() {
  const [location] = useLocation();
  
  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/products" component={Products} />
        <Route path="/category/:category/:subcategory?" component={CategoryPage} />
        <Route path="/corporate" component={Corporate} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/gizlilik-sozlesmesi" component={Privacy} />
        <Route path="/distance-selling" component={DistanceSelling} />
        <Route path="/mesafeli-satis-sozlesmesi" component={DistanceSelling} />
        <Route path="/return-policy" component={ReturnPolicy} />
        <Route path="/iade-sozlesmesi" component={ReturnPolicy} />
        <Route path="/terms" component={Terms} />
        <Route path="/cookies" component={Cookies} />
        <Route path="/contact" component={Contact} />
        <Route path="/iletisim" component={Contact} />
        <Route path="/campaigns" component={Campaigns} />
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/forgot-password" component={ForgotPasswordPage} />
        <Route path="/sifremi-unuttum" component={ForgotPasswordPage} />
        <Route path="/reset-password" component={ResetPasswordPage} />
        <Route path="/account" component={AccountPage} />
        <Route path="/edit-profile" component={EditProfilePage} />
        <Route path="/product/:id" component={ProductDetailPage} />
        <Route path="/cart" component={CartPage} />
        <Route path="/sepet" component={CartPage} />
        <Route path="/checkout" component={CheckoutPage} />
        <Route path="/favoriler" component={FavoritesPage} />
        <Route path="/siparislerim" component={OrdersPage} />
        <Route path="/orders" component={AccountPage} />
        <Route path="/admin" component={AdminPanel} />
        <Route path="/tc-kimlik" component={TCKimlikPage} />
        <Route path="/adreslerim" component={AddressesPage} />
        <Route path="/order-confirmation" component={OrderConfirmationPage} />
        <Route path="/destek-talebi-olustur" component={SupportTicketCreate} />
        <Route path="/destek-taleplerim" component={MySupportTickets} />
        <Route path="/destek-talebi/:id" component={SupportTicketDetail} />
        <Route path="/blog" component={BlogPage} />
        <Route path="/blog/:slug" component={BlogDetailPage} />
        <Route path="/sss" component={FAQPage} />
        <Route path="/faq" component={FAQPage} />
        <Route path="/returns" component={ReturnsPage} />
        <Route path="/iadelerim" component={ReturnsPage} />
        <Route path="/verify-email" component={VerifyEmailPage} />
        <Route path="/commission-rates" component={CommissionRatesPage} />
        <Route path="/komisyon-oranlari" component={CommissionRatesPage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <Router />
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
