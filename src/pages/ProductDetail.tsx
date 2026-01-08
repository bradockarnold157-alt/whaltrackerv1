import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Shield, Zap, Check, Loader2, PackageX, X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { useCart } from "@/contexts/CartContext";
import { usePublicProducts, Product } from "@/hooks/useProducts";
import { useSingleStockAvailability } from "@/hooks/useStockAvailability";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StarRating from "@/components/StarRating";
import { toast } from "@/hooks/use-toast";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { getProductById } = usePublicProducts();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageOpen, setImageOpen] = useState(false);
  const { hasStock, loading: stockLoading } = useSingleStockAvailability(Number(id));

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const data = await getProductById(Number(id));
      setProduct(data);
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <h1 className="mb-4 text-2xl font-bold">Produto não encontrado</h1>
          <Button onClick={() => navigate("/")}>Voltar à loja</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const discount = product.original_price && product.original_price > product.price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!hasStock) {
      toast({
        title: "Produto sem estoque",
        description: "Este produto está temporariamente indisponível.",
        variant: "destructive",
      });
      return;
    }
    
    const cartProduct = {
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      originalPrice: product.original_price || product.price,
      discount,
      rating: product.rating || 5,
      description: product.description || "",
      category: product.category,
      badge: product.badge || undefined,
    };
    
    addToCart(cartProduct);
    toast({
      title: "Adicionado ao carrinho! 🛒",
      description: `${product.name} foi adicionado ao seu carrinho.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Product Image */}
          <div 
            className="relative overflow-hidden rounded-2xl border border-border bg-card cursor-zoom-in group"
            onClick={() => setImageOpen(true)}
          >
            <img
              src={product.image}
              alt={product.name}
              className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
              <ZoomIn className="h-10 w-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {product.badge && (
              <Badge variant="hot" className="absolute left-4 top-4">
                {product.badge}
              </Badge>
            )}
            {discount > 0 && (
              <Badge variant="discount" className="absolute right-4 top-4">
                -{discount}%
              </Badge>
            )}
          </div>

          {/* Image Zoom Modal */}
          <Dialog open={imageOpen} onOpenChange={setImageOpen}>
            <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-transparent">
              <DialogClose className="absolute right-4 top-4 z-50 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors">
                <X className="h-6 w-6" />
              </DialogClose>
              <img
                src={product.image}
                alt={product.name}
                className="max-w-full max-h-[90vh] object-contain rounded-lg mx-auto"
              />
            </DialogContent>
          </Dialog>

          {/* Product Info */}
          <div className="flex flex-col">
            <Badge variant="secondary" className="mb-4 w-fit">
              {product.category}
            </Badge>

            <h1 className="mb-4 text-3xl font-bold md:text-4xl">{product.name}</h1>

            <div className="mb-4">
              <StarRating 
                rating={product.rating || 5} 
                reviewsCount={product.reviews_count || 0}
                size="md"
              />
            </div>

            <p className="mb-6 text-lg text-muted-foreground whitespace-pre-line">
              {product.description}
            </p>

            {/* Price */}
            <div className="mb-6 rounded-xl border border-border bg-card p-6">
              <div className="mb-2 flex items-baseline gap-3">
                <span className="text-4xl font-bold text-gradient">
                  R$ {Number(product.price).toFixed(2).replace(".", ",")}
                </span>
                {product.original_price && product.original_price > product.price && (
                  <span className="text-xl text-muted-foreground line-through">
                    R$ {Number(product.original_price).toFixed(2).replace(".", ",")}
                  </span>
                )}
              </div>
              {product.original_price && product.original_price > product.price && (
                <p className="text-sm text-success">
                  Você economiza R$ {(Number(product.original_price) - Number(product.price)).toFixed(2).replace(".", ",")}
                </p>
              )}
            </div>

            {/* Add to cart */}
            {hasStock ? (
              <Button
                variant="glow"
                size="xl"
                className="mb-6 gap-2"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5" />
                Adicionar ao Carrinho
              </Button>
            ) : (
              <Button
                variant="outline"
                size="xl"
                className="mb-6 gap-2 opacity-60"
                disabled
              >
                <PackageX className="h-5 w-5" />
                Produto Sem Estoque
              </Button>
            )}

            {/* Features */}
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: Zap, text: "Entrega em até 5 minutos" },
                { icon: Shield, text: "Compra 100% segura" },
                { icon: Check, text: "Garantia de 30 dias" },
                { icon: Check, text: "Suporte 24/7" },
              ].map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Icon className="h-4 w-4 text-primary" />
                    <span>{feature.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
