import { Card } from "@/components/ui/card";
import { 
  Tv, 
  Music, 
  Gamepad2, 
  GraduationCap, 
  Gift, 
  Zap,
  ShoppingBag,
  Laptop,
  Smartphone,
  type LucideIcon 
} from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";

const iconMap: Record<string, LucideIcon> = {
  Tv,
  Music,
  Gamepad2,
  GraduationCap,
  Gift,
  Zap,
  ShoppingBag,
  Laptop,
  Smartphone,
};

const Categories = () => {
  const { categories, loading } = useCategories();

  if (loading) {
    return (
      <section className="py-12">
        <div className="container">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold md:text-3xl">Categorias</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Filter categories that have products
  const activeCategories = categories.filter(cat => cat.product_count > 0);

  if (activeCategories.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="container">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold md:text-3xl">Categorias</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {activeCategories.map((category) => {
            const Icon = iconMap[category.icon] || Zap;
            return (
              <Card
                key={category.id}
                variant="category"
                className="flex flex-col items-center justify-center p-6 text-center"
              >
                <div className="mb-3 rounded-xl bg-primary/20 p-3 transition-colors group-hover:bg-primary/30">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <span className="font-semibold">{category.name}</span>
                <span className="text-xs text-muted-foreground">{category.product_count} produtos</span>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;
