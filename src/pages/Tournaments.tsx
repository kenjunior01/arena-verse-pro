import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, Users, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Tournament {
  id: string;
  name: string;
  description: string;
  game: string;
  format: string;
  status: string;
  max_teams: number;
  prize_pool: number;
  entry_fee: number;
  banner_url: string;
  start_date: string;
  registration_deadline: string;
}

const Tournaments = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTournaments(data || []);
    } catch (error) {
      console.error("Error fetching tournaments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "registration_open":
        return "bg-primary text-primary-foreground";
      case "in_progress":
        return "bg-secondary text-secondary-foreground";
      case "completed":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "registration_open":
        return "Inscrições Abertas";
      case "in_progress":
        return "Em Andamento";
      case "completed":
        return "Finalizado";
      case "draft":
        return "Rascunho";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="container mx-auto">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Torneios</h1>
          <p className="text-muted-foreground">
            Participe de competições épicas e mostre suas habilidades
          </p>
        </div>

        {tournaments.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Nenhum torneio disponível</h3>
              <p className="text-muted-foreground">
                Novos torneios serão anunciados em breve!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tournaments.map((tournament) => (
              <Card
                key={tournament.id}
                className="overflow-hidden border-primary/20 hover:border-primary/40 transition-smooth hover:shadow-card"
              >
                <div className="relative h-48 bg-gradient-card overflow-hidden">
                  {tournament.banner_url ? (
                    <img
                      src={tournament.banner_url}
                      alt={tournament.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Trophy className="h-20 w-20 text-primary/20" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge className={getStatusColor(tournament.status)}>
                      {getStatusLabel(tournament.status)}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{tournament.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {tournament.description || tournament.game}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {tournament.start_date
                      ? format(new Date(tournament.start_date), "dd 'de' MMM, yyyy", {
                          locale: ptBR,
                        })
                      : "Data a definir"}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Máximo de {tournament.max_teams} times
                  </div>
                  {tournament.prize_pool > 0 && (
                    <div className="flex items-center gap-2 text-sm font-semibold text-accent">
                      <DollarSign className="h-4 w-4" />
                      Premiação: ${tournament.prize_pool}
                    </div>
                  )}
                  <Button className="w-full" variant="hero">
                    Ver Detalhes
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tournaments;
