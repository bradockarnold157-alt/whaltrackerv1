import { Wallet, Twitter, MessageCircle, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-card/30 py-12">
      <div className="container">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <Wallet className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">
                WHALE<span className="text-gradient">TRACKER</span>
              </span>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Ferramentas profissionais para rastrear whales e maximizar seus lucros no mercado crypto.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="rounded-lg bg-muted p-2 transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="rounded-lg bg-muted p-2 transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="rounded-lg bg-muted p-2 transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-4 font-semibold">Ferramentas</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">Wallet Tracker</a></li>
              <li><a href="#" className="hover:text-primary">Whale Alerts</a></li>
              <li><a href="#" className="hover:text-primary">Token Scanner</a></li>
              <li><a href="#" className="hover:text-primary">Portfolio Analyzer</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Suporte</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">Central de Ajuda</a></li>
              <li><a href="#" className="hover:text-primary">Minha Assinatura</a></li>
              <li><a href="#" className="hover:text-primary">Política de Reembolso</a></li>
              <li><a href="#" className="hover:text-primary">Contato</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-primary">Política de Privacidade</a></li>
              <li><a href="#" className="hover:text-primary">Cookies</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 text-center text-sm text-muted-foreground md:flex-row">
          <p>© 2025 WhaleTracker. Todos os direitos reservados.</p>
          <p>Feito com 💙 para traders</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
