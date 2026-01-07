import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { products } from "@/data/products";
import { toast } from "@/hooks/use-toast";

const ProductGrid = () => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent, product: typeof products[0]) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast({
      title: "Adicionado ao carrinho! 🛒",
      description: `${product.name} foi adicionado.`,
    });
  };

  return (
    <section className="py-12">
      <div className="container">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Produtos em Destaque</h2>
            <p className="text-muted-foreground">Os mais vendidos da semana</p>
          </div>
          <a href="#" className="text-sm text-primary hover:underline">
            Ver todos →
          </a>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
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
                  <Badge variant="discount" className="absolute right-2 top-2">
                    -{product.discount}%
                  </Badge>
                </div>

                <CardContent className="p-4">
                  <h3 className="mb-2 line-clamp-2 font-semibold leading-tight transition-colors group-hover:text-primary">
                    {product.name}
                  </h3>
                  <div className="mb-2 flex items-center gap-1">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="text-sm text-muted-foreground">{product.rating}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-primary">
                      R$ {product.price.toFixed(2).replace(".", ",")}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      R$ {product.originalPrice.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-0">
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full gap-2"
                    onClick={(e) => handleAddToCart(e, product)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Comprar
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
