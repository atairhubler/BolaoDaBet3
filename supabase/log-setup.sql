-- Execute este SQL no Supabase Dashboard → SQL Editor
create table if not exists palpites_log (
  id                bigserial    primary key,
  bolao_id          text         not null default 'bet3',
  participante_id   text         not null,
  participante_nome text         not null,
  jogo_id           text         not null,
  time_casa         text         not null,
  time_visitante    text         not null,
  gols_casa         integer      not null,
  gols_visitante    integer      not null,
  acao              text         not null check (acao in ('CRIADO', 'ATUALIZADO')),
  created_at        timestamptz  not null default now()
);

-- Política de segurança: anon pode ler e inserir
alter table palpites_log enable row level security;
create policy "palpites_log_read"   on palpites_log for select using (true);
create policy "palpites_log_insert" on palpites_log for insert with check (true);

-- Habilitar Realtime na tabela
alter publication supabase_realtime add table palpites_log;
