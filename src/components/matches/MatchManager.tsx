import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Match {
  id: string;
  tournament_id: string;
  team1_id: string;
  team2_id: string;
  team1_score: number;
  team2_score: number;
  status: string;
  scheduled_time: string | null;
  winner_id: string | null;
  team1: { name: string; tag: string };
  team2: { name: string; tag: string };
}

interface MatchManagerProps {
  tournamentId: string;
  isOrganizer: boolean;
}

export const MatchManager = ({ tournamentId, isOrganizer }: MatchManagerProps) => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [scores, setScores] = useState<{ team1: number; team2: number }>({ team1: 0, team2: 0 });

  useEffect(() => {
    fetchMatches();
  }, [tournamentId]);

  const fetchMatches = async () => {
    const { data } = await supabase
      .from("tournament_matches")
      .select(`
        *,
        team1:teams!tournament_matches_team1_id_fkey(name, tag),
        team2:teams!tournament_matches_team2_id_fkey(name, tag)
      `)
      .eq("tournament_id", tournamentId)
      .order("scheduled_time", { ascending: true });

    if (data) setMatches(data as any);
  };

  const handleUpdateScore = async (matchId: string) => {
    try {
      const match = matches.find(m => m.id === matchId);
      if (!match) return;

      const winnerId = scores.team1 > scores.team2 ? match.team1_id : match.team2_id;

      const { error } = await supabase
        .from("tournament_matches")
        .update({
          team1_score: scores.team1,
          team2_score: scores.team2,
          winner_id: winnerId,
          status: "completed"
        })
        .eq("id", matchId);

      if (error) throw error;

      toast.success("Placar atualizado!");
      setEditingMatch(null);
      fetchMatches();
    } catch (error) {
      toast.error("Erro ao atualizar placar");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      scheduled: "default",
      live: "destructive",
      completed: "secondary"
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Partidas</h2>
      {matches.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Nenhuma partida agendada
          </CardContent>
        </Card>
      ) : (
        matches.map((match) => (
          <Card key={match.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">
                  {match.team1.name} vs {match.team2.name}
                </CardTitle>
                {getStatusBadge(match.status)}
              </div>
              {match.scheduled_time && (
                <p className="text-sm text-muted-foreground">
                  {format(new Date(match.scheduled_time), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </p>
              )}
            </CardHeader>
            <CardContent>
              {editingMatch === match.id && isOrganizer ? (
                <div className="space-y-4">
                  <div className="flex gap-4 items-center">
                    <div className="flex-1">
                      <label className="text-sm font-medium">{match.team1.tag}</label>
                      <Input
                        type="number"
                        min="0"
                        value={scores.team1}
                        onChange={(e) => setScores({ ...scores, team1: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <span className="text-2xl font-bold">vs</span>
                    <div className="flex-1">
                      <label className="text-sm font-medium">{match.team2.tag}</label>
                      <Input
                        type="number"
                        min="0"
                        value={scores.team2}
                        onChange={(e) => setScores({ ...scores, team2: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleUpdateScore(match.id)}>Salvar</Button>
                    <Button variant="outline" onClick={() => setEditingMatch(null)}>Cancelar</Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div className="text-center flex-1">
                    <p className="text-3xl font-bold">{match.team1_score}</p>
                    <p className="text-sm text-muted-foreground">{match.team1.tag}</p>
                  </div>
                  <span className="text-2xl font-bold text-muted-foreground">-</span>
                  <div className="text-center flex-1">
                    <p className="text-3xl font-bold">{match.team2_score}</p>
                    <p className="text-sm text-muted-foreground">{match.team2.tag}</p>
                  </div>
                  {isOrganizer && match.status !== "completed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingMatch(match.id);
                        setScores({ team1: match.team1_score, team2: match.team2_score });
                      }}
                    >
                      Editar
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
