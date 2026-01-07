import { Shield, Zap, HeadphonesIcon, CreditCard } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Entrega Instantânea",
    description: "Receba seu produto em segundos após a confirmação do pagamento.",
  },
  {
    icon: Shield,
    title: "100% Seguro",
    description: "Pagamento processado com criptografia de ponta a ponta.",
  },
  {
    icon: HeadphonesIcon,
    title: "Suporte 24/7",
    description: "Nossa equipe está sempre disponível para ajudar você.",
  },
  {
    icon: CreditCard,
    title: "Pagamento Fácil",
    description: "PIX, cartão de crédito, boleto e muito mais.",
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
