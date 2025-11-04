import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Gamepad2, TvMinimalPlay, Target, Zap, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import heroBanner from "@/assets/hero-banner.jpg";

const Index = () => {
  const features = [
    {
      icon: Trophy,
      title: "Torneios Épicos",
      description: "Participe de competições organizadas com premiações incríveis",
    },
    {
      icon: Users,
      title: "Times Competitivos",
      description: "Monte seu time e conquiste o topo do ranking",
    },
    {
      icon: TvMinimalPlay,
      title: "Transmissões Ao Vivo",
      description: "Assista às melhores partidas em tempo real",
    },
    {
      icon: Target,
      title: "Rankings e Stats",
      description: "Acompanhe seu desempenho e evolução",
    },
    {
      icon: Zap,
      title: "Resultados em Tempo Real",
      description: "Fique por dentro de tudo que acontece nas partidas",
    },
    {
      icon: Shield,
      title: "Sistema Seguro",
      description: "Plataforma confiável para competições justas",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBanner})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
        
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Bem-vindo à
              <span className="block bg-gradient-primary bg-clip-text text-transparent">
                Esports Arena
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              A plataforma definitiva para competições de esports. Participe de torneios, monte seu time e mostre suas habilidades.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/auth">
                <Button variant="hero" size="xl" className="gap-2">
                  <Trophy className="h-5 w-5" />
                  Começar Agora
                </Button>
              </Link>
              <Link to="/tournaments">
                <Button variant="outline" size="xl" className="gap-2">
                  <Gamepad2 className="h-5 w-5" />
                  Ver Torneios
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tudo que você precisa para competir
            </h2>
            <p className="text-xl text-muted-foreground">
              Uma plataforma completa para esports competitivo
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="border-primary/20 hover:border-primary/40 transition-smooth hover:shadow-card"
                >
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4 shadow-glow-primary">
                      <Icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-hero">
        <div className="container mx-auto text-center">
          <Card className="max-w-3xl mx-auto border-primary/20 shadow-card">
            <CardContent className="p-12">
              <Trophy className="h-16 w-16 mx-auto mb-6 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Pronto para competir?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Junte-se a milhares de jogadores e comece sua jornada rumo ao topo
              </p>
              <Link to="/auth">
                <Button variant="hero" size="xl" className="gap-2">
                  Criar Conta Grátis
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
