import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const BOLAO_ID = 'bet3';
const COMPETITION = 'WC';

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

// Mapeamento: stage da API → fase do bolão
const STAGE_MAP: Record<string, string> = {
  'GROUP_STAGE': 'Fase de Grupos',
  'PRELIMINARY_ROUND': 'Fase de Grupos',
  'ROUND_OF_16': 'Oitavas de Final',
  'LAST_16': 'Oitavas de Final',
  'QUARTER_FINALS': 'Quartas de Final',
  'SEMI_FINALS': 'Semifinal',
  'THIRD_PLACE': 'Disputa 3º Lugar',
  'FINAL': 'Final',
  'PLAYOFF_ROUND_ONE': 'Playoff',
  'PLAYOFF_ROUND_TWO': 'Playoff',
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
  placardAoVivo?: { golsCasa: number; golsVisitante: number; minuto?: number };
}

interface Bolao {
  nome: string;
  valorEntrada: number;
  participantes: unknown[];
  jogos: Jogo[];
}

const gerarId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const apiToken = Deno.env.get('FOOTBALL_DATA_TOKEN');
    if (!apiToken) {
      return json({ error: 'FOOTBALL_DATA_TOKEN não configurado' }, 500);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Busca todos os jogos da Copa do Mundo (sem filtro de status para pegar tudo)
    const apiRes = await fetch(
      `https://api.football-data.org/v4/competitions/${COMPETITION}/matches`,
      { headers: { 'X-Auth-Token': apiToken } }
    );

    if (!apiRes.ok) {
      const msg = await apiRes.text();
      return json({ error: `API retornou ${apiRes.status}: ${msg}` }, 500);
    }

    const apiData = await apiRes.json();
    const allMatches: unknown[] = apiData.matches ?? [];

    // Filtra apenas os jogos agendados (ainda não começaram)
    const matches = (allMatches as Record<string, any>[]).filter(
      m => m.status === 'SCHEDULED' || m.status === 'TIMED'
    );

    if (matches.length === 0) {
      return json({ ok: true, mensagem: 'Nenhum jogo agendado encontrado na API', importados: 0, pulados: 0, detalhes: [] });
    }

    // Carrega o bolão
    const { data: bolaoRow, error: dbError } = await supabase
      .from('boloes')
      .select('dados')
      .eq('id', BOLAO_ID)
      .single();

    if (dbError || !bolaoRow) {
      return json({ error: 'Bolão não encontrado no banco' }, 404);
    }

    const bolao = bolaoRow.dados as Bolao;
    const importados: string[] = [];
    const pulados: string[] = [];

    for (const match of matches) {
      const homeEn: string = match.homeTeam?.name ?? match.homeTeam?.shortName ?? '';
      const awayEn: string = match.awayTeam?.name ?? match.awayTeam?.shortName ?? '';
      const stage: string = match.stage ?? '';
      const utcDate: string = match.utcDate ?? '';

      if (!homeEn || !awayEn) continue;

      const homePT = TEAM_MAP[homeEn] ?? homeEn;
      const awayPT = TEAM_MAP[awayEn] ?? awayEn;
      const fase = STAGE_MAP[stage] ?? 'Fase de Grupos';

      // Verifica se o jogo já existe no bolão (em qualquer ordem)
      const existe = bolao.jogos.some(
        j =>
          (j.timeCasa === homePT && j.timeVisitante === awayPT) ||
          (j.timeCasa === awayPT && j.timeVisitante === homePT)
      );

      if (existe) {
        pulados.push(`${homePT} vs ${awayPT}`);
        continue;
      }

      const novoJogo: Jogo = {
        id: gerarId(),
        timeCasa: homePT,
        timeVisitante: awayPT,
        fase,
        dataHora: utcDate || undefined,
        palpites: [],
        encerrado: false,
      };

      bolao.jogos.push(novoJogo);
      importados.push(`${homePT} vs ${awayPT} (${fase} — ${utcDate ? new Date(utcDate).toLocaleDateString('pt-BR') : 'sem data'})`);
    }

    if (importados.length > 0) {
      await supabase
        .from('boloes')
        .update({ dados: bolao, updated_at: new Date().toISOString() })
        .eq('id', BOLAO_ID);
    }

    return json({
      ok: true,
      importados: importados.length,
      pulados: pulados.length,
      detalhes: importados,
    });
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}
