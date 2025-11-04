import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { z } from "zod";

const streamSchema = z.object({
  title: z.string().min(3).max(100),
  stream_url: z.string().url("URL inválida"),
  platform: z.enum(["youtube", "twitch"]),
});

export const AddStreamDialog = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    stream_url: "",
    platform: "youtube",
    is_live: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      
      const validation = streamSchema.safeParse(formData);
      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        return;
      }

      const { error } = await supabase.from("live_streams").insert({
        ...formData,
        created_by: user.id,
      });

      if (error) throw error;

      toast.success("Stream adicionada com sucesso!");
      setOpen(false);
      setFormData({
        title: "",
        description: "",
        stream_url: "",
        platform: "youtube",
        is_live: false,
      });
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Erro ao adicionar stream");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="hero" className="gap-2">
          <Plus className="h-5 w-5" />
          Adicionar Stream
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Nova Stream</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Final do Campeonato"
              required
            />
          </div>

          <div>
            <Label htmlFor="platform">Plataforma *</Label>
            <Select
              value={formData.platform}
              onValueChange={(value) => setFormData({ ...formData, platform: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="twitch">Twitch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="stream_url">URL da Stream *</Label>
            <Input
              id="stream_url"
              type="url"
              value={formData.stream_url}
              onChange={(e) => setFormData({ ...formData, stream_url: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva a stream..."
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="is_live"
              checked={formData.is_live}
              onCheckedChange={(checked) => setFormData({ ...formData, is_live: checked })}
            />
            <Label htmlFor="is_live">Ao vivo agora</Label>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adicionando..." : "Adicionar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
