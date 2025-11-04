import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";

export const CreatePostDialog = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;

    try {
      setLoading(true);

      let imageUrl = "";
      
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('banners')
          .upload(`posts/${fileName}`, imageFile);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('banners')
          .getPublicUrl(`posts/${fileName}`);
        
        imageUrl = publicUrl;
      }

      const { error } = await supabase.from("posts").insert({
        content: content.trim(),
        image_url: imageUrl,
        author_id: user.id,
      });

      if (error) throw error;

      toast.success("Post criado com sucesso!");
      setOpen(false);
      setContent("");
      setImageFile(null);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="hero" className="gap-2">
          <Plus className="h-5 w-5" />
          Criar Post
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Novo Post</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="No que você está pensando?"
            rows={5}
            required
            maxLength={1000}
          />

          <div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => document.getElementById('post-image')?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              {imageFile ? imageFile.name : "Adicionar imagem (opcional)"}
            </Button>
            <Input
              id="post-image"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !content.trim()}>
              {loading ? "Publicando..." : "Publicar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
