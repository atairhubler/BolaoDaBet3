export interface Participante {
  id: string;
  nome: string;
}

export interface Palpite {
  participanteId: string;
  golsCasa: number;
  golsVisitante: number;
}

export interface Resultado {
  golsCasa: number;
  golsVisitante: number;
}

export interface PlacardAoVivo {
  golsCasa: number;
  golsVisitante: number;
  minuto?: number;
}

export interface Jogo {
  id: string;
  timeCasa: string;
  timeVisitante: string;
  fase: string;
  dataHora?: string;
  palpites: Palpite[];
  resultado?: Resultado;
  encerrado: boolean;
  placardAoVivo?: PlacardAoVivo;
}

export interface Bolao {
  nome: string;
  valorEntrada: number;
  participantes: Participante[];
  jogos: Jogo[];
}

export interface ClassificacaoItem {
  participante: Participante;
  pontos: number;
  acertosExatos: number;
  acertosVencedor: number;
  vencedor: boolean;
  ganho: number;
}

export interface PalpiteLog {
  id: number;
  bolao_id: string;
  participante_id: string;
  participante_nome: string;
  jogo_id: string;
  time_casa: string;
  time_visitante: string;
  gols_casa: number;
  gols_visitante: number;
  acao: 'CRIADO' | 'ATUALIZADO' | 'REMOVIDO';
  created_at: string;
}
