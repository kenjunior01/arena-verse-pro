import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PlayerStat {
  id: string;
  user_id: string;
  kills: number;
  deaths: number;
  assists: number;
  matches_played: number;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

interface PlayerStatsManagerProps {
  tournamentId: string;
}

export const PlayerStatsManager = ({ tournamentId }: PlayerStatsManagerProps) => {
  const [stats, setStats] = useState<PlayerStat[]>([]);

  useEffect(() => {
    fetchStats();
  }, [tournamentId]);

  const fetchStats = async () => {
    const { data } = await supabase
      .from("player_stats")
      .select("*, profiles(username, avatar_url)")
      .eq("tournament_id", tournamentId)
      .order("kills", { ascending: false });

    if (data) setStats(data as any);
  };

  const calculateKDA = (kills: number, deaths: number, assists: number) => {
    if (deaths === 0) return (kills + assists).toFixed(2);
    return ((kills + assists) / deaths).toFixed(2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estatísticas dos Jogadores</CardTitle>
      </CardHeader>
      <CardContent>
        {stats.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            Nenhuma estatística registrada
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jogador</TableHead>
                <TableHead className="text-center">Partidas</TableHead>
                <TableHead className="text-center">K</TableHead>
                <TableHead className="text-center">D</TableHead>
                <TableHead className="text-center">A</TableHead>
                <TableHead className="text-center">KDA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((stat) => (
                <TableRow key={stat.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center">
                        {stat.profiles.avatar_url ? (
                          <img
                            src={stat.profiles.avatar_url}
                            alt={stat.profiles.username}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-bold">
                            {stat.profiles.username[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="font-medium">{stat.profiles.username}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{stat.matches_played}</TableCell>
                  <TableCell className="text-center text-green-500">{stat.kills}</TableCell>
                  <TableCell className="text-center text-red-500">{stat.deaths}</TableCell>
                  <TableCell className="text-center text-blue-500">{stat.assists}</TableCell>
                  <TableCell className="text-center font-bold">
                    {calculateKDA(stat.kills, stat.deaths, stat.assists)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
