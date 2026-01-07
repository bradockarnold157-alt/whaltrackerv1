import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { useProducts, ProductInsert } from "@/hooks/useProducts";
import { useAdminOrders, AdminOrder } from "@/hooks/useAdminOrders";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { useProductStock } from "@/hooks/useProductStock";
import { OrderStatus } from "@/hooks/useOrders";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductForm from "@/components/admin/ProductForm";
import StockManager from "@/components/admin/StockManager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Plus,
  Package,
  ShoppingCart,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Shield,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Send,
  RefreshCw,
  User,
  Gift,
  Boxes,
  Users,
  Mail,
  Phone,
} from "lucide-react";

const statusConfig: Record<OrderStatus, { label: string; icon: any; color: string }> = {
  pending: { label: "Aguardando", icon: Clock, color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  approved: { label: "Aprovado", icon: CheckCircle, color: "bg-green-500/20 text-green-400 border-green-500/30" },
  processing: { label: "Processando", icon: Package, color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  shipped: { label: "Enviado", icon: Truck, color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  delivered: { label: "Entregue", icon: Gift, color: "bg-green-500/20 text-green-400 border-green-500/30" },
  cancelled: { label: "Cancelado", icon: XCircle, color: "bg-red-500/20 text-red-400 border-red-500/30" },
};

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { products, loading: productsLoading, createProduct, updateProduct, deleteProduct, toggleProductStatus } = useProducts();
  const { orders, loading: ordersLoading, updateOrderStatus, updateOrderDeliverable, refreshOrders } = useAdminOrders();
  const { users, loading: usersLoading, refreshUsers } = useAdminUsers();
  const { stockByProduct, fetchStockForProduct, getAvailableCount } = useProductStock();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<number | null>(null);
  const [stockProductId, setStockProductId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [deliverableInput, setDeliverableInput] = useState("");
  const [formData, setFormData] = useState<ProductInsert>({
    name: "",
    description: "",
    price: 0,
    original_price: undefined,
    image: "",
    category: "",
    badge: "",
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      original_price: undefined,
      image: "",
      category: "",
      badge: "",
      is_active: true,
    });
    setEditingProduct(null);
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.image || !formData.category || formData.price <= 0) {
      return;
    }
    
    const productData: ProductInsert = {
      ...formData,
      original_price: formData.original_price || undefined,
      badge: formData.badge || undefined,
    };
    
    const { error } = await createProduct(productData);
    if (!error) {
      setIsCreateOpen(false);
      resetForm();
    }
  };

  const handleUpdate = async () => {
    if (!editingProduct) return;
    
    const { error } = await updateProduct(editingProduct, formData);
    if (!error) {
      setEditingProduct(null);
      resetForm();
    }
  };

  const openEditDialog = (product: any) => {
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      original_price: product.original_price || undefined,
      image: product.image,
      category: product.category,
      badge: product.badge || "",
      is_active: product.is_active,
    });
    setEditingProduct(product.id);
  };

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-primary/20">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Painel Admin</h1>
            <p className="text-muted-foreground">Gerencie produtos, pedidos e usuários</p>
          </div>
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Usuários
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Produtos</CardTitle>
                  <CardDescription>Gerencie o catálogo de produtos</CardDescription>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) resetForm(); }}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Novo Produto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Criar Novo Produto</DialogTitle>
                      <DialogDescription>Preencha os dados do novo produto</DialogDescription>
                    </DialogHeader>
                    <ProductForm formData={formData} setFormData={setFormData} onSubmit={handleCreate} submitLabel="Criar Produto" />
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {productsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum produto cadastrado.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">Img</TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Preço</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-12 h-12 rounded object-cover"
                              />
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{product.name}</p>
                                {product.badge && (
                                  <Badge variant="secondary" className="text-xs mt-1">
                                    {product.badge}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-primary">
                                  R$ {Number(product.price).toFixed(2)}
                                </p>
                                {product.original_price && (
                                  <p className="text-xs text-muted-foreground line-through">
                                    R$ {Number(product.original_price).toFixed(2)}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={product.is_active ? "default" : "secondary"}
                                className={product.is_active ? "bg-green-500/20 text-green-400" : ""}
                              >
                                {product.is_active ? "Ativo" : "Inativo"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    fetchStockForProduct(product.id);
                                    setStockProductId(product.id);
                                  }}
                                  className="gap-1"
                                  title="Gerenciar estoque"
                                >
                                  <Boxes className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => toggleProductStatus(product.id, !product.is_active)}
                                >
                                  {product.is_active ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                                
                                <Dialog open={editingProduct === product.id} onOpenChange={(open) => { if (!open) resetForm(); }}>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="ghost" onClick={() => openEditDialog(product)}>
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-lg">
                                    <DialogHeader>
                                      <DialogTitle>Editar Produto</DialogTitle>
                                      <DialogDescription>Atualize os dados do produto</DialogDescription>
                                    </DialogHeader>
                                    <ProductForm formData={formData} setFormData={setFormData} onSubmit={handleUpdate} submitLabel="Salvar Alterações" />
                                  </DialogContent>
                                </Dialog>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-400">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Tem certeza que deseja excluir "{product.name}"? Esta ação não pode ser desfeita.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteProduct(product.id)}
                                        className="bg-red-500 hover:bg-red-600"
                                      >
                                        Excluir
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stock Manager Modal */}
            {stockProductId && (
              <StockManager
                productId={stockProductId}
                productName={products.find((p) => p.id === stockProductId)?.name || ""}
                open={stockProductId !== null}
                onOpenChange={(open) => {
                  if (!open) setStockProductId(null);
                }}
              />
            )}
          </TabsContent>

          <TabsContent value="orders">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Pedidos</CardTitle>
                  <CardDescription>Gerencie todos os pedidos</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={refreshOrders} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Atualizar
                </Button>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum pedido encontrado.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const status = statusConfig[order.status];
                      const StatusIcon = status.icon;
                      
                      return (
                        <Card key={order.id} className="border-border/30 bg-muted/20">
                          <CardHeader className="pb-2">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium">Pedido #{order.id.slice(0, 8)}</p>
                                  <Badge variant="outline" className={status.color}>
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {status.label}
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {order.user_profile?.display_name || "Sem nome"}
                                  </span>
                                  <span>
                                    {new Date(order.created_at).toLocaleDateString("pt-BR", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                  <span className="font-semibold text-primary">
                                    R$ {Number(order.total).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Select
                                  value={order.status}
                                  onValueChange={(value) => updateOrderStatus(order.id, value as OrderStatus)}
                                >
                                  <SelectTrigger className="w-40">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Aguardando</SelectItem>
                                    <SelectItem value="approved">Aprovado</SelectItem>
                                    <SelectItem value="processing">Processando</SelectItem>
                                    <SelectItem value="shipped">Enviado</SelectItem>
                                    <SelectItem value="delivered">Entregue</SelectItem>
                                    <SelectItem value="cancelled">Cancelado</SelectItem>
                                  </SelectContent>
                                </Select>
                                
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedOrder(order);
                                        setDeliverableInput(order.deliverable || "");
                                      }}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle>Detalhes do Pedido #{order.id.slice(0, 8)}</DialogTitle>
                                      <DialogDescription>
                                        Gerencie o pedido e adicione o entregável
                                      </DialogDescription>
                                    </DialogHeader>
                                    
                                    <div className="space-y-6 py-4">
                                      {/* Customer Info */}
                                      <div className="p-4 rounded-lg bg-muted/30 border border-border">
                                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                                          <User className="h-4 w-4 text-primary" />
                                          Informações do Cliente
                                        </h4>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                          <div>
                                            <span className="text-muted-foreground">Nome:</span>
                                            <p className="font-medium">{order.user_profile?.display_name || "N/A"}</p>
                                          </div>
                                          <div>
                                            <span className="text-muted-foreground">Email:</span>
                                            <p className="font-medium">{order.user_email || "N/A"}</p>
                                          </div>
                                          <div>
                                            <span className="text-muted-foreground">Telefone:</span>
                                            <p className="font-medium">{order.user_profile?.phone || "N/A"}</p>
                                          </div>
                                          <div>
                                            <span className="text-muted-foreground">PIX Transaction:</span>
                                            <p className="font-mono text-xs">{order.pix_transaction_id || "N/A"}</p>
                                          </div>
                                          <div className="col-span-2">
                                            <span className="text-muted-foreground">ID do Usuário:</span>
                                            <p className="font-mono text-xs">{order.user_id}</p>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* Order Items */}
                                      <div>
                                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                                          <Package className="h-4 w-4 text-primary" />
                                          Itens do Pedido
                                        </h4>
                                        <div className="space-y-2">
                                          {order.items?.map((item) => (
                                            <div key={item.id} className="flex items-center gap-3 p-2 rounded bg-muted/20">
                                              <img
                                                src={item.product_image}
                                                alt={item.product_name}
                                                className="w-12 h-12 rounded object-cover"
                                              />
                                              <div className="flex-1">
                                                <p className="font-medium text-sm">{item.product_name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                  {item.quantity}x R$ {Number(item.price).toFixed(2)}
                                                </p>
                                              </div>
                                              <p className="font-semibold text-sm">
                                                R$ {(item.quantity * Number(item.price)).toFixed(2)}
                                              </p>
                                            </div>
                                          ))}
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-border flex justify-between">
                                          <span className="font-semibold">Total:</span>
                                          <span className="font-bold text-primary">R$ {Number(order.total).toFixed(2)}</span>
                                        </div>
                                      </div>
                                      
                                      {/* Deliverable */}
                                      <div>
                                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                                          <Gift className="h-4 w-4 text-primary" />
                                          Entregável (enviado ao cliente quando pago)
                                        </h4>
                                        <Textarea
                                          value={deliverableInput}
                                          onChange={(e) => setDeliverableInput(e.target.value)}
                                          placeholder="Ex: PRODUTO ENTREGUE! email: cliente@email.com senha: 123456"
                                          className="min-h-24"
                                        />
                                        <Button
                                          className="mt-2 gap-2"
                                          onClick={() => {
                                            if (deliverableInput.trim()) {
                                              updateOrderDeliverable(order.id, deliverableInput);
                                            }
                                          }}
                                          disabled={!deliverableInput.trim()}
                                        >
                                          <Send className="h-4 w-4" />
                                          Salvar e Marcar como Entregue
                                        </Button>
                                        
                                        {order.deliverable && (
                                          <div className="mt-4 p-3 rounded bg-green-500/10 border border-green-500/30">
                                            <p className="text-xs text-muted-foreground mb-1">Entregável atual:</p>
                                            <p className="font-mono text-sm">{order.deliverable}</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>
                          </CardHeader>
                          
                          {/* Quick view of items */}
                          <CardContent className="pt-0">
                            <div className="flex flex-wrap gap-2">
                              {order.items?.slice(0, 3).map((item) => (
                                <div key={item.id} className="flex items-center gap-2 px-2 py-1 rounded bg-muted/30 text-xs">
                                  <img src={item.product_image} alt="" className="w-6 h-6 rounded object-cover" />
                                  <span className="truncate max-w-32">{item.product_name}</span>
                                  <span className="text-muted-foreground">x{item.quantity}</span>
                                </div>
                              ))}
                              {(order.items?.length || 0) > 3 && (
                                <span className="text-xs text-muted-foreground self-center">
                                  +{(order.items?.length || 0) - 3} mais
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Usuários</CardTitle>
                  <CardDescription>Visualize todos os usuários cadastrados</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={refreshUsers} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Atualizar
                </Button>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum usuário encontrado.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12"></TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Telefone</TableHead>
                          <TableHead>Cadastro</TableHead>
                          <TableHead>Último acesso</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((userItem) => (
                          <TableRow key={userItem.id}>
                            <TableCell>
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={userItem.avatar_url || undefined} />
                                <AvatarFallback className="bg-primary/20 text-primary">
                                  {userItem.display_name?.charAt(0)?.toUpperCase() || userItem.email?.charAt(0)?.toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                            </TableCell>
                            <TableCell>
                              <p className="font-medium">{userItem.display_name || "Sem nome"}</p>
                              <p className="text-xs text-muted-foreground font-mono">{userItem.id.slice(0, 8)}...</p>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">{userItem.email || "N/A"}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">{userItem.phone || "N/A"}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">
                                {new Date(userItem.created_at).toLocaleDateString("pt-BR", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">
                                {userItem.last_sign_in_at
                                  ? new Date(userItem.last_sign_in_at).toLocaleDateString("pt-BR", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "Nunca"}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
