import { Card } from "@/components/ui/card";
import { 
  Tv, 
  Music, 
  Gamepad2, 
  GraduationCap, 
  Gift, 
  Zap,
  type LucideIcon 
} from "lucide-react";

interface Category {
  icon: LucideIcon;
  name: string;
  count: number;
}

const categories: Category[] = [
  { icon: Tv, name: "Streaming", count: 15 },
  { icon: Music, name: "Música", count: 8 },
  { icon: Gamepad2, name: "Jogos", count: 120 },
  { icon: GraduationCap, name: "Cursos", count: 45 },
  { icon: Gift, name: "Gift Cards", count: 30 },
  { icon: Zap, name: "Premium", count: 25 },
];

const Categories = () => {
  return (
    <section className="py-12">
      <div className="container">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold md:text-3xl">Categorias</h2>
          <a href="#" className="text-sm text-primary hover:underline">
            Ver todas →
          </a>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Card
                key={index}
                variant="category"
                className="flex flex-col items-center justify-center p-6 text-center"
              >
                <div className="mb-3 rounded-xl bg-primary/20 p-3 transition-colors group-hover:bg-primary/30">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <span className="font-semibold">{category.name}</span>
                <span className="text-xs text-muted-foreground">{category.count} produtos</span>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;
