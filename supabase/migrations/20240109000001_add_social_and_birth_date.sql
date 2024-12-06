-- Adiciona colunas para redes sociais e data de nascimento
alter table profiles add column if not exists instagram text;
alter table profiles add column if not exists linkedin text;
alter table profiles add column if not exists birth_date date;
