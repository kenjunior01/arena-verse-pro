import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Heart, Users } from "lucide-react";

const Community = () => {
  return (
    <div className="min-h-screen p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Comunidade</h1>
          <p className="text-muted-foreground">
            Conecte-se com outros jogadores e compartilhe suas experiências
          </p>
        </div>

        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-primary/20">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">Jogador {i}</span>
                      <span className="text-sm text-muted-foreground">há 2 horas</span>
                    </div>
                    <p className="text-sm mb-4">
                      Acabei de ganhar meu primeiro torneio! A final foi incrível, partida super disputada. 🎮🏆
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <button className="flex items-center gap-1 hover:text-primary transition-smooth">
                        <Heart className="h-4 w-4" />
                        <span>12</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-primary transition-smooth">
                        <MessageSquare className="h-4 w-4" />
                        <span>5</span>
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 text-center py-8 border-primary/20">
          <CardContent>
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Em Breve: Feed Social Completo</h3>
            <p className="text-muted-foreground">
              Posts, comentários, curtidas e muito mais estão a caminho!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Community;
