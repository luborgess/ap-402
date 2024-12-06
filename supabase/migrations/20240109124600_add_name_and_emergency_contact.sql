-- Adiciona colunas para nome e contato de emergência
alter table public.profiles add column if not exists full_name text default null;
alter table public.profiles add column if not exists emergency_contact_name text default null;
alter table public.profiles add column if not exists emergency_contact_phone text default null;
alter table public.profiles add column if not exists emergency_contact_relation text default null;
