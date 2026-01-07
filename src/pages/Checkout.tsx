import { useState, useEffect, useCallback, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useOrders } from "@/hooks/useOrders";
import { usePixPayment } from "@/hooks/usePixPayment";
import { supabase } from "@/integrations/supabase/client";
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
  const { createOrder, updateOrderStatus } = useOrders();
  const { 
    generatePayment, 
    isGenerating, 
    paymentData, 
    status: pixStatus,
    isPolling,
    startPolling,
    stopPolling
  } = usePixPayment();
  const navigate = useNavigate();

  const paymentHandledRef = useRef(false);
  
  const [timeLeft, setTimeLeft] = useState(PAYMENT_TIME_MINUTES * 60);
  const [orderCreated, setOrderCreated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [checkoutItems, setCheckoutItems] = useState(cartItems);
  const [checkoutTotal, setCheckoutTotal] = useState(totalPrice);

  const discountedTotal = checkoutTotal * 0.95;

  // Store cart items on mount before they get cleared
  useEffect(() => {
    if (cartItems.length > 0) {
      setCheckoutItems(cartItems);
      setCheckoutTotal(totalPrice);
    }
  }, []);

  // Generate PIX payment on mount
  useEffect(() => {
    const initPayment = async () => {
      if (checkoutItems.length > 0 && user && !paymentData) {
        setIsInitializing(true);
        const result = await generatePayment(discountedTotal);
        if (!result) {
          toast({
            title: "Erro ao gerar PIX",
            description: "Não foi possível gerar o pagamento. Tente novamente.",
            variant: "destructive",
          });
          navigate("/conta");
        }
        setIsInitializing(false);
      } else if (checkoutItems.length === 0 && cartItems.length === 0) {
        setIsInitializing(false);
      } else {
        setIsInitializing(false);
      }
    };
    
    initPayment();
  }, [checkoutItems]);

  // Handle payment status change
  const handlePaymentConfirmed = useCallback(async () => {
    if (!currentOrderId) return;
    if (paymentHandledRef.current) return;
    paymentHandledRef.current = true;
    
    // First check if the order was already processed (e.g., by admin or another process)
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("status, deliverable")
      .eq("id", currentOrderId)
      .single();
    
    if (existingOrder?.deliverable && (existingOrder.status === 'delivered' || existingOrder.status === 'approved')) {
      // Order was already processed, just show success
      setOrderCreated(true);
      toast({
        title: "Pagamento confirmado! 🎉",
        description: "Seu pedido foi pago com sucesso.",
      });
      setTimeout(() => {
        navigate("/conta");
      }, 3000);
      return;
    }
    
    // Assign stock credentials for each item in the order via edge function
    const deliverables: string[] = [];
    
    for (const item of checkoutItems) {
      for (let i = 0; i < item.quantity; i++) {
        try {
          const { data, error } = await supabase.functions.invoke("assign-stock", {
            body: { productId: item.id, orderId: currentOrderId },
          });
          
          if (error) {
            console.error("Error assigning stock:", error);
            deliverables.push(`${item.name}: Erro ao atribuir - entre em contato`);
          } else if (data?.credential) {
            deliverables.push(`${item.name}: ${data.credential}`);
          } else {
            deliverables.push(`${item.name}: Estoque indisponível - entre em contato`);
          }
        } catch (err) {
          console.error("Error calling assign-stock:", err);
          deliverables.push(`${item.name}: Erro ao processar - entre em contato`);
        }
      }
    }
    
    const deliverable = deliverables.join("\n");
    
    await updateOrderStatus(currentOrderId, "delivered", deliverable);
    
    setOrderCreated(true);
    toast({
      title: "Pagamento confirmado! 🎉",
      description: "Seu pedido foi pago com sucesso.",
    });
    
    setTimeout(() => {
      navigate("/conta");
    }, 3000);
  }, [currentOrderId, checkoutItems, updateOrderStatus, navigate]);

  // Start polling when order is created
  useEffect(() => {
    if (currentOrderId && paymentData && !orderCreated) {
      startPolling(paymentData.transactionId, paymentData.amount, handlePaymentConfirmed);
    }
    
    return () => {
      stopPolling();
    };
  }, [currentOrderId, paymentData, orderCreated, startPolling, stopPolling, handlePaymentConfirmed]);

  // Subscribe to realtime order updates (when admin changes status or payment confirmed externally)
  useEffect(() => {
    if (!currentOrderId || orderCreated) return;

    const channel = supabase
      .channel(`order-${currentOrderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${currentOrderId}`,
        },
        (payload) => {
          const newStatus = payload.new.status;
          const deliverable = payload.new.deliverable;
          
          console.log("Order updated via realtime:", { newStatus, deliverable });
          
          // If order was already processed (has deliverable or status changed), use that
          if ((newStatus === 'delivered' || newStatus === 'approved') && deliverable) {
            stopPolling();
            setOrderCreated(true);
            toast({
              title: "Pedido Processado! 🎉",
              description: "Seu pedido foi entregue. Confira os detalhes em 'Meus Pedidos'.",
            });
            
            setTimeout(() => {
              navigate("/conta");
            }, 3000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentOrderId, orderCreated, stopPolling, navigate]);

  // Create order when payment is generated
  useEffect(() => {
    const createPendingOrder = async () => {
      if (paymentData && !currentOrderId && checkoutItems.length > 0) {
        const expiresAt = new Date(Date.now() + PAYMENT_TIME_MINUTES * 60 * 1000);
        
        const { error, order } = await createOrder({
          pixTransactionId: paymentData.transactionId,
          pixQrcode: paymentData.qrcode,
          pixExpiresAt: expiresAt.toISOString(),
        });
        
        if (error) {
          toast({
            title: "Erro ao criar pedido",
            description: error.message,
            variant: "destructive",
          });
          navigate("/conta");
        } else if (order) {
          setCurrentOrderId(order.id);
        }
      }
    };
    
    createPendingOrder();
  }, [paymentData]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0 || orderCreated) {
      if (timeLeft <= 0) {
        toast({
          title: "Tempo esgotado!",
          description: "O tempo para pagamento expirou. Por favor, tente novamente.",
          variant: "destructive",
        });
        navigate("/conta");
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, navigate, orderCreated]);

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
    if (!paymentData?.qrcode) return;
    
    try {
      await navigator.clipboard.writeText(paymentData.qrcode);
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

  if (authLoading || isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            {isInitializing ? "Gerando pagamento PIX..." : "Carregando..."}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (checkoutItems.length === 0 && !orderCreated && !currentOrderId) {
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
                Seu pedido foi processado com sucesso. Confira os detalhes em "Meus Pedidos".
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
            {isPolling && (
              <div className="mt-2 flex items-center justify-center gap-2 text-sm text-primary">
                <Loader2 className="h-4 w-4 animate-spin" />
                Aguardando confirmação do pagamento...
              </div>
            )}
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
                      {paymentData?.qrcode ? (
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentData.qrcode)}`}
                          alt="QR Code PIX"
                          className="w-48 h-48 rounded-lg"
                        />
                      ) : (
                        <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      )}
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
                        {paymentData?.qrcode ? `${paymentData.qrcode.slice(0, 50)}...` : "Gerando código..."}
                      </div>
                      <Button size="sm" variant={copied ? "default" : "outline"} className="shrink-0 gap-2" disabled={!paymentData}>
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

                {/* Status indicator */}
                <div className="bg-muted/30 rounded-xl p-4 border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status do pagamento:</span>
                    <span className={`text-sm font-medium ${
                      pixStatus === "COMPLETED" ? "text-green-500" : 
                      pixStatus === "FAILED" || pixStatus === "RETIDO" ? "text-red-500" : 
                      "text-yellow-500"
                    }`}>
                      {pixStatus === "COMPLETED" ? "Pago" : 
                       pixStatus === "FAILED" ? "Falhou" : 
                       pixStatus === "RETIDO" ? "Reembolsado" : 
                       "Aguardando pagamento"}
                    </span>
                  </div>
                </div>

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
                  {checkoutItems.length} {checkoutItems.length === 1 ? "item" : "itens"} no carrinho
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {checkoutItems.map((item) => (
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
                    <span>R$ {checkoutTotal.toFixed(2).replace(".", ",")}</span>
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
                        R$ {discountedTotal.toFixed(2).replace(".", ",")}
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
                    O PIX é processado em segundos. Assim que confirmarmos o pagamento, 
                    seu pedido será entregue automaticamente.
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
