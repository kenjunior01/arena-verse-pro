import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Gamepad2, TvMinimalPlay, Home } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const Navbar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navLinks = [
    { path: "/", label: "Início", icon: Home },
    { path: "/tournaments", label: "Torneios", icon: Trophy },
    { path: "/teams", label: "Times", icon: Users },
    { path: "/community", label: "Comunidade", icon: Gamepad2 },
    { path: "/streams", label: "Lives", icon: TvMinimalPlay },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary shadow-glow-primary">
              <Trophy className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Esports Arena
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.path} to={link.path}>
                  <Button
                    variant={isActive(link.path) ? "default" : "ghost"}
                    size="sm"
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link to="/profile">
                  <Button variant="outline" size="sm">
                    Perfil
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={signOut}>
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="outline" size="sm">
                    Entrar
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm">
                    Registrar
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
