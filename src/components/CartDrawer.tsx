import { Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useStockAvailability } from "@/hooks/useStockAvailability";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const CartDrawer = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { minimumOrderValue } = useStoreSettings();
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    totalPrice,
    clearCart,
  } = useCart();

  const productIds = items.map((item) => item.id);
  const { getStockCount, loading: stockLoading } = useStockAvailability(productIds);
  
  const isMinimumMet = totalPrice >= minimumOrderValue;
  const remainingForMinimum = minimumOrderValue - totalPrice;

  const handleIncreaseQuantity = (productId: number, currentQuantity: number) => {
    const availableStock = getStockCount(productId);
    if (currentQuantity >= availableStock) {
      toast.error(`Apenas ${availableStock} unidade(s) disponível(is) em estoque`);
      return;
    }
    updateQuantity(productId, currentQuantity + 1);
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="flex w-full flex-col border-border bg-card sm:max-w-lg">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Seu Carrinho
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">Seu carrinho está vazio</p>
            <Button onClick={() => setIsCartOpen(false)}>
              Continuar Comprando
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-xl border border-border bg-background p-4"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                    <div className="flex flex-1 flex-col">
                      <h3 className="font-semibold leading-tight">{item.name}</h3>
                      <p className="text-sm text-primary">
                        R$ {item.price.toFixed(2).replace(".", ",")}
                      </p>
                      <div className="mt-auto flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleIncreaseQuantity(item.id, item.quantity)}
                          disabled={stockLoading || item.quantity >= getStockCount(item.id)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-auto h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-xl font-bold text-gradient">
                  R$ {totalPrice.toFixed(2).replace(".", ",")}
                </span>
              </div>
              
              {!isMinimumMet && items.length > 0 && (
                <p className="mb-3 text-sm text-center text-yellow-500">
                  Faltam R$ {remainingForMinimum.toFixed(2).replace(".", ",")} para o pedido mínimo de R$ {minimumOrderValue.toFixed(2).replace(".", ",")}
                </p>
              )}
              
              <Button 
                variant="glow" 
                size="lg" 
                className="w-full"
                disabled={!isMinimumMet}
                onClick={() => {
                  setIsCartOpen(false);
                  if (user) {
                    navigate("/checkout");
                  } else {
                    navigate("/auth");
                  }
                }}
              >
                Finalizar Compra
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full text-muted-foreground"
                onClick={clearCart}
              >
                Limpar Carrinho
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
