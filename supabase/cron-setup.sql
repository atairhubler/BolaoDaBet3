-- Execute este SQL no Supabase Dashboard → SQL Editor
-- Habilitar extensões necessárias (já vêm no Supabase, só precisam ser ativadas)
create extension if not exists pg_net  with schema extensions;
create extension if not exists pg_cron with schema extensions;

-- Agendar a função para rodar a cada 20 minutos
-- (72 req/dia → dentro do plano gratuito do football-data.org)
select cron.schedule(
  'atualizar-placares-copa',          -- nome do job (único)
  '*/20 * * * *',                     -- a cada 20 minutos
  $$
  select net.http_post(
    url     := 'https://fqdfrheejjfscllnqnje.supabase.co/functions/v1/atualizar-placares',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body    := '{}'::jsonb
  );
  $$
);

-- Para verificar se o job foi criado:
-- select * from cron.job;

-- Para remover o job (se necessário):
-- select cron.unschedule('atualizar-placares-copa');
