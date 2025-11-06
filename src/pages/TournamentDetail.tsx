import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Calendar, Users, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MatchManager } from "@/components/matches/MatchManager";
import { PlayerStatsManager } from "@/components/stats/PlayerStatsManager";
import { ChatBox } from "@/components/chat/ChatBox";
import { PaymentDialog } from "@/components/payments/PaymentDialog";
import { toast } from "sonner";

interface Tournament {
  id: string;
  name: string;
  description: string | null;
  game: string;
  format: string;
  status: string;
  max_teams: number;
  prize_pool: number | null;
  entry_fee: number | null;
  banner_url: string | null;
  start_date: string | null;
  end_date: string | null;
  registration_deadline: string | null;
  organizer_id: string;
  rules: string | null;
}

export default function TournamentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [userTeams, setUserTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchTournamentDetails();
    }
  }, [id, user]);

  const fetchTournamentDetails = async () => {
    try {
      const { data: tournamentData } = await supabase
        .from("tournaments")
        .select("*")
        .eq("id", id)
        .single();

      if (tournamentData) {
        setTournament(tournamentData);
        setIsOrganizer(user?.id === tournamentData.organizer_id);
      }

      // Check if user's team is registered
      if (user) {
        const { data: teamsData } = await supabase
          .from("team_members")
          .select("team_id, teams(*)")
          .eq("user_id", user.id)
          .eq("status", "accepted");

        if (teamsData) {
          setUserTeams(teamsData.map((t: any) => t.teams));

          const teamIds = teamsData.map((t: any) => t.team_id);
          const { data: registrations } = await supabase
            .from("tournament_participants")
            .select("*")
            .eq("tournament_id", id)
            .in("team_id", teamIds);

          setIsRegistered(!!registrations && registrations.length > 0);

          // Check payment status
          if (tournamentData?.entry_fee && tournamentData.entry_fee > 0) {
            const { data: paymentData } = await supabase
              .from("payments")
              .select("*")
              .eq("tournament_id", id)
              .eq("user_id", user.id)
              .eq("status", "completed")
              .single();

            setHasPaid(!!paymentData);
          } else {
            setHasPaid(true); // No payment required
          }
        }
      }

      // Get or create chat
      const { data: chatData } = await supabase
        .from("chats")
        .select("id")
        .eq("tournament_id", id)
        .eq("type", "tournament")
        .single();

      if (chatData) {
        setChatId(chatData.id);
      } else {
        const { data: newChat } = await supabase
          .from("chats")
          .insert({
            tournament_id: id,
            type: "tournament",
            name: `Chat ${tournamentData?.name}`,
          })
          .select()
          .single();

        if (newChat) setChatId(newChat.id);
      }
    } catch (error) {
      console.error("Error fetching tournament:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterTeam = async (teamId: string) => {
    try {
      const { error } = await supabase.from("tournament_participants").insert({
        tournament_id: id,
        team_id: teamId,
        status: "registered",
      });

      if (error) throw error;

      toast.success("Time inscrito com sucesso!");
      fetchTournamentDetails();
    } catch (error: any) {
      toast.error(error.message || "Erro ao inscrever time");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return <Navigate to="/tournaments" replace />;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "registration_open":
        return "bg-primary";
      case "in_progress":
        return "bg-secondary";
      case "completed":
        return "bg-muted";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Tournament Header */}
        <Card className="mb-8 overflow-hidden border-primary/20">
          {tournament.banner_url && (
            <div className="h-64 w-full relative">
              <img
                src={tournament.banner_url}
                alt={tournament.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
            </div>
          )}
          <CardContent className="p-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold">{tournament.name}</h1>
                  <Badge className={getStatusColor(tournament.status)}>
                    {tournament.status}
                  </Badge>
                </div>
                <p className="text-xl text-muted-foreground mb-4">{tournament.game}</p>
              </div>
              {!isRegistered && tournament.status === "registration_open" && userTeams.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground mb-2">Inscrever time:</p>
                  {userTeams.map((team) => (
                    <Button
                      key={team.id}
                      variant="hero"
                      onClick={() => handleRegisterTeam(team.id)}
                    >
                      Inscrever {team.name}
                    </Button>
                  ))}
                </div>
              )}
              {isRegistered && !hasPaid && tournament.entry_fee && tournament.entry_fee > 0 && (
                <PaymentDialog
                  tournamentId={tournament.id}
                  amount={tournament.entry_fee}
                  onSuccess={fetchTournamentDetails}
                />
              )}
              {isRegistered && hasPaid && (
                <Badge variant="outline" className="text-lg px-4 py-2">
                  ✓ Inscrito e Pago
                </Badge>
              )}
              {isRegistered && !tournament.entry_fee && (
                <Badge variant="outline" className="text-lg px-4 py-2">
                  ✓ Inscrito
                </Badge>
              )}
            </div>

            <p className="text-muted-foreground mb-6">{tournament.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {tournament.start_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Início</p>
                    <p className="font-semibold">
                      {format(new Date(tournament.start_date), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Times</p>
                  <p className="font-semibold">Até {tournament.max_teams}</p>
                </div>
              </div>
              {tournament.prize_pool && tournament.prize_pool > 0 && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-sm text-muted-foreground">Premiação</p>
                    <p className="font-semibold text-accent">${tournament.prize_pool}</p>
                  </div>
                </div>
              )}
              {tournament.entry_fee && tournament.entry_fee > 0 && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Taxa</p>
                    <p className="font-semibold">${tournament.entry_fee}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="matches">Partidas</TabsTrigger>
            <TabsTrigger value="stats">Estatísticas</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Detalhes do Torneio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Formato</h3>
                  <p className="text-muted-foreground">{tournament.format}</p>
                </div>
                {tournament.rules && (
                  <div>
                    <h3 className="font-semibold mb-2">Regras</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{tournament.rules}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="matches" className="mt-6">
            <MatchManager tournamentId={tournament.id} isOrganizer={isOrganizer} />
          </TabsContent>

          <TabsContent value="stats" className="mt-6">
            <PlayerStatsManager tournamentId={tournament.id} />
          </TabsContent>

          <TabsContent value="chat" className="mt-6">
            {chatId ? (
              <ChatBox chatId={chatId} title="Chat do Torneio" />
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Chat não disponível</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
