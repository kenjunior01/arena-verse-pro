import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Upload } from "lucide-react";
import { z } from "zod";

const tournamentSchema = z.object({
  name: z.string().min(3).max(100),
  game: z.string().min(2).max(50),
  description: z.string().max(1000).optional(),
  max_teams: z.number().min(2).max(128),
  entry_fee: z.number().min(0),
  prize_pool: z.number().min(0),
});

export const CreateTournamentDialog = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    game: "",
    description: "",
    format: "single_elimination",
    max_teams: 16,
    entry_fee: 0,
    prize_pool: 0,
    start_date: "",
    registration_deadline: "",
  });

  const handleSubmit = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const validation = tournamentSchema.safeParse({
        ...formData,
        max_teams: Number(formData.max_teams),
        entry_fee: Number(formData.entry_fee),
        prize_pool: Number(formData.prize_pool),
      });
      
      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        return;
      }

      let bannerUrl = "";
      
      if (bannerFile) {
        const fileExt = bannerFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('banners')
          .upload(`tournaments/${fileName}`, bannerFile);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('banners')
          .getPublicUrl(`tournaments/${fileName}`);
        
        bannerUrl = publicUrl;
      }

      const { error } = await supabase.from("tournaments").insert({
        name: formData.name,
        game: formData.game,
        description: formData.description,
        format: formData.format as any,
        max_teams: formData.max_teams,
        entry_fee: formData.entry_fee,
        prize_pool: formData.prize_pool,
        start_date: formData.start_date || null,
        registration_deadline: formData.registration_deadline || null,
        banner_url: bannerUrl,
        organizer_id: user.id,
        status: 'draft',
      });

      if (error) throw error;

      toast.success("Torneio criado com sucesso!");
      setOpen(false);
      setStep(1);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar torneio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="hero" className="gap-2">
          <Plus className="h-5 w-5" />
          Criar Torneio
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Torneio - Passo {step}/3</DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Torneio *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Campeonato de Verão"
                required
              />
            </div>

            <div>
              <Label htmlFor="game">Jogo *</Label>
              <Input
                id="game"
                value={formData.game}
                onChange={(e) => setFormData({ ...formData, game: e.target.value })}
                placeholder="League of Legends, CS2, Valorant..."
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o torneio..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="banner">Banner</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => document.getElementById('banner')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {bannerFile ? bannerFile.name : "Escolher banner"}
              </Button>
              <Input
                id="banner"
                type="file"
                accept="image/*"
                onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </div>

            <Button onClick={() => setStep(2)} className="w-full">
              Próximo
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="format">Formato *</Label>
              <Select
                value={formData.format}
                onValueChange={(value) => setFormData({ ...formData, format: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single_elimination">Eliminação Simples</SelectItem>
                  <SelectItem value="double_elimination">Eliminação Dupla</SelectItem>
                  <SelectItem value="round_robin">Pontos Corridos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="max_teams">Número Máximo de Times *</Label>
              <Input
                id="max_teams"
                type="number"
                min="2"
                max="128"
                value={formData.max_teams}
                onChange={(e) => setFormData({ ...formData, max_teams: parseInt(e.target.value) })}
                required
              />
            </div>

            <div>
              <Label htmlFor="registration_deadline">Prazo de Inscrição</Label>
              <Input
                id="registration_deadline"
                type="datetime-local"
                value={formData.registration_deadline}
                onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="start_date">Data de Início</Label>
              <Input
                id="start_date"
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="w-full">
                Voltar
              </Button>
              <Button onClick={() => setStep(3)} className="w-full">
                Próximo
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="entry_fee">Taxa de Inscrição (USD)</Label>
              <Input
                id="entry_fee"
                type="number"
                min="0"
                step="0.01"
                value={formData.entry_fee}
                onChange={(e) => setFormData({ ...formData, entry_fee: parseFloat(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="prize_pool">Premiação Total (USD)</Label>
              <Input
                id="prize_pool"
                type="number"
                min="0"
                step="0.01"
                value={formData.prize_pool}
                onChange={(e) => setFormData({ ...formData, prize_pool: parseFloat(e.target.value) })}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)} className="w-full">
                Voltar
              </Button>
              <Button onClick={handleSubmit} disabled={loading} className="w-full">
                {loading ? "Criando..." : "Criar Torneio"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
