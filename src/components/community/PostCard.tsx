import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CommentSection } from "./CommentSection";

interface Profile {
  username: string;
  avatar_url: string | null;
}

interface Post {
  id: string;
  content: string;
  image_url: string | null;
  author_id: string;
  created_at: string;
  profiles: Profile;
}

export const PostCard = ({ post, onDelete }: { post: Post; onDelete?: () => void }) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    fetchLikes();
    fetchComments();
  }, [post.id]);

  const fetchLikes = async () => {
    const { data, count } = await supabase
      .from("likes")
      .select("*", { count: "exact" })
      .eq("post_id", post.id);

    setLikeCount(count || 0);
    if (user) {
      setLiked(data?.some(like => like.user_id === user.id) || false);
    }
  };

  const fetchComments = async () => {
    const { count } = await supabase
      .from("comments")
      .select("*", { count: "exact" })
      .eq("post_id", post.id);

    setCommentCount(count || 0);
  };

  const handleLike = async () => {
    if (!user) {
      toast.error("Faça login para curtir");
      return;
    }

    try {
      if (liked) {
        await supabase
          .from("likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", user.id);
        setLiked(false);
        setLikeCount(prev => prev - 1);
      } else {
        await supabase.from("likes").insert({
          post_id: post.id,
          user_id: user.id,
        });
        setLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error) {
      toast.error("Erro ao curtir post");
    }
  };

  const handleDelete = async () => {
    if (!user || user.id !== post.author_id) return;

    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", post.id);

      if (error) throw error;

      toast.success("Post deletado");
      onDelete?.();
    } catch (error) {
      toast.error("Erro ao deletar post");
    }
  };

  return (
    <Card className="border-primary/20">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
            {post.profiles.avatar_url ? (
              <img
                src={post.profiles.avatar_url}
                alt={post.profiles.username}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span className="text-lg font-bold text-primary-foreground">
                {post.profiles.username[0].toUpperCase()}
              </span>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold">{post.profiles.username}</span>
              <span className="text-sm text-muted-foreground">
                {format(new Date(post.created_at), "dd 'de' MMM, HH:mm", { locale: ptBR })}
              </span>
              {user?.id === post.author_id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="ml-auto"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <p className="text-sm mb-4 whitespace-pre-wrap">{post.content}</p>
            
            {post.image_url && (
              <img
                src={post.image_url}
                alt="Post"
                className="rounded-lg max-h-96 w-full object-cover mb-4"
              />
            )}
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <button
                className={`flex items-center gap-1 hover:text-primary transition-smooth ${
                  liked ? "text-primary" : ""
                }`}
                onClick={handleLike}
              >
                <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
                <span>{likeCount}</span>
              </button>
              <button
                className="flex items-center gap-1 hover:text-primary transition-smooth"
                onClick={() => setShowComments(!showComments)}
              >
                <MessageSquare className="h-4 w-4" />
                <span>{commentCount}</span>
              </button>
            </div>

            {showComments && (
              <CommentSection postId={post.id} onCommentAdded={fetchComments} />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
