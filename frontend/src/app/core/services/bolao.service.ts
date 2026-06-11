import { Injectable, computed, signal } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { Bolao, ClassificacaoItem, Jogo, Participante, Palpite, Resultado } from '../models';

const STORAGE_KEY = 'bolao-copa-data';
const BOLAO_ID = 'bet3';

const BOLAO_INICIAL: Bolao = {
  nome: 'Bolão da Bet3',
  valorEntrada: 50,
  participantes: [],
  jogos: [],
};

@Injectable({ providedIn: 'root' })
export class BolaoService {
  private readonly supabase: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseAnonKey
  );

  private readonly _bolao = signal<Bolao>(this.carregarDoStorage());
  private readonly _carregando = signal(true);

  readonly bolao = this._bolao.asReadonly();
  readonly carregando = this._carregando.asReadonly();

  readonly totalPremio = computed(() =>
    this._bolao().valorEntrada * this._bolao().participantes.length
  );

  readonly classificacao = computed<ClassificacaoItem[]>(() => {
    const { participantes, jogos, valorEntrada } = this._bolao();
    const jogosEncerrados = jogos.filter(j => j.encerrado && j.resultado);
    const totalJogos = jogos.length;
    const totalPremio = valorEntrada * participantes.length;

    const ganhoMap = new Map<string, number>();
    for (const jogo of jogosEncerrados) {
      if (totalJogos === 0) break;
      const premioDoJogo = totalPremio / totalJogos;
      const pontosJogo = jogo.palpites.map(p => ({
        id: p.participanteId,
        pts: this.calcularPontuacao(p, jogo.resultado!),
      }));
      if (!pontosJogo.length) continue;
      const maxPts = Math.max(...pontosJogo.map(p => p.pts));
      if (maxPts === 0) continue;
      const vencedoresJogo = pontosJogo.filter(p => p.pts === maxPts);
      const ganho = premioDoJogo / vencedoresJogo.length;
      for (const v of vencedoresJogo) {
        ganhoMap.set(v.id, (ganhoMap.get(v.id) ?? 0) + ganho);
      }
    }

    const items: ClassificacaoItem[] = participantes.map(participante => {
      let pontos = 0;
      let acertosExatos = 0;
      let acertosVencedor = 0;

      for (const jogo of jogosEncerrados) {
        const palpite = jogo.palpites.find(p => p.participanteId === participante.id);
        if (!palpite || !jogo.resultado) continue;

        const pts = this.calcularPontuacao(palpite, jogo.resultado);
        pontos += pts;
        if (pts === 3) acertosExatos++;
        else if (pts === 1) acertosVencedor++;
      }

      return { participante, pontos, acertosExatos, acertosVencedor, vencedor: false, ganho: ganhoMap.get(participante.id) ?? 0 };
    });

    if (items.length === 0) return items;

    const maxGanho = Math.max(...items.map(i => i.ganho));

    return items
      .map(item => ({ ...item, vencedor: item.ganho === maxGanho && maxGanho > 0 }))
      .sort((a, b) => b.ganho - a.ganho || b.acertosExatos - a.acertosExatos);
  });

  calcularGanhoDoJogo(jogo: Jogo): Map<string, number> {
    if (!jogo.encerrado || !jogo.resultado) return new Map();
    const { jogos, valorEntrada, participantes } = this._bolao();
    const totalJogos = jogos.length;
    if (totalJogos === 0) return new Map();
    const totalPremio = valorEntrada * participantes.length;
    const premioDoJogo = totalPremio / totalJogos;

    const pts = jogo.palpites.map(p => ({
      id: p.participanteId,
      pts: this.calcularPontuacao(p, jogo.resultado!),
    }));
    if (!pts.length) return new Map();
    const maxPts = Math.max(...pts.map(p => p.pts));
    if (maxPts === 0) return new Map();

    const vencedores = pts.filter(p => p.pts === maxPts);
    const ganho = premioDoJogo / vencedores.length;
    return new Map(vencedores.map(v => [v.id, ganho]));
  }

  readonly vencedores = computed(() => this.classificacao().filter(c => c.vencedor));

  readonly jogosComPlacar = computed(() => this._bolao().jogos.filter(j => !j.encerrado));

  constructor() {
    this.inicializarSupabase();
  }

  atualizarConfiguracoes(nome: string, valorEntrada: number): void {
    this._bolao.update(b => ({ ...b, nome, valorEntrada }));
    this.persistir();
  }

  adicionarParticipante(nome: string): void {
    const novo: Participante = { id: this.gerarId(), nome: nome.trim() };
    this._bolao.update(b => ({ ...b, participantes: [...b.participantes, novo] }));
    this.persistir();
  }

  removerParticipante(id: string): void {
    this._bolao.update(b => ({
      ...b,
      participantes: b.participantes.filter(p => p.id !== id),
      jogos: b.jogos.map(j => ({
        ...j,
        palpites: j.palpites.filter(p => p.participanteId !== id),
      })),
    }));
    this.persistir();
  }

  adicionarJogo(timeCasa: string, timeVisitante: string, fase: string): void {
    const novo: Jogo = {
      id: this.gerarId(),
      timeCasa: timeCasa.trim(),
      timeVisitante: timeVisitante.trim(),
      fase: fase.trim(),
      palpites: [],
      encerrado: false,
    };
    this._bolao.update(b => ({ ...b, jogos: [...b.jogos, novo] }));
    this.persistir();
  }

  removerJogo(id: string): void {
    this._bolao.update(b => ({ ...b, jogos: b.jogos.filter(j => j.id !== id) }));
    this.persistir();
  }

  registrarPalpite(jogoId: string, participanteId: string, golsCasa: number, golsVisitante: number): void {
    this._bolao.update(b => ({
      ...b,
      jogos: b.jogos.map(j => {
        if (j.id !== jogoId) return j;
        const palpites = j.palpites.filter(p => p.participanteId !== participanteId);
        return { ...j, palpites: [...palpites, { participanteId, golsCasa, golsVisitante }] };
      }),
    }));
    this.persistir();
  }

  registrarResultado(jogoId: string, golsCasa: number, golsVisitante: number): void {
    const resultado: Resultado = { golsCasa, golsVisitante };
    this._bolao.update(b => ({
      ...b,
      jogos: b.jogos.map(j =>
        j.id === jogoId ? { ...j, resultado, encerrado: true } : j
      ),
    }));
    this.persistir();
  }

  reabrirJogo(jogoId: string): void {
    this._bolao.update(b => ({
      ...b,
      jogos: b.jogos.map(j =>
        j.id === jogoId ? { ...j, resultado: undefined, encerrado: false } : j
      ),
    }));
    this.persistir();
  }

  calcularPontuacao(palpite: Palpite, resultado: Resultado): number {
    if (palpite.golsCasa === resultado.golsCasa && palpite.golsVisitante === resultado.golsVisitante) {
      return 3;
    }
    const outcomePalpite = Math.sign(palpite.golsCasa - palpite.golsVisitante);
    const outcomeResultado = Math.sign(resultado.golsCasa - resultado.golsVisitante);
    return outcomePalpite === outcomeResultado ? 1 : 0;
  }

  private async inicializarSupabase(): Promise<void> {
    await this.carregarDoSupabase();
    this.subscribeRealtime();
  }

  private async carregarDoSupabase(): Promise<void> {
    try {
      const { data } = await this.supabase
        .from('boloes')
        .select('dados')
        .eq('id', BOLAO_ID)
        .single();

      const nuvem = data?.['dados'] as Bolao | undefined;
      const local = this._bolao();

      if (nuvem && (nuvem.participantes.length > 0 || nuvem.jogos.length > 0)) {
        // Supabase tem dados reais — usa como fonte verdade
        this._bolao.set(nuvem);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nuvem));
      } else if (local.participantes.length > 0 || local.jogos.length > 0) {
        // localStorage tem dados mas Supabase está vazio — sincroniza para a nuvem
        await this.sincronizarComSupabase();
      }
    } catch {
      // Supabase indisponível — continua com localStorage
    } finally {
      this._carregando.set(false);
    }
  }

  private subscribeRealtime(): void {
    this.supabase
      .channel('bolao-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'boloes', filter: `id=eq.${BOLAO_ID}` },
        (payload) => {
          const novosDados = payload['new']?.['dados'] as Bolao | undefined;
          if (novosDados) {
            this._bolao.set(novosDados);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(novosDados));
          }
        }
      )
      .subscribe();
  }

  private async sincronizarComSupabase(): Promise<void> {
    await this.supabase
      .from('boloes')
      .upsert({ id: BOLAO_ID, dados: this._bolao(), updated_at: new Date().toISOString() });
  }

  private persistir(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._bolao()));
    this.sincronizarComSupabase().catch(() => {});
  }

  private carregarDoStorage(): Bolao {
    try {
      const dados = localStorage.getItem(STORAGE_KEY);
      return dados ? JSON.parse(dados) : { ...BOLAO_INICIAL };
    } catch {
      return { ...BOLAO_INICIAL };
    }
  }

  private gerarId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
}
