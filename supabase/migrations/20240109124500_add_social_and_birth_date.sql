-- Adiciona colunas para redes sociais e data de nascimento
alter table public.profiles add column if not exists instagram text default null;
alter table public.profiles add column if not exists linkedin text default null;
alter table public.profiles add column if not exists birth_date date default null;
