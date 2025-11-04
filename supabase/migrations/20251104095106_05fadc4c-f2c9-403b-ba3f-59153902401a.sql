-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'organizer', 'player', 'visitor');

-- Create enum for tournament formats
CREATE TYPE public.tournament_format AS ENUM ('single_elimination', 'double_elimination', 'round_robin', 'swiss');

-- Create enum for tournament status
CREATE TYPE public.tournament_status AS ENUM ('draft', 'registration_open', 'registration_closed', 'in_progress', 'completed', 'cancelled');

-- Create enum for match status
CREATE TYPE public.match_status AS ENUM ('scheduled', 'in_progress', 'completed', 'disputed');

-- Create enum for team member status
CREATE TYPE public.member_status AS ENUM ('pending', 'accepted', 'rejected');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'visitor',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  country TEXT,
  favorite_game TEXT,
  total_wins INTEGER DEFAULT 0,
  total_losses INTEGER DEFAULT 0,
  total_tournaments INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tag TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (name),
  UNIQUE (tag)
);

-- Create team_members table
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member',
  status member_status DEFAULT 'accepted',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (team_id, user_id)
);

-- Create team_invites table
CREATE TABLE public.team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  invited_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status member_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (team_id, user_id)
);

-- Create tournaments table
CREATE TABLE public.tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  game TEXT NOT NULL,
  format tournament_format NOT NULL,
  status tournament_status DEFAULT 'draft',
  max_teams INTEGER NOT NULL,
  prize_pool DECIMAL(10, 2),
  entry_fee DECIMAL(10, 2) DEFAULT 0,
  banner_url TEXT,
  rules TEXT,
  organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tournament_participants table
CREATE TABLE public.tournament_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  seed INTEGER,
  status TEXT DEFAULT 'registered',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (tournament_id, team_id)
);

-- Create tournament_phases table
CREATE TABLE public.tournament_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phase_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tournament_matches table
CREATE TABLE public.tournament_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  phase_id UUID REFERENCES public.tournament_phases(id) ON DELETE CASCADE,
  team1_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  team2_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  winner_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  status match_status DEFAULT 'scheduled',
  scheduled_time TIMESTAMP WITH TIME ZONE,
  team1_score INTEGER DEFAULT 0,
  team2_score INTEGER DEFAULT 0,
  best_of INTEGER DEFAULT 1,
  match_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create player_stats table
CREATE TABLE public.player_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  kills INTEGER DEFAULT 0,
  deaths INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  matches_played INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, tournament_id)
);

-- Create posts table for social feed
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create likes table
CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);

-- Create chats table
CREATE TABLE public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create live_streams table
CREATE TABLE public.live_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  stream_url TEXT NOT NULL,
  platform TEXT NOT NULL,
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
  is_live BOOLEAN DEFAULT FALSE,
  viewer_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- RLS Policies for teams
CREATE POLICY "Teams are viewable by everyone"
ON public.teams FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create teams"
ON public.teams FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Team owners can update their teams"
ON public.teams FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Team owners can delete their teams"
ON public.teams FOR DELETE
USING (auth.uid() = owner_id);

-- RLS Policies for team_members
CREATE POLICY "Team members are viewable by everyone"
ON public.team_members FOR SELECT
USING (true);

CREATE POLICY "Team owners can manage members"
ON public.team_members FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.teams
    WHERE teams.id = team_members.team_id
    AND teams.owner_id = auth.uid()
  )
);

-- RLS Policies for team_invites
CREATE POLICY "Users can view their own invites"
ON public.team_invites FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = invited_by);

CREATE POLICY "Team owners can create invites"
ON public.team_invites FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.teams
    WHERE teams.id = team_invites.team_id
    AND teams.owner_id = auth.uid()
  )
);

CREATE POLICY "Invited users can update invites"
ON public.team_invites FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for tournaments
CREATE POLICY "Tournaments are viewable by everyone"
ON public.tournaments FOR SELECT
USING (true);

CREATE POLICY "Organizers and admins can create tournaments"
ON public.tournaments FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'organizer') OR 
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Organizers can update their tournaments"
ON public.tournaments FOR UPDATE
USING (auth.uid() = organizer_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Organizers can delete their tournaments"
ON public.tournaments FOR DELETE
USING (auth.uid() = organizer_id OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for tournament_participants
CREATE POLICY "Participants are viewable by everyone"
ON public.tournament_participants FOR SELECT
USING (true);

CREATE POLICY "Team members can register their team"
ON public.tournament_participants FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_members.team_id = tournament_participants.team_id
    AND team_members.user_id = auth.uid()
    AND team_members.status = 'accepted'
  )
);

-- RLS Policies for tournament_matches
CREATE POLICY "Matches are viewable by everyone"
ON public.tournament_matches FOR SELECT
USING (true);

CREATE POLICY "Organizers can manage matches"
ON public.tournament_matches FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.tournaments
    WHERE tournaments.id = tournament_matches.tournament_id
    AND (tournaments.organizer_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);

-- RLS Policies for posts
CREATE POLICY "Posts are viewable by everyone"
ON public.posts FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create posts"
ON public.posts FOR INSERT
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their posts"
ON public.posts FOR UPDATE
USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their posts"
ON public.posts FOR DELETE
USING (auth.uid() = author_id OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for comments
CREATE POLICY "Comments are viewable by everyone"
ON public.comments FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create comments"
ON public.comments FOR INSERT
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can delete their comments"
ON public.comments FOR DELETE
USING (auth.uid() = author_id OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for likes
CREATE POLICY "Likes are viewable by everyone"
ON public.likes FOR SELECT
USING (true);

CREATE POLICY "Users can manage their own likes"
ON public.likes FOR ALL
USING (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for live_streams
CREATE POLICY "Streams are viewable by everyone"
ON public.live_streams FOR SELECT
USING (true);

CREATE POLICY "Organizers and admins can create streams"
ON public.live_streams FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'organizer') OR 
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Creators can update their streams"
ON public.live_streams FOR UPDATE
USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for chats and messages
CREATE POLICY "Chat members can view messages"
ON public.chats FOR SELECT
USING (true);

CREATE POLICY "Chat messages are viewable by everyone"
ON public.chat_messages FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can send messages"
ON public.chat_messages FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments"
ON public.payments FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
BEFORE UPDATE ON public.teams
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tournaments_updated_at
BEFORE UPDATE ON public.tournaments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_matches_updated_at
BEFORE UPDATE ON public.tournament_matches
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_live_streams_updated_at
BEFORE UPDATE ON public.live_streams
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  
  -- Assign default visitor role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'visitor');
  
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_matches;