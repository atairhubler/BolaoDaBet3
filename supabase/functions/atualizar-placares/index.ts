import { createClient } from 'jsr:@supabase/supabase-js@2';

const BOLAO_ID = 'bet3';
const COMPETITION = 'WC'; // Copa do Mundo FIFA

// Mapeamento: nome em inglês (football-data.org) → nome em português (bolão)
const TEAM_MAP: Record<string, string> = {
  'Brazil': 'Brasil',
  'Haiti': 'Haiti',
  'Germany': 'Alemanha',
  'Saudi Arabia': 'Arábia Saudita',
  'Algeria': 'Argélia',
  'Argentina': 'Argentina',
  'Australia': 'Austrália',
  'Austria': 'Áustria',
  'Belgium': 'Bélgica',
  'Bosnia and Herzegovina': 'Bósnia e Herzegovina',
  'Cape Verde': 'Cabo Verde',
  'Cabo Verde': 'Cabo Verde',
  'Canada': 'Canadá',
  'Colombia': 'Colômbia',
  'Democratic Republic of Congo': 'Congo RD',
  'DR Congo': 'Congo RD',
  'Korea Republic': 'Coreia do Sul',
  'South Korea': 'Coreia do Sul',
  "Côte d'Ivoire": 'Costa do Marfim',
  'Ivory Coast': 'Costa do Marfim',
  'Croatia': 'Croácia',
  'Curaçao': 'Curaçao',
  'Curacao': 'Curaçao',
  'Egypt': 'Egito',
  'Ecuador': 'Equador',
  'Scotland': 'Escócia',
  'Spain': 'Espanha',
  'United States': 'Estados Unidos',
  'USA': 'Estados Unidos',
  'France': 'França',
  'Ghana': 'Ghana',
  'Netherlands': 'Holanda',
  'England': 'Inglaterra',
  'Iran': 'Irã',
  'Iraq': 'Iraque',
  'Japan': 'Japão',
  'Jordan': 'Jordânia',
  'Morocco': 'Marrocos',
  'Mexico': 'México',
  'Norway': 'Noruega',
  'New Zealand': 'Nova Zelândia',
  'Panama': 'Panamá',
  'Paraguay': 'Paraguai',
  'Portugal': 'Portugal',
  'Qatar': 'Qatar',
  'Senegal': 'Senegal',
  'Sweden': 'Suécia',
  'Switzerland': 'Suíça',
  'Czech Republic': 'Tchéquia',
  'Czechia': 'Tchéquia',
  'Tunisia': 'Tunísia',
  'Turkey': 'Turquia',
  'Türkiye': 'Turquia',
  'Uruguay': 'Uruguai',
  'Uzbekistan': 'Uzbequistão',
  'South Africa': 'África do Sul',
};

interface Palpite {
  participanteId: string;
  golsCasa: number;
  golsVisitante: number;
}

interface Jogo {
  id: string;
  timeCasa: string;
  timeVisitante: string;
  fase: string;
  dataHora?: string;
  palpites: Palpite[];
  resultado?: { golsCasa: number; golsVisitante: number };
  encerrado: boolean;
}

interface Bolao {
  nome: string;
  valorEntrada: number;
  participantes: unknown[];
  jogos: Jogo[];
}

Deno.serve(async () => {
  try {
    const apiToken = Deno.env.get('FOOTBALL_DATA_TOKEN');
    if (!apiToken) {
      return json({ error: 'FOOTBALL_DATA_TOKEN não configurado' }, 500);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Busca partidas finalizadas hoje na Copa do Mundo
    const today = new Date().toISOString().split('T')[0];
    const apiRes = await fetch(
      `https://api.football-data.org/v4/competitions/${COMPETITION}/matches?status=FINISHED&dateFrom=${today}&dateTo=${today}`,
      { headers: { 'X-Auth-Token': apiToken } }
    );

    if (!apiRes.ok) {
      const msg = await apiRes.text();
      return json({ error: `API retornou ${apiRes.status}: ${msg}` }, 500);
    }

    const apiData = await apiRes.json();
    const matches: unknown[] = apiData.matches ?? [];

    if (matches.length === 0) {
      return json({ ok: true, mensagem: 'Sem jogos finalizados hoje', jogosAtualizados: 0 });
    }

    // Carrega o bolão do Supabase
    const { data: bolaoRow, error: dbError } = await supabase
      .from('boloes')
      .select('dados')
      .eq('id', BOLAO_ID)
      .single();

    if (dbError || !bolaoRow) {
      return json({ error: 'Bolão não encontrado no banco' }, 404);
    }

    const bolao = bolaoRow.dados as Bolao;
    const atualizados: string[] = [];

    for (const match of matches as Record<string, any>[]) {
      const homeEn: string = match.homeTeam?.name ?? '';
      const awayEn: string = match.awayTeam?.name ?? '';
      const golsHome: number | null = match.score?.fullTime?.home ?? null;
      const golsAway: number | null = match.score?.fullTime?.away ?? null;

      if (golsHome === null || golsAway === null) continue;

      const homePT = TEAM_MAP[homeEn] ?? homeEn;
      const awayPT = TEAM_MAP[awayEn] ?? awayEn;

      // Encontra o jogo no bolão pelo nome dos times (em qualquer ordem)
      const jogo = bolao.jogos.find(
        (j) =>
          !j.encerrado &&
          ((j.timeCasa === homePT && j.timeVisitante === awayPT) ||
            (j.timeCasa === awayPT && j.timeVisitante === homePT))
      );

      if (!jogo) continue;

      // Ajusta os gols conforme a ordem dos times no bolão
      const invertido = jogo.timeCasa === awayPT;
      jogo.resultado = {
        golsCasa: invertido ? golsAway : golsHome,
        golsVisitante: invertido ? golsHome : golsAway,
      };
      jogo.encerrado = true;

      atualizados.push(
        `${jogo.timeCasa} ${jogo.resultado.golsCasa}×${jogo.resultado.golsVisitante} ${jogo.timeVisitante}`
      );
    }

    if (atualizados.length > 0) {
      await supabase
        .from('boloes')
        .update({ dados: bolao, updated_at: new Date().toISOString() })
        .eq('id', BOLAO_ID);
    }

    return json({ ok: true, jogosAtualizados: atualizados.length, detalhes: atualizados });
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
