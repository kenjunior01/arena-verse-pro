import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TvMinimalPlay, Eye } from "lucide-react";
import { AddStreamDialog } from "@/components/streams/AddStreamDialog";
import { useUserRoles } from "@/hooks/useUserRoles";

const Streams = () => {
  const [streams, setStreams] = useState<any[]>([]);
  const { canAddStreams } = useUserRoles();

  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    const { data } = await supabase
      .from("live_streams")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setStreams(data);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="container mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Lives e Transmissões</h1>
            <p className="text-muted-foreground">
              Assista às melhores partidas e transmissões dos torneios
            </p>
          </div>
          {canAddStreams && <AddStreamDialog onSuccess={fetchStreams} />}
        </div>

        {streams.length === 0 ? (
          <Card className="text-center py-12 border-primary/20">
            <CardContent>
              <TvMinimalPlay className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">
                Nenhuma transmissão disponível
              </h3>
              <p className="text-muted-foreground">
                Adicione uma transmissão para começar!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {streams.map((stream) => (
              <Card key={stream.id} className="overflow-hidden border-primary/20">
                <div className="relative aspect-video">
                  {stream.platform === "youtube" ? (
                    <iframe
                      src={stream.stream_url.replace("watch?v=", "embed/")}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  ) : (
                    <iframe
                      src={stream.stream_url}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  )}
                  {stream.is_live && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-destructive text-destructive-foreground animate-pulse">
                        AO VIVO
                      </Badge>
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md">
                    <Eye className="h-4 w-4" />
                    <span className="text-sm font-semibold">{stream.viewer_count || 0}</span>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{stream.title}</CardTitle>
                  {stream.description && (
                    <p className="text-sm text-muted-foreground">{stream.description}</p>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Streams;
