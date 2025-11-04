import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TvMinimalPlay, Eye } from "lucide-react";

const Streams = () => {
  return (
    <div className="min-h-screen p-8">
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Lives e Transmissões</h1>
          <p className="text-muted-foreground">
            Assista às melhores partidas e transmissões dos torneios
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="overflow-hidden border-primary/20">
              <div className="relative aspect-video bg-gradient-card">
                <div className="absolute inset-0 flex items-center justify-center">
                  <TvMinimalPlay className="h-20 w-20 text-primary/20" />
                </div>
                <div className="absolute top-2 left-2">
                  <Badge className="bg-destructive text-destructive-foreground animate-pulse">
                    AO VIVO
                  </Badge>
                </div>
                <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md">
                  <Eye className="h-4 w-4" />
                  <span className="text-sm font-semibold">1.2k</span>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-lg">
                  Final do Torneio - Partida Decisiva
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Time A vs Time B - Melhor de 3
                </p>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card className="mt-8 text-center py-12 border-primary/20">
          <CardContent>
            <TvMinimalPlay className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">
              Sistema de Transmissões em Desenvolvimento
            </h3>
            <p className="text-muted-foreground">
              Em breve você poderá assistir transmissões do YouTube e Twitch diretamente aqui!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Streams;
