import { Component, computed, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Jogo } from '../../core/models';
import { BolaoService } from '../../core/services/bolao.service';

@Component({
  selector: 'app-publico',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="publico-page">

      <!-- HEADER -->
      <header class="pub-header">
        <div class="pub-header-inner">
          <div class="pub-logo">🏆</div>
          <div class="pub-title-block">
            <h1 class="pub-title">{{ bolao().nome }}</h1>
            <span class="pub-subtitle">Bet3 · Visualização ao vivo</span>
          </div>
          <div class="pub-prize-block">
            <div class="pub-prize-label">Prêmio Total</div>
            <div class="pub-prize-value">{{ totalPremio() | currency:'BRL':'symbol':'1.2-2' }}</div>
            <div class="pub-prize-sub">
              {{ bolao().valorEntrada | currency:'BRL':'symbol':'1.2-2' }}
              × {{ bolao().participantes.length }} participantes
            </div>
          </div>
        </div>
      </header>

      <!-- LOADING -->
      <div class="loading-state" *ngIf="carregando()">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Carregando dados...</p>
      </div>

      <!-- CONTEÚDO -->
      <main class="pub-content" *ngIf="!carregando()">

        <!-- VENCEDORES -->
        <div class="winners-banner" *ngIf="vencedores().length > 0">
          <span class="confetti">🎉</span>
          <div class="winners-inner">
            <h2>{{ vencedores().length === 1 ? '🥇 Vencedor até agora!' : '🥇 Líderes até agora!' }}</h2>
            <div class="winner-cards">
              <div class="winner-card" *ngFor="let v of vencedores()">
                <span class="w-trophy">🏆</span>
                <span class="w-name">{{ v.participante.nome }}</span>
                <span class="w-prize">{{ v.ganho | currency:'BRL':'symbol':'1.2-2' }}</span>
              </div>
            </div>
          </div>
          <span class="confetti">🎉</span>
        </div>

        <!-- SEM RESULTADOS -->
        <div class="no-results" *ngIf="jogosEncerrados().length === 0 && bolao().participantes.length > 0">
          <mat-icon>schedule</mat-icon>
          <p>Aguardando resultados dos jogos...</p>
          <small>
            {{ bolao().participantes.length }} participante(s) ·
            {{ bolao().jogos.length }} jogo(s) previsto(s)
          </small>
        </div>

        <!-- SEM DADOS AINDA -->
        <div class="no-results" *ngIf="bolao().participantes.length === 0">
          <mat-icon>hourglass_empty</mat-icon>
          <p>O bolão ainda não foi configurado.</p>
        </div>

        <!-- CLASSIFICAÇÃO -->
        <mat-card class="section-card" *ngIf="classificacao().length > 0">
          <mat-card-header>
            <mat-card-title>
              <mat-icon class="section-icon">emoji_events</mat-icon>
              Classificação
            </mat-card-title>
            <mat-card-subtitle>
              {{ jogosEncerrados().length }} jogo(s) encerrado(s) de {{ bolao().jogos.length }}
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="rank-header">
              <span class="r-pos">#</span>
              <span class="r-nome">Participante</span>
              <span class="r-exatos">⚽ Exatos</span>
              <span class="r-premio">Ganhos</span>
            </div>
            <div *ngFor="let item of classificacao(); let i = index"
                 class="rank-row"
                 [class.rank-winner]="item.vencedor">
              <span class="r-pos">{{ i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1) }}</span>
              <span class="r-nome">
                <mat-icon *ngIf="item.vencedor" class="trophy-icon">emoji_events</mat-icon>
                {{ item.participante.nome }}
              </span>
              <span class="r-exatos">{{ item.acertosExatos }}</span>
              <span class="r-premio">
                <span class="prize-badge" [class.prize-winner]="item.vencedor">
                  {{ item.ganho | currency:'BRL':'symbol':'1.2-2' }}
                </span>
              </span>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- JOGOS E PALPITES -->
        <div *ngIf="jogosEncerrados().length > 0">
          <h2 class="section-title">
            <mat-icon>sports_soccer</mat-icon>
            Jogos e Palpites
          </h2>

          <mat-card *ngFor="let jogo of jogosEncerrados()" class="jogo-card">
            <div class="jogo-header">
              <span class="fase-tag">{{ jogo.fase }}</span>
              <div class="match-row">
                <span class="team-name">{{ jogo.timeCasa }}</span>
                <span class="score-box">
                  <span>{{ jogo.resultado!.golsCasa }}</span>
                  <span class="score-sep">×</span>
                  <span>{{ jogo.resultado!.golsVisitante }}</span>
                </span>
                <span class="team-name">{{ jogo.timeVisitante }}</span>
              </div>
            </div>

            <div class="palpites-list">
              <div *ngFor="let part of bolao().participantes"
                   class="palpite-item"
                   [class.p-exato]="getPts(jogo, part.id) === 3"
                   [class.p-vencedor]="getPts(jogo, part.id) === 1"
                   [class.p-errou]="hasPalpite(jogo, part.id) && getPts(jogo, part.id) === 0">
                <span class="p-name">{{ part.nome }}</span>
                <span class="p-guess">{{ getPalpiteTexto(jogo, part.id) }}</span>
                <span class="p-pts" *ngIf="hasPalpite(jogo, part.id)">
                  {{ getGanhoDoJogo(jogo, part.id) | currency:'BRL':'symbol':'1.2-2' }}
                </span>
              </div>
            </div>
          </mat-card>
        </div>

      </main>

      <footer class="pub-footer">
        Bolão da Bet3 · Atualização em tempo real
      </footer>
    </div>
  `,
  styles: [`
    .publico-page {
      min-height: 100vh;
      background: #f5f5f5;
      display: flex;
      flex-direction: column;
    }

    /* LOADING */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      gap: 16px;
      color: #9e9e9e;
    }

    /* HEADER */
    .pub-header {
      background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 60%, #1b5e20 100%);
      padding: 28px 16px;
      color: white;
    }

    .pub-header-inner {
      max-width: 900px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }

    .pub-logo { font-size: 3rem; }

    .pub-title-block { flex: 1; min-width: 160px; }

    .pub-title {
      margin: 0;
      font-size: 1.8rem;
      font-weight: 800;
      color: #ffd600;
      line-height: 1.1;
    }

    .pub-subtitle { font-size: 0.85rem; color: rgba(255,255,255,0.7); }

    .pub-prize-block {
      text-align: right;
      background: rgba(0,0,0,0.25);
      border-radius: 12px;
      padding: 12px 20px;
    }

    .pub-prize-label {
      font-size: 0.68rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: rgba(255,255,255,0.7);
    }

    .pub-prize-value {
      font-size: 1.6rem;
      font-weight: 800;
      color: #ffd600;
      line-height: 1.2;
    }

    .pub-prize-sub { font-size: 0.73rem; color: rgba(255,255,255,0.55); }

    /* CONTENT */
    .pub-content {
      max-width: 900px;
      margin: 0 auto;
      padding: 24px 16px 40px;
      width: 100%;
      box-sizing: border-box;
      flex: 1;
    }

    /* WINNERS */
    .winners-banner {
      background: linear-gradient(135deg, #1b5e20, #2e7d32, #1b5e20);
      border-radius: 16px;
      padding: 28px 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
      color: white;
    }

    .confetti { font-size: 2rem; flex-shrink: 0; }
    .winners-inner { flex: 1; text-align: center; }
    .winners-inner h2 { font-size: 1.4rem; font-weight: 700; color: #ffd600; margin: 0 0 16px; }

    .winner-cards {
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .winner-card {
      background: rgba(255,214,0,0.15);
      border: 2px solid #ffd600;
      border-radius: 12px;
      padding: 14px 22px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .w-trophy { font-size: 1.6rem; }
    .w-name { font-size: 1.05rem; font-weight: 700; color: white; }
    .w-prize { font-size: 1.3rem; font-weight: 900; color: #ffd600; }

    /* NO RESULTS */
    .no-results {
      text-align: center;
      padding: 40px 20px;
      color: #9e9e9e;
      background: white;
      border-radius: 12px;
      margin-bottom: 24px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    }
    .no-results mat-icon { font-size: 3rem; width: 3rem; height: 3rem; }
    .no-results p { font-size: 1.05rem; margin: 12px 0 4px; color: #616161; }

    /* SECTION CARD */
    .section-card { margin-bottom: 24px; }

    .section-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .section-icon { color: #f57f17; font-size: 1.4rem; width: 1.4rem; height: 1.4rem; }

    /* RANKING */
    .rank-header {
      display: grid;
      grid-template-columns: 44px 1fr 80px 120px;
      gap: 8px;
      padding: 8px 12px;
      background: #f5f5f5;
      border-radius: 6px;
      margin-bottom: 4px;
      font-size: 0.7rem;
      font-weight: 600;
      color: #9e9e9e;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    .rank-row {
      display: grid;
      grid-template-columns: 44px 1fr 80px 120px;
      gap: 8px;
      padding: 10px 12px;
      border-radius: 8px;
      align-items: center;
      margin-bottom: 2px;
      transition: background 0.15s;
    }

    .rank-row:hover { background: #fafafa; }
    .rank-winner { background: linear-gradient(90deg, #fffde7, #fff9c4) !important; border: 1px solid #ffd600; }

    .r-pos, .r-exatos, .r-premio { text-align: center; }
    .r-nome { display: flex; align-items: center; gap: 6px; font-weight: 500; }

    .trophy-icon { font-size: 16px; width: 16px; height: 16px; color: #f57f17; }

    .prize-badge {
      display: inline-block;
      background: #e8f5e9;
      color: #2e7d32;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 0.82rem;
    }

    .prize-winner { background: #ffd600; color: #1b5e20; }

    /* SECTION TITLE */
    .section-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.15rem;
      font-weight: 700;
      color: #1b5e20;
      margin: 8px 0 16px;
    }

    .section-title mat-icon { color: #2e7d32; }

    /* JOGO CARD */
    .jogo-card { margin-bottom: 16px; overflow: hidden; }

    .jogo-header {
      padding: 14px 16px 10px;
      border-bottom: 1px solid #f0f0f0;
    }

    .fase-tag {
      display: inline-block;
      font-size: 0.68rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #757575;
      background: #f5f5f5;
      padding: 2px 8px;
      border-radius: 6px;
      margin-bottom: 10px;
    }

    .match-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .team-name {
      font-size: 1.05rem;
      font-weight: 600;
      color: #212121;
      min-width: 80px;
      text-align: center;
    }

    .score-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #1b5e20;
      color: white;
      font-size: 1.4rem;
      font-weight: 800;
      padding: 6px 18px;
      border-radius: 10px;
    }

    .score-sep { color: rgba(255,255,255,0.4); }

    /* PALPITES */
    .palpites-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
      gap: 1px;
      background: #f0f0f0;
    }

    .palpite-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      background: white;
    }

    .palpite-item.p-exato { background: #e8f5e9; }
    .palpite-item.p-vencedor { background: #fff8e1; }
    .palpite-item.p-errou { background: #ffebee; }

    .p-name { flex: 1; font-size: 0.88rem; font-weight: 500; color: #424242; }
    .p-guess { font-size: 0.85rem; font-weight: 600; color: #616161; min-width: 38px; text-align: center; }
    .p-pts { font-size: 0.76rem; font-weight: 700; min-width: 60px; text-align: right; }

    .p-exato .p-pts { color: #2e7d32; }
    .p-vencedor .p-pts { color: #f57f17; }
    .p-errou .p-pts { color: #c62828; }

    /* FOOTER */
    .pub-footer {
      text-align: center;
      padding: 16px;
      color: #bdbdbd;
      font-size: 0.78rem;
      border-top: 1px solid #e0e0e0;
      background: white;
    }

    @media (max-width: 600px) {
      .pub-header-inner { flex-direction: column; text-align: center; }
      .pub-prize-block { text-align: center; width: 100%; }
      .rank-header, .rank-row { grid-template-columns: 36px 1fr 100px; }
      .r-exatos { display: none; }
      .team-name { font-size: 0.9rem; min-width: 60px; }
      .score-box { font-size: 1.2rem; padding: 4px 14px; }
    }
  `],
})
export class PublicoComponent {
  private readonly bolaoService = inject(BolaoService);

  readonly bolao = this.bolaoService.bolao;
  readonly totalPremio = this.bolaoService.totalPremio;
  readonly classificacao = this.bolaoService.classificacao;
  readonly vencedores = this.bolaoService.vencedores;
  readonly carregando = this.bolaoService.carregando;

  readonly jogosEncerrados = computed(() =>
    this.bolao().jogos.filter(j => j.encerrado && j.resultado)
  );

  getPalpiteTexto(jogo: Jogo, participanteId: string): string {
    const p = jogo.palpites.find(pal => pal.participanteId === participanteId);
    return p ? `${p.golsCasa} × ${p.golsVisitante}` : '—';
  }

  hasPalpite(jogo: Jogo, participanteId: string): boolean {
    return jogo.palpites.some(p => p.participanteId === participanteId);
  }

  getPts(jogo: Jogo, participanteId: string): number {
    const p = jogo.palpites.find(pal => pal.participanteId === participanteId);
    if (!p || !jogo.resultado) return -1;
    return this.bolaoService.calcularPontuacao(p, jogo.resultado);
  }

  getGanhoDoJogo(jogo: Jogo, participanteId: string): number {
    return this.bolaoService.calcularGanhoDoJogo(jogo).get(participanteId) ?? 0;
  }
}
