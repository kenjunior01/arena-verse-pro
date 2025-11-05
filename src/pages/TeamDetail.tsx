import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Crown, LogOut } from "lucide-react";
import { InviteMemberDialog } from "@/components/teams/InviteMemberDialog";
import { ChatBox } from "@/components/chat/ChatBox";
import { toast } from "sonner";

interface Team {
  id: string;
  name: string;
  tag: string;
  logo_url: string | null;
  description: string | null;
  owner_id: string;
}

interface Member {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

export default function TeamDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchTeamDetails();
    }
  }, [id, user]);

  const fetchTeamDetails = async () => {
    try {
      const { data: teamData } = await supabase
        .from("teams")
        .select("*")
        .eq("id", id)
        .single();

      if (teamData) {
        setTeam(teamData);
        setIsOwner(user?.id === teamData.owner_id);
      }

      const { data: membersData } = await supabase
        .from("team_members")
        .select("*, profiles(username, avatar_url)")
        .eq("team_id", id)
        .eq("status", "accepted");

      if (membersData) {
        setMembers(membersData as any);
        setIsMember(membersData.some((m) => m.user_id === user?.id));
      }

      // Get or create chat for team
      const { data: chatData } = await supabase
        .from("chats")
        .select("id")
        .eq("team_id", id)
        .eq("type", "team")
        .single();

      if (chatData) {
        setChatId(chatData.id);
      } else {
        // Create chat if doesn't exist
        const { data: newChat } = await supabase
          .from("chats")
          .insert({ team_id: id, type: "team", name: `Chat ${teamData?.name}` })
          .select()
          .single();
        
        if (newChat) setChatId(newChat.id);
      }
    } catch (error) {
      console.error("Error fetching team:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;

      toast.success("Membro removido");
      fetchTeamDetails();
    } catch (error) {
      toast.error("Erro ao remover membro");
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

  if (!team) {
    return <Navigate to="/teams" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Team Header */}
        <Card className="mb-8 border-primary/20">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="h-32 w-32 rounded-lg bg-gradient-card flex items-center justify-center border border-primary/20">
                {team.logo_url ? (
                  <img
                    src={team.logo_url}
                    alt={team.name}
                    className="h-full w-full object-cover rounded-lg"
                  />
                ) : (
                  <Shield className="h-16 w-16 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold">{team.name}</h1>
                  <Badge variant="outline" className="text-lg px-3">
                    [{team.tag}]
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-4">
                  {team.description || "Sem descrição disponível"}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{members.length} membros</span>
                </div>
              </div>
              {isOwner && <InviteMemberDialog teamId={team.id} onSuccess={fetchTeamDetails} />}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Members */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Membros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center">
                          {member.profiles.avatar_url ? (
                            <img
                              src={member.profiles.avatar_url}
                              alt={member.profiles.username}
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-bold">
                              {member.profiles.username[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold flex items-center gap-1">
                            {member.profiles.username}
                            {member.user_id === team.owner_id && (
                              <Crown className="h-3 w-3 text-yellow-500" />
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                      {isOwner && member.user_id !== team.owner_id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          <LogOut className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat */}
          <div className="lg:col-span-2">
            {isMember && chatId ? (
              <ChatBox chatId={chatId} title="Chat do Time" />
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Apenas membros do time podem ver o chat
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
