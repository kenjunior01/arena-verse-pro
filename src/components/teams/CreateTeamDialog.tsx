import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Upload } from "lucide-react";
import { z } from "zod";

const teamSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(50),
  tag: z.string().min(2, "Tag deve ter no mínimo 2 caracteres").max(10),
  description: z.string().max(500).optional(),
});

export const CreateTeamDialog = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    tag: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      
      const validation = teamSchema.safeParse(formData);
      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        return;
      }

      let logoUrl = "";
      
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from('banners')
          .upload(`teams/${fileName}`, logoFile);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('banners')
          .getPublicUrl(`teams/${fileName}`);
        
        logoUrl = publicUrl;
      }

      const { error } = await supabase.from("teams").insert({
        name: formData.name,
        tag: formData.tag,
        description: formData.description,
        logo_url: logoUrl,
        owner_id: user.id,
      });

      if (error) throw error;

      toast.success("Time criado com sucesso!");
      setOpen(false);
      setFormData({ name: "", tag: "", description: "" });
      setLogoFile(null);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar time");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="hero" className="gap-2">
          <Plus className="h-5 w-5" />
          Criar Time
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Time</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Time *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Meu Time Incrível"
              required
              maxLength={50}
            />
          </div>

          <div>
            <Label htmlFor="tag">Tag *</Label>
            <Input
              id="tag"
              value={formData.tag}
              onChange={(e) => setFormData({ ...formData, tag: e.target.value.toUpperCase() })}
              placeholder="MTI"
              required
              maxLength={10}
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva seu time..."
              rows={3}
              maxLength={500}
            />
          </div>

          <div>
            <Label htmlFor="logo">Logo do Time</Label>
            <div className="flex items-center gap-2">
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => document.getElementById('logo')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {logoFile ? logoFile.name : "Escolher logo"}
              </Button>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Time"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
