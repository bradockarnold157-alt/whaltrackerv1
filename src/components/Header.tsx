import { ShoppingCart, LogIn, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Headphones className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">
              Digital<span className="text-gradient">Store</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-2">
            <LogIn className="h-4 w-4" />
            Entrar
          </Button>
          <Button variant="cart" size="sm" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Carrinho
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              0
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
