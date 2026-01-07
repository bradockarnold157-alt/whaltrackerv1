import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { useProducts, ProductInsert } from "@/hooks/useProducts";
import { useOrders } from "@/hooks/useOrders";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { products, loading: productsLoading, createProduct, updateProduct, deleteProduct, toggleProductStatus } = useProducts();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<number | null>(null);
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

  const ProductForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Nome do Produto *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ex: FIFA 25 Ultimate Edition"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descrição do produto..."
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="price">Preço *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="original_price">Preço Original</Label>
          <Input
            id="original_price"
            type="number"
            step="0.01"
            value={formData.original_price || ""}
            onChange={(e) => setFormData({ ...formData, original_price: parseFloat(e.target.value) || undefined })}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="image">URL da Imagem *</Label>
        <Input
          id="image"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          placeholder="https://exemplo.com/imagem.jpg"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="category">Categoria *</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="Ex: Jogos, Assinaturas"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="badge">Badge</Label>
          <Input
            id="badge"
            value={formData.badge || ""}
            onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
            placeholder="Ex: Novo, -30%"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label>Produto ativo</Label>
      </div>
      <DialogFooter>
        <Button onClick={onSubmit} disabled={!formData.name || !formData.image || !formData.category || formData.price <= 0}>
          {submitLabel}
        </Button>
      </DialogFooter>
    </div>
  );

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
            <p className="text-muted-foreground">Gerencie produtos e pedidos</p>
          </div>
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Pedidos
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
                    <ProductForm onSubmit={handleCreate} submitLabel="Criar Produto" />
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
                                    <ProductForm onSubmit={handleUpdate} submitLabel="Salvar Alterações" />
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
          </TabsContent>

          <TabsContent value="orders">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Pedidos</CardTitle>
                <CardDescription>Visualize todos os pedidos</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-muted-foreground">
                  Em breve: gerenciamento completo de pedidos
                </p>
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
