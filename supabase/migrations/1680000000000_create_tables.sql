-- Supabase migration: create users, projects, votes, comments tables
-- Generated from prisma/schema.prisma

create table if not exists users (
  id text primary key,
  github_id integer unique,
  username text not null,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists projects (
  id text primary key,
  title text not null,
  tagline text not null,
  url text,
  confession text not null,
  image_url text,
  logo_url text,
  gallery_urls jsonb,
  tags text not null,
  failure_type text,
  created_at timestamptz default now(),
  author_id text not null references users(id) on delete cascade
);

create table if not exists votes (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  project_id text not null references projects(id) on delete cascade,
  created_at timestamptz default now(),
  constraint unique_user_project unique (user_id, project_id)
);

create table if not exists comments (
  id text primary key,
  content text not null,
  user_id text not null references users(id) on delete cascade,
  project_id text not null references projects(id) on delete cascade,
  parent_id text references comments(id) on delete cascade,
  is_pinned boolean default false,
  created_at timestamptz default now()
);

-- Indexes to speed queries
create index if not exists idx_projects_author_id on projects(author_id);
create index if not exists idx_votes_project_id on votes(project_id);
create index if not exists idx_comments_project_id on comments(project_id);
create index if not exists idx_comments_parent_id on comments(parent_id);
