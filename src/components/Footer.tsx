import { MessageCircle } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-border/40 bg-background/80 backdrop-blur-xl mt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              © 2025 BELLVION Games. Todos os direitos reservados.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <a
              href="https://chat.whatsapp.com/seu-link-aqui"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Junte-se ao grupo do WhatsApp
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
