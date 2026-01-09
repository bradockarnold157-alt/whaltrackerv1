import { ShoppingCart, LogIn, Wallet, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = () => {
  const { totalItems, setIsCartOpen } = useCart();
  const { user, profile } = useAuth();
  const { isAdmin } = useAdmin();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">
              WHALE<span className="text-gradient">TRACKER</span>
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link to="/admin">
              <Button variant="ghost" size="sm" className="gap-2 text-primary">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Button>
            </Link>
          )}
          {user ? (
            <Link to="/conta">
              <Button variant="ghost" size="sm" className="gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xs">
                    {profile?.display_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline">
                  {profile?.display_name || "Minha Conta"}
                </span>
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                Entrar
              </Button>
            </Link>
          )}
          <Button
            variant="cart"
            size="sm"
            className="gap-2"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="h-4 w-4" />
            Carrinho
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {totalItems}
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
