import { Shield, Zap, Bell, Wallet } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Alertas Instantâneos",
    description: "Receba notificações em tempo real quando whales movimentam fundos.",
  },
  {
    icon: Shield,
    title: "100% Seguro",
    description: "Seus dados criptografados e nunca compartilhados com terceiros.",
  },
  {
    icon: Bell,
    title: "Monitoramento 24/7",
    description: "Rastreie wallets automaticamente, mesmo enquanto você dorme.",
  },
  {
    icon: Wallet,
    title: "Multi-Chain",
    description: "Suporte para Ethereum, BSC, Solana, Polygon e mais.",
  },
];

const Features = () => {
  return (
    <section className="border-y border-border/50 bg-card/30 py-12">
      <div className="container">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="flex items-start gap-4">
                <div className="rounded-xl bg-primary/20 p-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
