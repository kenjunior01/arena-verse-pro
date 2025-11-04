import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { CreatePostDialog } from "@/components/community/CreatePostDialog";
import { PostCard } from "@/components/community/PostCard";

const Community = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data } = await supabase
        .from("posts")
        .select("*, profiles(username, avatar_url)")
        .order("created_at", { ascending: false });

      if (data) setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Comunidade</h1>
            <p className="text-muted-foreground">
              Conecte-se com outros jogadores e compartilhe suas experiências
            </p>
          </div>
          <CreatePostDialog onSuccess={fetchPosts} />
        </div>

        <div className="grid gap-6">
          {loading ? (
            <p>Carregando...</p>
          ) : posts.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Nenhum post ainda</h3>
                <p className="text-muted-foreground">
                  Seja o primeiro a compartilhar algo!
                </p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} onDelete={fetchPosts} />
            ))
          )}
        </div>

        <Card className="mt-8 text-center py-8 border-primary/20">
          <CardContent>
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Em Breve: Feed Social Completo</h3>
            <p className="text-muted-foreground">
              Posts, comentários, curtidas e muito mais estão a caminho!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Community;
