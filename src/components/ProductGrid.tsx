import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star, Loader2, PackageX } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { usePublicProducts, Product } from "@/hooks/useProducts";
import { useStockAvailability } from "@/hooks/useStockAvailability";
import { useCategories } from "@/hooks/useCategories";
import { toast } from "@/hooks/use-toast";

const ProductGrid = () => {
  const { addToCart } = useCart();
  const { products, loading } = usePublicProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  const productIds = products.map((p) => p.id);
  const { hasStock } = useStockAvailability(productIds);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!hasStock(product.id)) {
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
      discount: product.original_price 
        ? Math.round((1 - product.price / product.original_price) * 100) 
        : 0,
      rating: product.rating || 5,
      description: product.description || "",
      category: product.category,
      badge: product.badge || undefined,
    };
    
    addToCart(cartProduct);
    toast({
      title: "Adicionado ao carrinho! 🛒",
      description: `${product.name} foi adicionado.`,
    });
  };

  const getDiscount = (product: Product) => {
    if (!product.original_price || product.original_price <= product.price) return 0;
    return Math.round((1 - product.price / product.original_price) * 100);
  };

  // Group products by category
  const productsByCategory = categories
    .filter((cat) => cat.is_active)
    .map((category) => ({
      category,
      products: products.filter((p) => p.category === category.name),
    }))
    .filter((group) => group.products.length > 0);

  if (loading || categoriesLoading) {
    return (
      <section className="py-12">
        <div className="container">
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="container space-y-12">
        {productsByCategory.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nenhum produto disponível no momento.</p>
          </div>
        ) : (
          productsByCategory.map(({ category, products: categoryProducts }) => (
            <div key={category.id}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold md:text-3xl">{category.name}</h2>
                <p className="text-muted-foreground">
                  {categoryProducts.length} {categoryProducts.length === 1 ? "produto" : "produtos"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {categoryProducts.map((product) => {
                  const discount = getDiscount(product);
                  
                  return (
                    <Link key={product.id} to={`/produto/${product.id}`}>
                      <Card variant="product" className="h-full overflow-hidden">
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          {product.badge && (
                            <Badge variant="hot" className="absolute left-2 top-2">
                              {product.badge}
                            </Badge>
                          )}
                          {discount > 0 && (
                            <Badge variant="discount" className="absolute right-2 top-2">
                              -{discount}%
                            </Badge>
                          )}
                        </div>

                        <CardContent className="p-4">
                          <h3 className="mb-2 line-clamp-2 font-semibold leading-tight transition-colors group-hover:text-primary">
                            {product.name}
                          </h3>
                          <div className="mb-2 flex items-center gap-1">
                            <Star className="h-4 w-4 fill-warning text-warning" />
                            <span className="text-sm text-muted-foreground">
                              {(product.rating || 5).toFixed(1)}
                              {product.reviews_count !== null && product.reviews_count > 0 && (
                                <span className="ml-1">({product.reviews_count})</span>
                              )}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-primary">
                              R$ {Number(product.price).toFixed(2).replace(".", ",")}
                            </span>
                            {product.original_price && product.original_price > product.price && (
                              <span className="text-sm text-muted-foreground line-through">
                                R$ {Number(product.original_price).toFixed(2).replace(".", ",")}
                              </span>
                            )}
                          </div>
                        </CardContent>

                        <CardFooter className="p-4 pt-0">
                          {hasStock(product.id) ? (
                            <Button
                              variant="default"
                              size="sm"
                              className="w-full gap-2"
                              onClick={(e) => handleAddToCart(e, product)}
                            >
                              <ShoppingCart className="h-4 w-4" />
                              Comprar
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full gap-2 opacity-60"
                              disabled
                            >
                              <PackageX className="h-4 w-4" />
                              Sem Estoque
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default ProductGrid;
