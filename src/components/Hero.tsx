import heroBanner from "@/assets/hero-banner.jpg";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroBanner}
          alt="Digital products banner"
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
      </div>

      {/* Content */}
      <div className="container relative py-20 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-6xl">
            Assista, ouça e jogue
            <span className="block text-gradient">pagando muito menos</span>
          </h1>
          <p className="mb-8 text-lg text-muted-foreground md:text-xl">
            Assinaturas digitais, jogos, cursos e muito mais com os melhores preços do mercado.
            Entrega automática e suporte 24h.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button variant="glow" size="xl" className="gap-2">
              <Sparkles className="h-5 w-5" />
              Ver Produtos
            </Button>
            <Button variant="outline" size="xl">
              Como Funciona
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { value: "50K+", label: "Clientes Satisfeitos" },
            { value: "100K+", label: "Produtos Vendidos" },
            { value: "24/7", label: "Suporte Online" },
            { value: "5min", label: "Entrega Média" },
          ].map((stat, index) => (
            <div
              key={index}
              className="rounded-xl border border-border/50 bg-card/50 p-4 text-center backdrop-blur-sm"
            >
              <div className="text-2xl font-bold text-gradient md:text-3xl">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
