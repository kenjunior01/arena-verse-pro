import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, Trophy, Users } from "lucide-react";

interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  country: string | null;
  favorite_game: string | null;
  total_wins: number;
  total_losses: number;
  total_tournaments: number;
}

const Profile = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    country: "",
    favorite_game: "",
  });

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      setProfile(data);
      setFormData({
        full_name: data.full_name || "",
        bio: data.bio || "",
        country: data.country || "",
        favorite_game: data.favorite_game || "",
      });
    } catch (error) {
      toast.error("Erro ao carregar perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);

      let avatarUrl = profile?.avatar_url;

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(`${user.id}/${fileName}`, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(`${user.id}/${fileName}`);

        avatarUrl = publicUrl;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          ...formData,
          avatar_url: avatarUrl,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Perfil atualizado!");
      setEditing(false);
      fetchProfile();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <p>Perfil não encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="container mx-auto max-w-4xl">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="h-24 w-24 rounded-full bg-gradient-primary flex items-center justify-center">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-primary-foreground">
                  {profile.username[0].toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{profile.username}</h1>
              {profile.full_name && (
                <p className="text-muted-foreground">{profile.full_name}</p>
              )}
            </div>
            {isOwnProfile && !editing && (
              <Button onClick={() => setEditing(true)}>Editar Perfil</Button>
            )}
          </CardHeader>

          <CardContent>
            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Foto de Perfil</Label>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => document.getElementById('avatar')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {avatarFile ? avatarFile.name : "Escolher foto"}
                  </Button>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </div>

                <div>
                  <Label htmlFor="full_name">Nome Completo</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="country">País</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="favorite_game">Jogo Favorito</Label>
                  <Input
                    id="favorite_game"
                    value={formData.favorite_game}
                    onChange={(e) => setFormData({ ...formData, favorite_game: e.target.value })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {profile.bio && (
                  <div>
                    <h3 className="font-semibold mb-2">Sobre</h3>
                    <p className="text-muted-foreground">{profile.bio}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {profile.country && (
                    <div>
                      <h3 className="font-semibold mb-1">País</h3>
                      <p className="text-muted-foreground">{profile.country}</p>
                    </div>
                  )}
                  {profile.favorite_game && (
                    <div>
                      <h3 className="font-semibold mb-1">Jogo Favorito</h3>
                      <p className="text-muted-foreground">{profile.favorite_game}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <Trophy className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{profile.total_wins}</p>
                    <p className="text-sm text-muted-foreground">Vitórias</p>
                  </div>
                  <div className="text-center">
                    <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{profile.total_tournaments}</p>
                    <p className="text-sm text-muted-foreground">Torneios</p>
                  </div>
                  <div className="text-center">
                    <Trophy className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-2xl font-bold">{profile.total_losses}</p>
                    <p className="text-sm text-muted-foreground">Derrotas</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
