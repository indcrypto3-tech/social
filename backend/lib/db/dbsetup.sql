-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.analytics_snapshots (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  platform USER-DEFINED NOT NULL,
  followers integer NOT NULL DEFAULT 0,
  impressions integer NOT NULL DEFAULT 0,
  engagement integer NOT NULL DEFAULT 0,
  date timestamp without time zone NOT NULL DEFAULT now(),
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT analytics_snapshots_pkey PRIMARY KEY (id),
  CONSTRAINT analytics_snapshots_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.media_library (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  url text NOT NULL,
  file_type character varying NOT NULL,
  file_size integer,
  file_name character varying,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT media_library_pkey PRIMARY KEY (id),
  CONSTRAINT media_library_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.notification_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type USER-DEFINED NOT NULL,
  payload jsonb,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT notification_events_pkey PRIMARY KEY (id),
  CONSTRAINT notification_events_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.notification_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email_post_failed boolean NOT NULL DEFAULT true,
  email_post_published boolean NOT NULL DEFAULT true,
  weekly_digest boolean NOT NULL DEFAULT false,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT notification_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT notification_preferences_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.post_destinations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  social_account_id uuid NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::destination_status,
  platform_post_id character varying,
  error_message text,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT post_destinations_pkey PRIMARY KEY (id),
  CONSTRAINT post_destinations_post_id_scheduled_posts_id_fk FOREIGN KEY (post_id) REFERENCES public.scheduled_posts(id)
);
CREATE TABLE public.publish_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  platform USER-DEFINED NOT NULL,
  status text NOT NULL,
  error_code text,
  error_message text,
  attempt integer NOT NULL DEFAULT 1,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT publish_logs_pkey PRIMARY KEY (id),
  CONSTRAINT publish_logs_post_id_scheduled_posts_id_fk FOREIGN KEY (post_id) REFERENCES public.scheduled_posts(id)
);
CREATE TABLE public.scheduled_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content text,
  scheduled_at timestamp without time zone NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'draft'::post_status,
  platform_configs jsonb,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  media_urls jsonb,
  CONSTRAINT scheduled_posts_pkey PRIMARY KEY (id),
  CONSTRAINT scheduled_posts_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  expires_at timestamp without time zone NOT NULL,
  ip_address character varying,
  user_agent text,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT sessions_pkey PRIMARY KEY (id),
  CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.social_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  platform USER-DEFINED NOT NULL,
  platform_account_id character varying NOT NULL,
  account_name character varying,
  access_token text NOT NULL,
  refresh_token text,
  token_expires_at timestamp without time zone,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  supports_refresh boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  CONSTRAINT social_accounts_pkey PRIMARY KEY (id),
  CONSTRAINT social_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.team_invites (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  email character varying NOT NULL,
  role USER-DEFINED NOT NULL DEFAULT 'viewer'::team_role,
  token text NOT NULL UNIQUE,
  expires_at timestamp without time zone NOT NULL,
  accepted_at timestamp without time zone,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT team_invites_pkey PRIMARY KEY (id),
  CONSTRAINT team_invites_team_id_teams_id_fk FOREIGN KEY (team_id) REFERENCES public.teams(id)
);
CREATE TABLE public.team_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role USER-DEFINED NOT NULL DEFAULT 'viewer'::team_role,
  joined_at timestamp without time zone NOT NULL DEFAULT now(),
  invited_at timestamp without time zone DEFAULT now(),
  CONSTRAINT team_members_pkey PRIMARY KEY (id),
  CONSTRAINT team_members_team_id_teams_id_fk FOREIGN KEY (team_id) REFERENCES public.teams(id),
  CONSTRAINT team_members_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.teams (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  owner_id uuid NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT teams_pkey PRIMARY KEY (id),
  CONSTRAINT teams_owner_id_users_id_fk FOREIGN KEY (owner_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  email character varying NOT NULL UNIQUE,
  full_name character varying,
  password_hash character varying,
  subscription_tier USER-DEFINED DEFAULT 'free'::subscription_tier,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  timezone character varying DEFAULT 'UTC'::character varying,
  avatar_url text,
  subscription_plan text,
  subscription_status text,
  stripe_customer_id text,
  stripe_subscription_id text,
  refresh_at timestamp without time zone,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.waitlist (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email character varying NOT NULL UNIQUE,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT waitlist_pkey PRIMARY KEY (id)
);