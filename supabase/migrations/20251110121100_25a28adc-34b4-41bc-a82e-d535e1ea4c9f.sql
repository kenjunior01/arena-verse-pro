-- Criar conta admin se não existir (através de trigger)
-- Nota: Como não podemos criar usuários diretamente via SQL no auth.users,
-- vamos garantir que quando o usuário admin@bellvion.store se registrar,
-- ele automaticamente receba as roles corretas

-- Função para promover admin automaticamente
CREATE OR REPLACE FUNCTION public.auto_promote_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Se o email for admin@bellvion.store, adicionar roles de admin e organizer
  IF NEW.email = 'admin@bellvion.store' THEN
    -- Primeiro remove a role visitor padrão
    DELETE FROM public.user_roles WHERE user_id = NEW.id AND role = 'visitor';
    
    -- Adiciona role admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Adiciona role organizer
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'organizer')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para promover admin automaticamente
DROP TRIGGER IF EXISTS auto_promote_admin_trigger ON auth.users;
CREATE TRIGGER auto_promote_admin_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_promote_admin();