import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Search, ShoppingCart, Heart, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useFavorites } from "@/hooks/use-favorites";
import { useQuery } from "@tanstack/react-query";
import SearchOverlay from "./search-overlay";
import ShoppingCartPanel from "./shopping-cart";
import Logo from "./logo";
import ProductCategoriesDropdown from "./product-categories-dropdown-new";
import arcelikLogo from "@assets/Arcelik_Sade_Amblem_1000_1757679026924.png";

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const { setIsCartOpen, cartItemCount } = useCart();
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const { favoritesCount } = useFavorites();
  const [location, navigate] = useLocation();

  // Check if we're on the homepage
  const isHomePage = location === "/";

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 0);
    };

    if (isHomePage) {
      window.addEventListener('scroll', handleScroll);
      // Check initial scroll position
      handleScroll();
    } else {
      // Always show background on other pages
      setIsScrolled(true);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isHomePage]);

  // Dynamic navigation items from admin panel
  const { data: navigationItems = [] } = useQuery<Array<{id: string, label: string, path: string}>>({
    queryKey: ["/api/admin/navigation"],
  });

  // Dynamic categories from admin panel
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/admin/categories"],
  });

  const isActiveLink = (href: string) => {
    return location === href || (href !== "/" && location.startsWith(href));
  };

  return (
    <>
      <header className={`${isHomePage ? 'fixed' : 'sticky'} top-0 w-full z-[55] transition-all duration-300 ${
        isScrolled || !isHomePage || isCategoriesOpen
          ? 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm' 
          : 'bg-black/10 backdrop-blur-sm'
      }`}>
        {/* Arçelik Yetkili Satıcısı Banner */}
        <div className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-1.5 px-4 text-center text-xs font-medium">
          <div className="container mx-auto flex items-center justify-center gap-2">
            <img 
              src={arcelikLogo} 
              alt="Arçelik Logo" 
              className="w-4 h-4 object-contain filter brightness-0 invert"
            />
            <span>Arçelik Yetkili Satıcısı</span>
          </div>
        </div>
        
        <div className="container mx-auto px-4">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center h-16">
            {/* Desktop Navigation - Left Side */}
            <nav className="flex items-center space-x-8 flex-1">
              {navigationItems.map((item) => {
                if (item.label === "Ürünler") {
                  return (
                    <button
                      key={item.id}
                      onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                      className={`text-sm font-medium transition-colors hover:text-primary whitespace-nowrap drop-shadow-sm ${
                        isCategoriesOpen || isActiveLink(item.path)
                          ? "text-primary"
                          : isScrolled || !isHomePage || isCategoriesOpen ? "text-gray-700" : "text-white hover:text-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                }
                return (
                  <Link
                    key={item.id}
                    href={item.path}
                    className={`text-sm font-medium transition-colors hover:text-primary whitespace-nowrap drop-shadow-sm ${
                      isActiveLink(item.path)
                        ? "text-primary"
                        : isScrolled || !isHomePage || isCategoriesOpen ? "text-gray-700" : "text-white hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              
            </nav>

            {/* Logo - Centered */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <Link href="/" className="flex items-center">
                <Logo className={isScrolled || !isHomePage || isCategoriesOpen ? "" : "text-white drop-shadow-sm"} />
              </Link>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-2 ml-auto">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`hidden md:flex ${
                  isScrolled || !isHomePage || isCategoriesOpen ? "" : "text-white hover:text-white hover:bg-white/10 drop-shadow-sm"
                }`}
              >
                <Search className="h-5 w-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/favoriler")}
                className={`hidden md:flex relative ${
                  isScrolled || !isHomePage || isCategoriesOpen ? "" : "text-white hover:text-white hover:bg-white/10 drop-shadow-sm"
                }`}
              >
                <Heart className="h-5 w-5" />
                {favoritesCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary">
                    {favoritesCount}
                  </Badge>
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/sepet")}
                className={`relative ${
                  isScrolled || !isHomePage || isCategoriesOpen ? "" : "text-white hover:text-white hover:bg-white/10 drop-shadow-sm"
                }`}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>

              {/* User Authentication */}
              {isLoading ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className={`hidden md:flex ${
                    isScrolled || !isHomePage || isCategoriesOpen ? "" : "text-white hover:text-white hover:bg-white/10 drop-shadow-sm"
                  }`}
                  disabled
                >
                  <User className="h-5 w-5" />
                </Button>
              ) : isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`hidden md:flex ${
                        isScrolled || !isHomePage || isCategoriesOpen ? "" : "text-white hover:text-white hover:bg-white/10 drop-shadow-sm"
                      }`}
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {user.firstName?.charAt(0) || user.username?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center space-x-2 p-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {user.firstName?.charAt(0) || user.username?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">
                          {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username}
                        </p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/account")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Hesabım</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logout()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Çıkış Yap</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/login")}
                  className={`hidden md:flex ${
                    isScrolled || !isHomePage || isCategoriesOpen ? "" : "text-white hover:text-white hover:bg-white/10 drop-shadow-sm"
                  }`}
                >
                  <User className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <Logo className="text-xl" />
            </Link>
            
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
                className="p-2"
              >
                <Search className="h-5 w-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/favoriler")}
                className="relative p-2"
              >
                <Heart className="h-5 w-5" />
                {favoritesCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs bg-primary">
                    {favoritesCount}
                  </Badge>
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/sepet")}
                className="relative p-2"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs bg-primary">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>

              {/* User Icon for Mobile */}
              {isLoading ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2"
                  disabled
                >
                  <User className="h-5 w-5" />
                </Button>
              ) : isAuthenticated && user ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/account")}
                  className="p-2"
                >
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-xs">
                      {user.firstName?.charAt(0) || user.username?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/login")}
                  className="p-2"
                >
                  <User className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>

      </header>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <ShoppingCartPanel />
      <ProductCategoriesDropdown 
        isOpen={isCategoriesOpen} 
        onClose={() => setIsCategoriesOpen(false)} 
      />
    </>
  );
}
