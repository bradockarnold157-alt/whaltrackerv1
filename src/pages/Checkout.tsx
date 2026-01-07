import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useOrders } from "@/hooks/useOrders";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { 
  Loader2, 
  Clock, 
  Copy, 
  CheckCircle, 
  ShoppingBag,
  Shield,
  Zap,
  QrCode
} from "lucide-react";

const PAYMENT_TIME_MINUTES = 15;

const Checkout = () => {
  const { user, loading: authLoading } = useAuth();
  const { items: cartItems, totalPrice, clearCart } = useCart();
  const { createOrder } = useOrders();
  const navigate = useNavigate();
  
  const [timeLeft, setTimeLeft] = useState(PAYMENT_TIME_MINUTES * 60);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate a fake PIX code for demonstration
  const pixCode = `00020126580014br.gov.bcb.pix0136${user?.id?.slice(0, 36) || "00000000-0000-0000-0000-000000000000"}5204000053039865404${totalPrice.toFixed(2)}5802BR5925LOJA GAMES6009SAO PAULO62070503***6304`;

  useEffect(() => {
    if (timeLeft <= 0) {
      toast({
        title: "Tempo esgotado!",
        description: "O tempo para pagamento expirou. Por favor, tente novamente.",
        variant: "destructive",
      });
      navigate("/conta");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimeColor = () => {
    if (timeLeft <= 60) return "text-red-500";
    if (timeLeft <= 180) return "text-yellow-500";
    return "text-primary";
  };

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      toast({
        title: "Código copiado!",
        description: "Cole o código PIX no seu app de banco.",
      });
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o código.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    
    const { error } = await createOrder();
    
    if (error) {
      toast({
        title: "Erro ao processar pedido",
        description: error.message,
        variant: "destructive",
      });
      setIsProcessing(false);
    } else {
      setOrderCreated(true);
      toast({
        title: "Pagamento confirmado! 🎉",
        description: "Seu pedido foi realizado com sucesso.",
      });
      setTimeout(() => {
        navigate("/conta");
      }, 3000);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (cartItems.length === 0 && !orderCreated) {
    return <Navigate to="/conta" replace />;
  }

  if (orderCreated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-8 flex items-center justify-center">
          <Card className="max-w-md w-full border-green-500/50 bg-card/50 backdrop-blur text-center">
            <CardContent className="pt-12 pb-8">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-green-500/30 blur-2xl rounded-full animate-pulse" />
                <CheckCircle className="relative h-24 w-24 text-green-500 mx-auto" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Pagamento Confirmado!</h2>
              <p className="text-muted-foreground mb-6">
                Seu pedido foi processado com sucesso. Você receberá atualizações sobre o status.
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecionando para sua conta...
              </p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Finalizar <span className="text-gradient">Pagamento</span>
            </h1>
            <p className="text-muted-foreground">
              Complete seu pagamento via PIX para confirmar o pedido
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: PIX Payment */}
            <Card className="border-primary/30 bg-gradient-to-b from-card to-card/50 backdrop-blur overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
              
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-primary" />
                    Pagamento PIX
                  </CardTitle>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/50 border ${timeLeft <= 60 ? "border-red-500/50" : "border-primary/30"}`}>
                    <Clock className={`h-4 w-4 ${getTimeColor()}`} />
                    <span className={`font-mono font-bold ${getTimeColor()}`}>
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>
                <CardDescription>
                  Escaneie o QR Code ou copie o código
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative space-y-6">
                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="relative group">
                    <div className="absolute -inset-4 bg-primary/20 blur-xl rounded-3xl opacity-50 group-hover:opacity-75 transition-opacity" />
                    <div className="relative bg-white p-4 rounded-2xl shadow-2xl">
                      {/* Simulated QR Code using pattern */}
                      <div className="w-48 h-48 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          {/* QR Code pattern simulation */}
                          {Array.from({ length: 10 }).map((_, row) =>
                            Array.from({ length: 10 }).map((_, col) => {
                              const isBlack = (row + col) % 2 === 0 || 
                                (row < 3 && col < 3) || 
                                (row < 3 && col > 6) || 
                                (row > 6 && col < 3) ||
                                Math.random() > 0.5;
                              return (
                                <rect
                                  key={`${row}-${col}`}
                                  x={col * 10}
                                  y={row * 10}
                                  width="10"
                                  height="10"
                                  fill={isBlack ? "#1a1a1a" : "#ffffff"}
                                />
                              );
                            })
                          )}
                          {/* Position markers */}
                          <rect x="0" y="0" width="30" height="30" fill="#1a1a1a" />
                          <rect x="5" y="5" width="20" height="20" fill="#ffffff" />
                          <rect x="10" y="10" width="10" height="10" fill="#1a1a1a" />
                          
                          <rect x="70" y="0" width="30" height="30" fill="#1a1a1a" />
                          <rect x="75" y="5" width="20" height="20" fill="#ffffff" />
                          <rect x="80" y="10" width="10" height="10" fill="#1a1a1a" />
                          
                          <rect x="0" y="70" width="30" height="30" fill="#1a1a1a" />
                          <rect x="5" y="75" width="20" height="20" fill="#ffffff" />
                          <rect x="10" y="80" width="10" height="10" fill="#1a1a1a" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PIX Code Copy */}
                <div className="space-y-3">
                  <p className="text-sm text-center text-muted-foreground">
                    Ou copie o código PIX abaixo:
                  </p>
                  <div 
                    onClick={handleCopyPix}
                    className="relative group cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-primary/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex items-center gap-3 p-4 bg-muted/50 rounded-xl border border-border hover:border-primary/50 transition-colors">
                      <div className="flex-1 font-mono text-xs break-all text-muted-foreground">
                        {pixCode.slice(0, 50)}...
                      </div>
                      <Button size="sm" variant={copied ? "default" : "outline"} className="shrink-0 gap-2">
                        {copied ? (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copiar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Confirm Button */}
                <Button 
                  onClick={handleConfirmPayment}
                  disabled={isProcessing}
                  variant="glow"
                  size="lg"
                  className="w-full text-lg h-14"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Confirmar Pagamento
                    </>
                  )}
                </Button>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-6 pt-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Shield className="h-4 w-4 text-green-500" />
                    Pagamento Seguro
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    Confirmação Instantânea
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right: Order Summary */}
            <Card className="border-border/50 bg-card/50 backdrop-blur h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  Resumo do Pedido
                </CardTitle>
                <CardDescription>
                  {cartItems.length} {cartItems.length === 1 ? "item" : "itens"} no carrinho
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {cartItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Qtd: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-primary text-sm">
                        R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>R$ {totalPrice.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Desconto PIX</span>
                    <span className="text-green-500">-5%</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-medium">Total</span>
                    <div className="text-right">
                      <span className="text-3xl font-bold text-gradient">
                        R$ {(totalPrice * 0.95).toFixed(2).replace(".", ",")}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        à vista no PIX
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Pagamento Instantâneo
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    O PIX é processado em segundos. Após a confirmação, seu pedido será 
                    preparado imediatamente.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
