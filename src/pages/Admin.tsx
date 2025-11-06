import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navbar } from "@/components/Navbar";
import { Users, Trophy, DollarSign, MessageSquare, Shield } from "lucide-react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";

export default function Admin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'stats' | 'users'>('stats');
  const [users, setUsers] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalTeams: 0,
    totalTournaments: 0,
    totalRevenue: 0,
    totalPosts: 0
  });

  useEffect(() => {
    checkAdminRole();
    fetchMetrics();
    if (selectedTab === 'users') {
      fetchUsers();
    }
  }, [user, selectedTab]);

  const checkAdminRole = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    setIsAdmin(!!data);
    setLoading(false);
  };

  const fetchMetrics = async () => {
    try {
      const [users, teams, tournaments, payments, posts] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("teams").select("*", { count: "exact", head: true }),
        supabase.from("tournaments").select("*", { count: "exact", head: true }),
        supabase.from("payments").select("amount").eq("status", "completed"),
        supabase.from("posts").select("*", { count: "exact", head: true })
      ]);

      const totalRevenue = payments.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      setMetrics({
        totalUsers: users.count || 0,
        totalTeams: teams.count || 0,
        totalTournaments: tournaments.count || 0,
        totalRevenue,
        totalPosts: posts.count || 0
      });
    } catch (error) {
      toast.error("Erro ao carregar métricas");
    }
  };

  const fetchUsers = async () => {
    try {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, username, full_name, created_at")
        .order("created_at", { ascending: false });

      if (profilesData) {
        const usersWithRoles = await Promise.all(
          profilesData.map(async (profile) => {
            const { data: rolesData } = await supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", profile.id);

            return {
              ...profile,
              roles: rolesData?.map(r => r.role) || [],
            };
          })
        );
        setUsers(usersWithRoles);
      }
    } catch (error) {
      toast.error("Erro ao carregar usuários");
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      await supabase.from("user_roles").delete().eq("user_id", userId);

      const { error } = await supabase
        .from("user_roles")
        .insert([{ user_id: userId, role: newRole as any }]);

      if (error) throw error;

      toast.success("Role atualizada com sucesso!");
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar role");
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

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Painel Administrativo</h1>
        </div>

        <div className="flex gap-4 mb-6">
          <Button
            variant={selectedTab === 'stats' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('stats')}
          >
            Estatísticas
          </Button>
          <Button
            variant={selectedTab === 'users' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('users')}
          >
            Gerenciar Usuários
          </Button>
        </div>

        {selectedTab === 'stats' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalUsers}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Times</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalTeams}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Torneios</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalTournaments}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${metrics.totalRevenue.toFixed(2)}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Atividade da Comunidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{metrics.totalPosts}</p>
                <p className="text-sm text-muted-foreground">Posts totais criados</p>
              </CardContent>
            </Card>
          </>
        )}

        {selectedTab === 'users' && (
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Nome Completo</TableHead>
                    <TableHead>Role Atual</TableHead>
                    <TableHead>Alterar Role</TableHead>
                    <TableHead>Data de Registro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.username}</TableCell>
                      <TableCell>{u.full_name || '-'}</TableCell>
                      <TableCell>
                        {u.roles.map((role: string) => (
                          <Badge key={role} variant="outline" className="mr-1">
                            {role}
                          </Badge>
                        ))}
                      </TableCell>
                      <TableCell>
                        <Select
                          onValueChange={(value) => updateUserRole(u.id, value)}
                          defaultValue={u.roles[0] || 'visitor'}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="visitor">Visitor</SelectItem>
                            <SelectItem value="player">Player</SelectItem>
                            <SelectItem value="organizer">Organizer</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {new Date(u.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
