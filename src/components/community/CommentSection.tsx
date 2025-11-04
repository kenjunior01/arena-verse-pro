import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Comment {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

export const CommentSection = ({ postId, onCommentAdded }: { postId: string; onCommentAdded?: () => void }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*, profiles(username, avatar_url)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (data) setComments(data as any);
  };

  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return;

    try {
      setLoading(true);
      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        author_id: user.id,
        content: newComment.trim(),
      });

      if (error) throw error;

      setNewComment("");
      fetchComments();
      onCommentAdded?.();
      toast.success("Comentário adicionado");
    } catch (error) {
      toast.error("Erro ao adicionar comentário");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      fetchComments();
      onCommentAdded?.();
      toast.success("Comentário deletado");
    } catch (error) {
      toast.error("Erro ao deletar comentário");
    }
  };

  return (
    <div className="mt-4 space-y-3 border-t pt-4">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-card flex items-center justify-center flex-shrink-0">
            {comment.profiles.avatar_url ? (
              <img
                src={comment.profiles.avatar_url}
                alt={comment.profiles.username}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span className="text-xs font-bold">
                {comment.profiles.username[0].toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 bg-muted/30 rounded-lg p-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold">{comment.profiles.username}</span>
              <span className="text-xs text-muted-foreground">
                {format(new Date(comment.created_at), "dd/MM HH:mm", { locale: ptBR })}
              </span>
              {user?.id === comment.author_id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteComment(comment.id)}
                  className="ml-auto h-6 w-6 p-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
            <p className="text-sm">{comment.content}</p>
          </div>
        </div>
      ))}

      {user && (
        <div className="flex gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Adicione um comentário..."
            rows={2}
            maxLength={500}
          />
          <Button
            onClick={handleAddComment}
            disabled={loading || !newComment.trim()}
            className="self-end"
          >
            Comentar
          </Button>
        </div>
      )}
    </div>
  );
};
