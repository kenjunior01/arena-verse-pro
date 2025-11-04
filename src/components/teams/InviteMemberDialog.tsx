import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

export const InviteMemberDialog = ({ teamId, onSuccess }: { teamId: string; onSuccess?: () => void }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("id")
        .ilike("username", email)
        .single();

      if (userError) {
        toast.error("Usuário não encontrado");
        return;
      }

      const { data: currentUser } = await supabase.auth.getUser();
      
      const { error } = await supabase.from("team_invites").insert({
        team_id: teamId,
        user_id: userData.id,
        invited_by: currentUser.user?.id,
      });

      if (error) throw error;

      toast.success("Convite enviado!");
      setOpen(false);
      setEmail("");
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Erro ao enviar convite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <UserPlus className="h-4 w-4" />
          Convidar Membro
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convidar Membro para o Time</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <Label htmlFor="email">Nome de usuário</Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite o nome de usuário"
              required
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Enviando..." : "Enviar Convite"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
