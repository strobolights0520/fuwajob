-- やりたいことマッピング DB schema draft
-- Source-backed job data comes from job tag "職業情報データベース".

create table if not exists source_files (
  source_file_id text primary key,
  source_name text not null,
  source_url text not null,
  file_name text not null,
  version text not null,
  published_on date,
  downloaded_on date not null,
  attribution text not null
);

create table if not exists jobs (
  job_id text primary key,
  source_job_id text not null unique,
  name text not null,
  description_short text,
  description text,
  how_to_get text,
  working_conditions text,
  source_url text not null,
  source_file text not null,
  source_version text not null,
  source_published_on date,
  is_active boolean not null default true
);

create table if not exists job_aliases (
  job_id text not null references jobs(job_id),
  alias_no integer not null,
  alias_name text not null,
  primary key (job_id, alias_no)
);

create table if not exists job_classifications (
  job_id text not null references jobs(job_id),
  classification_type text not null,
  classification_code text not null,
  primary key (job_id, classification_type, classification_code)
);

create table if not exists job_qualifications (
  job_id text not null references jobs(job_id),
  qualification_no integer not null,
  qualification_name text not null,
  primary key (job_id, qualification_no)
);

create table if not exists job_skills (
  job_id text not null references jobs(job_id),
  skill_name text not null,
  score numeric,
  irrelevant boolean not null default false,
  primary key (job_id, skill_name)
);

create table if not exists job_knowledge (
  job_id text not null references jobs(job_id),
  knowledge_name text not null,
  score numeric,
  irrelevant boolean not null default false,
  primary key (job_id, knowledge_name)
);

create table if not exists job_tasks (
  job_id text not null references jobs(job_id),
  task_no integer not null,
  task_text text not null,
  execution_rate numeric,
  importance numeric,
  primary key (job_id, task_no)
);

create table if not exists tags (
  tag_id text primary key,
  axis text not null check (axis in ('action', 'domain', 'style')),
  label text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp
);

create table if not exists tag_synonyms (
  synonym_id text primary key,
  tag_id text not null references tags(tag_id),
  surface text not null,
  normalized_surface text not null,
  source text not null check (source in ('manual', 'log_mined', 'llm_draft')),
  is_active boolean not null default true,
  unique (tag_id, normalized_surface)
);

create table if not exists tag_job_map (
  tag_id text not null references tags(tag_id),
  job_id text not null references jobs(job_id),
  weight numeric not null check (weight >= 0 and weight <= 1),
  source text not null check (source in ('manual', 'rule', 'llm_draft')),
  review_status text not null default 'draft' check (review_status in ('draft', 'approved', 'rejected')),
  reviewed_by text,
  reviewed_at timestamp,
  notes text,
  primary key (tag_id, job_id)
);

create table if not exists student_actions (
  action_id text primary key,
  job_id text not null references jobs(job_id),
  action_text text not null,
  category text not null check (category in ('baito', 'circle', 'production', 'qualification', 'research', 'volunteer', 'other')),
  priority integer not null default 100,
  source text not null default 'manual'
);

create table if not exists unmatched_logs (
  log_id text primary key,
  input_text text not null,
  normalized_text text not null,
  matched_tags_json text,
  top_score numeric,
  status text not null default 'pending' check (status in ('pending', 'synonym_added', 'new_tag', 'ignored')),
  created_at timestamp not null default current_timestamp
);

create table if not exists query_cache (
  input_hash text primary key,
  result_tags_json text not null,
  hit_count integer not null default 1,
  created_at timestamp not null default current_timestamp,
  expires_at timestamp
);

create index if not exists idx_jobs_name on jobs(name);
create index if not exists idx_job_skills_score on job_skills(skill_name, score);
create index if not exists idx_job_tasks_job_id on job_tasks(job_id);
create index if not exists idx_tag_synonyms_surface on tag_synonyms(normalized_surface);
create index if not exists idx_tag_job_map_tag_score on tag_job_map(tag_id, weight);
