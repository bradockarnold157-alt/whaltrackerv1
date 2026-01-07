import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star } from "lucide-react";

interface Product {
  id: number;
  name: string;
  image: string;
  originalPrice: number;
  price: number;
  discount: number;
  rating: number;
  badge?: string;
}

const products: Product[] = [
  {
    id: 1,
    name: "💖 YouTube Premium",
    image: "https://cdn.centralcart.io/stores/9560/packages/09a363eb-bc86-4468-bfa2-a5d4c225355b.jpg",
    originalPrice: 12.46,
    price: 8.90,
    discount: 29,
    rating: 4.9,
    badge: "🔥 Popular",
  },
  {
    id: 2,
    name: "💚 Spotify Premium",
    image: "https://cdn.centralcart.io/stores/9560/packages/fd8c41cc-63ad-42a6-928e-ee96d2012274.jpg",
    originalPrice: 6.86,
    price: 4.90,
    discount: 29,
    rating: 4.8,
  },
  {
    id: 3,
    name: "🍀 Caixa Misteriosa",
    image: "https://cdn.centralcart.io/stores/9560/packages/7f73dbbf-91b2-4940-9891-9450b3e3b1da.jpg",
    originalPrice: 3.49,
    price: 2.49,
    discount: 29,
    rating: 4.7,
    badge: "✨ Novo",
  },
  {
    id: 4,
    name: "📦 Caixa de Assinaturas",
    image: "https://cdn.centralcart.io/stores/9560/packages/5b249900-0d6b-4e5b-a7c0-415b85ce74af.jpg",
    originalPrice: 7.69,
    price: 5.49,
    discount: 29,
    rating: 4.6,
  },
  {
    id: 5,
    name: "🎮 Xbox Game Pass",
    image: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400&h=300&fit=crop",
    originalPrice: 44.99,
    price: 29.90,
    discount: 34,
    rating: 4.9,
    badge: "🎮 Games",
  },
  {
    id: 6,
    name: "🎬 Netflix Premium",
    image: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&h=300&fit=crop",
    originalPrice: 55.90,
    price: 39.90,
    discount: 29,
    rating: 4.8,
  },
  {
    id: 7,
    name: "☁️ iCloud+ 200GB",
    image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop",
    originalPrice: 14.90,
    price: 9.90,
    discount: 34,
    rating: 4.7,
  },
  {
    id: 8,
    name: "📚 Kindle Unlimited",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop",
    originalPrice: 19.90,
    price: 12.90,
    discount: 35,
    rating: 4.5,
  },
];

const ProductGrid = () => {
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
            <Card key={product.id} variant="product" className="overflow-hidden">
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
                <Button variant="default" size="sm" className="w-full gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Comprar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
