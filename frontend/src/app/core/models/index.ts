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

export interface Jogo {
  id: string;
  timeCasa: string;
  timeVisitante: string;
  fase: string;
  palpites: Palpite[];
  resultado?: Resultado;
  encerrado: boolean;
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
