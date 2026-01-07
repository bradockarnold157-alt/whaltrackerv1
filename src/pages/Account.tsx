import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useOrders } from "@/hooks/useOrders";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileEditForm from "@/components/ProfileEditForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Package, ShoppingCart, User, LogOut, Clock, CheckCircle, Truck, XCircle, Gift, Copy, QrCode } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

const statusConfig = {
  pending: { label: "Aguardando", icon: Clock, color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  approved: { label: "Aprovado", icon: CheckCircle, color: "bg-green-500/20 text-green-400 border-green-500/30" },
  processing: { label: "Processando", icon: Package, color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  shipped: { label: "Enviado", icon: Truck, color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  delivered: { label: "Entregue", icon: CheckCircle, color: "bg-green-500/20 text-green-400 border-green-500/30" },
  cancelled: { label: "Cancelado", icon: XCircle, color: "bg-red-500/20 text-red-400 border-red-500/30" },
};

const Account = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const { items: cartItems, totalPrice, totalItems } = useCart();
  const { orders, loading: ordersLoading } = useOrders();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const handleCopyPix = async (pixCode: string) => {
    try {
      await navigator.clipboard.writeText(pixCode);
      toast({
        title: "Código copiado!",
        description: "Cole o código PIX no seu app de banco.",
      });
    } catch {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o código.",
        variant: "destructive",
      });
    }
  };

  const getTimeRemaining = (expiresAt: string | null | undefined) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return "Expirado";
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
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

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de finalizar.",
        variant: "destructive",
      });
      return;
    }
    navigate("/checkout");
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Até logo!",
      description: "Você saiu da sua conta.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <Card className="flex-1 border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary text-xl">
                  {profile?.display_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-xl">
                  {profile?.display_name || "Usuário"}
                </CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="orders" className="gap-2">
              <Package className="h-4 w-4" />
              Meus Pedidos
            </TabsTrigger>
            <TabsTrigger value="cart" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Carrinho ({totalItems})
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Perfil
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Meus Pedidos</CardTitle>
                <CardDescription>Acompanhe o status dos seus pedidos</CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Você ainda não tem pedidos.</p>
                    <Link to="/">
                      <Button className="mt-4" variant="glow">
                        Explorar Produtos
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const status = statusConfig[order.status];
                      const StatusIcon = status.icon;
                      const isExpanded = expandedOrder === order.id;
                      const timeRemaining = getTimeRemaining(order.pix_expires_at);
                      const isPending = order.status === "pending";
                      const isDelivered = order.status === "delivered";
                      
                      return (
                        <Card 
                          key={order.id} 
                          className={`border-border/30 bg-muted/30 cursor-pointer transition-all hover:border-primary/30 ${isDelivered ? "border-green-500/30" : ""}`}
                          onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Pedido #{order.id.slice(0, 8)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(order.created_at).toLocaleDateString("pt-BR", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {isPending && timeRemaining && (
                                  <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {timeRemaining}
                                  </Badge>
                                )}
                                <Badge variant="outline" className={status.color}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {status.label}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {/* Deliverable section - only show when delivered */}
                            {isDelivered && order.deliverable && (
                              <div className="mb-4 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                                <div className="flex items-center gap-2 mb-3">
                                  <Gift className="h-5 w-5 text-green-500" />
                                  <span className="font-semibold text-green-400">Entrega Digital</span>
                                </div>
                                <div className="space-y-2">
                                  {order.deliverable.split("\n").map((line, index) => {
                                    const [productName, ...credentialParts] = line.split(": ");
                                    const credential = credentialParts.join(": ");
                                    return (
                                      <div 
                                        key={index} 
                                        className="p-3 rounded-lg bg-background/50 border border-border"
                                      >
                                        <p className="text-xs text-muted-foreground mb-1">{productName}</p>
                                        <p className="text-sm font-mono text-foreground">{credential}</p>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* PIX Payment section - only show when pending and expanded */}
                            {isPending && isExpanded && order.pix_qrcode && (
                              <div className="mb-4 p-4 rounded-lg bg-primary/10 border border-primary/30">
                                <div className="flex items-center gap-2 mb-3">
                                  <QrCode className="h-5 w-5 text-primary" />
                                  <span className="font-semibold text-primary">Pagamento PIX</span>
                                </div>
                                <div className="flex flex-col md:flex-row gap-4">
                                  <div className="flex justify-center">
                                    <img 
                                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(order.pix_qrcode)}`}
                                      alt="QR Code PIX"
                                      className="w-28 h-28 rounded-lg bg-white p-1"
                                    />
                                  </div>
                                  <div className="flex-1 space-y-2">
                                    <p className="text-xs text-muted-foreground">Código PIX:</p>
                                    <div 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopyPix(order.pix_qrcode!);
                                      }}
                                      className="flex items-center gap-2 p-2 bg-muted/50 rounded border border-border cursor-pointer hover:border-primary/50"
                                    >
                                      <span className="flex-1 font-mono text-xs truncate">
                                        {order.pix_qrcode.slice(0, 40)}...
                                      </span>
                                      <Copy className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      Assim que o pagamento for confirmado, seu pedido será entregue automaticamente.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="space-y-3">
                              {order.items?.map((item) => (
                                <div key={item.id} className="flex items-center gap-3">
                                  <img
                                    src={item.product_image}
                                    alt={item.product_name}
                                    className="w-12 h-12 rounded object-cover"
                                  />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{item.product_name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      Qtd: {item.quantity} x R$ {item.price.toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-border/30 flex justify-between">
                              <span className="text-sm text-muted-foreground">Total</span>
                              <span className="font-bold text-primary">
                                R$ {Number(order.total).toFixed(2)}
                              </span>
                            </div>
                            
                            {isPending && !isExpanded && order.pix_qrcode && (
                              <p className="text-xs text-center text-muted-foreground mt-2">
                                Clique para ver detalhes do pagamento
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cart">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Meu Carrinho</CardTitle>
                <CardDescription>Revise os itens antes de finalizar</CardDescription>
              </CardHeader>
              <CardContent>
                {cartItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Seu carrinho está vazio.</p>
                    <Link to="/">
                      <Button className="mt-4" variant="glow">
                        Explorar Produtos
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 rounded object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Qtd: {item.quantity}
                            </p>
                          </div>
                          <p className="font-bold text-primary">
                            R$ {(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-border/30 pt-4">
                      <div className="flex justify-between mb-4">
                        <span className="text-lg">Total</span>
                        <span className="text-2xl font-bold text-primary">
                          R$ {totalPrice.toFixed(2)}
                        </span>
                      </div>
                      <Button onClick={handleCheckout} className="w-full" variant="glow" size="lg">
                        Finalizar Compra
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Meu Perfil</CardTitle>
                <CardDescription>Edite suas informações pessoais</CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileEditForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Account;
