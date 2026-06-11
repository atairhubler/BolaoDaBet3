import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BolaoService } from '../../core/services/bolao.service';

@Component({
  selector: 'app-classificacao',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatTableModule,
    MatTooltipModule,
  ],
  template: `
    <div class="classificacao-page">
      <div class="page-header">
        <mat-icon class="page-icon">emoji_events</mat-icon>
        <div>
          <h1>Classificação</h1>
          <p>Ranking dos participantes e distribuição do prêmio.</p>
        </div>
      </div>

      <!-- Estado vazio -->
      <mat-card *ngIf="classificacao().length === 0" class="empty-card">
        <mat-card-content>
          <div class="empty-state">
            <span>🏆</span>
            <h2>Nenhum dado ainda</h2>
            <p>Adicione participantes, jogos e registre os resultados para ver a classificação.</p>
            <a routerLink="/" mat-flat-button color="primary">Ir ao Dashboard</a>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Vencedores -->
      <div *ngIf="vencedores().length > 0" class="winners-section">
        <div class="winners-banner">
          <div class="confetti">🎉</div>
          <div class="winners-content">
            <h2>
              {{ vencedores().length === 1 ? '🥇 Vencedor do Bolão!' : '🥇 Vencedores do Bolão!' }}
            </h2>
            <div class="winner-cards">
              <div class="winner-card" *ngFor="let v of vencedores()">
                <span class="winner-trophy">🏆</span>
                <span class="winner-name">{{ v.participante.nome }}</span>
                <span class="winner-prize">
                  {{ v.ganho | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                </span>
              </div>
            </div>
            <p class="prize-split-note" *ngIf="vencedores().length > 1">
              Prêmio dividido igualmente entre {{ vencedores().length }} vencedores.
            </p>
          </div>
          <div class="confetti">🎉</div>
        </div>
      </div>

      <!-- Info do prêmio -->
      <div class="premio-summary" *ngIf="classificacao().length > 0">
        <div class="premio-item">
          <mat-icon>group</mat-icon>
          <div>
            <div class="premio-label">Participantes</div>
            <div class="premio-val">{{ bolao().participantes.length }}</div>
          </div>
        </div>
        <div class="premio-item">
          <mat-icon>attach_money</mat-icon>
          <div>
            <div class="premio-label">Entrada por pessoa</div>
            <div class="premio-val">{{ bolao().valorEntrada | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</div>
          </div>
        </div>
        <div class="premio-item destaque">
          <mat-icon>monetization_on</mat-icon>
          <div>
            <div class="premio-label">Prêmio Total</div>
            <div class="premio-val">{{ totalPremio() | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</div>
          </div>
        </div>
        <div class="premio-item">
          <mat-icon>sports_soccer</mat-icon>
          <div>
            <div class="premio-label">Jogos encerrados</div>
            <div class="premio-val">{{ jogosEncerrados }} de {{ bolao().jogos.length }}</div>
          </div>
        </div>
      </div>

      <!-- Tabela de classificação -->
      <mat-card *ngIf="classificacao().length > 0" class="ranking-card">
        <mat-card-header>
          <mat-card-title>Ranking Completo</mat-card-title>
          <mat-card-subtitle>{{ jogosEncerrados }} jogo(s) encerrado(s)</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="ranking-header">
            <span class="col-pos">#</span>
            <span class="col-nome">Participante</span>
            <span class="col-ganho">Ganhos</span>
            <span class="col-exatos" matTooltip="Acertos de placar exato">⚽ Exatos</span>
            <span class="col-venc" matTooltip="Acertou vencedor mas não o placar">✓ Vencedor</span>
          </div>

          <div
            class="ranking-row"
            *ngFor="let item of classificacao(); let i = index"
            [class.winner-row]="item.vencedor"
            [class.podium-2]="i === 1 && !item.vencedor"
            [class.podium-3]="i === 2 && !item.vencedor"
          >
            <span class="col-pos">
              <span class="position" [class.pos-gold]="i === 0" [class.pos-silver]="i === 1" [class.pos-bronze]="i === 2">
                {{ i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1 }}
              </span>
            </span>
            <span class="col-nome">
              <mat-icon *ngIf="item.vencedor" class="trophy-icon">emoji_events</mat-icon>
              {{ item.participante.nome }}
            </span>
            <span class="col-ganho">
              <span class="ganho-badge" [class.ganho-winner]="item.vencedor">
                {{ item.ganho | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
              </span>
            </span>
            <span class="col-exatos">{{ item.acertosExatos }}</span>
            <span class="col-venc">{{ item.acertosVencedor }}</span>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Legenda de pontuação -->
      <mat-card *ngIf="classificacao().length > 0" class="legenda-card">
        <mat-card-content>
          <h3>Como funciona a pontuação</h3>
          <div class="legenda-items">
            <div class="legenda-item">
              <span class="pts-badge pts-3">3 pts</span>
              <span>Acertou o placar exato</span>
            </div>
            <div class="legenda-item">
              <span class="pts-badge pts-1">1 pt</span>
              <span>Acertou o vencedor (ou empate), mas não o placar</span>
            </div>
            <div class="legenda-item">
              <span class="pts-badge pts-0">0 pts</span>
              <span>Errou o resultado</span>
            </div>
          </div>
          <p class="legenda-prize">
            Em cada jogo, quem fizer mais pontos ganha a parte do prêmio correspondente a esse jogo. Em caso de empate, o prêmio do jogo é dividido igualmente entre os empatados.
          </p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .classificacao-page { max-width: 900px; }

    .page-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .page-icon {
      font-size: 2.5rem;
      width: 2.5rem;
      height: 2.5rem;
      color: #f57f17;
    }

    .page-header h1 {
      margin: 0;
      font-size: 1.6rem;
      font-weight: 700;
      color: #1b5e20;
    }

    .page-header p { margin: 4px 0 0; color: #757575; }

    .empty-card mat-card-content { padding: 0 !important; }
    .empty-state {
      text-align: center;
      padding: 40px 20px;
    }
    .empty-state span { font-size: 4rem; }
    .empty-state h2 { color: #1b5e20; margin: 16px 0 8px; }
    .empty-state p { color: #757575; margin-bottom: 24px; }

    /* Winners banner */
    .winners-section { margin-bottom: 24px; }

    .winners-banner {
      background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #1b5e20 100%);
      border-radius: 16px;
      padding: 32px 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      color: white;
    }

    .confetti { font-size: 2.5rem; }

    .winners-content { flex: 1; text-align: center; }

    .winners-content h2 {
      font-size: 1.6rem;
      font-weight: 700;
      color: #ffd600;
      margin: 0 0 20px;
    }

    .winner-cards {
      display: flex;
      justify-content: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .winner-card {
      background: rgba(255, 214, 0, 0.15);
      border: 2px solid #ffd600;
      border-radius: 12px;
      padding: 16px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .winner-trophy { font-size: 2rem; }

    .winner-name {
      font-size: 1.2rem;
      font-weight: 700;
      color: white;
    }

    .winner-pts {
      font-size: 0.9rem;
      color: rgba(255,255,255,0.8);
    }

    .winner-prize {
      font-size: 1.4rem;
      font-weight: 900;
      color: #ffd600;
    }

    .prize-split-note {
      margin-top: 12px;
      font-size: 0.85rem;
      color: rgba(255,255,255,0.7);
    }

    /* Premio summary */
    .premio-summary {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 12px;
      margin-bottom: 24px;
    }

    .premio-item {
      display: flex;
      align-items: center;
      gap: 10px;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 10px;
      padding: 14px;
    }

    .premio-item.destaque {
      background: #e8f5e9;
      border-color: #4caf50;
    }

    .premio-item mat-icon { color: #2e7d32; }
    .premio-item.destaque mat-icon { color: #1b5e20; }

    .premio-label { font-size: 0.75rem; color: #9e9e9e; text-transform: uppercase; }
    .premio-val { font-size: 1rem; font-weight: 700; color: #212121; }

    /* Ranking table */
    .ranking-card { margin-bottom: 16px; }

    .ranking-header {
      display: grid;
      grid-template-columns: 50px 1fr 120px 80px 80px;
      gap: 8px;
      padding: 8px 12px;
      background: #f5f5f5;
      border-radius: 8px;
      margin-bottom: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #757575;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .ranking-row {
      display: grid;
      grid-template-columns: 50px 1fr 120px 80px 80px;
      gap: 8px;
      padding: 12px;
      border-radius: 8px;
      align-items: center;
      margin-bottom: 4px;
      transition: background 0.2s;
    }

    .ranking-row:hover { background: #f9f9f9; }

    .winner-row {
      background: linear-gradient(90deg, #fffde7 0%, #fff9c4 100%) !important;
      border: 1px solid #ffd600;
    }

    .col-pos { text-align: center; }
    .col-ganho, .col-exatos, .col-venc { text-align: center; }

    .col-nome {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;
    }

    .trophy-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #f57f17;
    }

    .position { font-size: 1.2rem; }

    .ganho-badge {
      display: inline-block;
      background: #e8f5e9;
      color: #2e7d32;
      font-weight: 700;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 0.88rem;
    }

    .ganho-winner {
      background: #ffd600;
      color: #1b5e20;
    }

    /* Legenda */
    .legenda-card { margin-top: 16px; }

    .legenda-card h3 {
      font-size: 0.95rem;
      font-weight: 600;
      color: #424242;
      margin: 0 0 12px;
    }

    .legenda-items { display: flex; flex-direction: column; gap: 8px; }

    .legenda-item {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 0.9rem;
      color: #616161;
    }

    .pts-badge {
      padding: 2px 10px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.8rem;
      min-width: 48px;
      text-align: center;
    }

    .pts-3 { background: #e8f5e9; color: #2e7d32; }
    .pts-1 { background: #fff8e1; color: #f57f17; }
    .pts-0 { background: #ffebee; color: #c62828; }

    .legenda-prize {
      margin-top: 12px;
      font-size: 0.85rem;
      color: #9e9e9e;
      font-style: italic;
    }

    @media (max-width: 700px) {
      .ranking-header,
      .ranking-row {
        grid-template-columns: 40px 1fr 100px;
      }
      .col-exatos, .col-venc { display: none; }
    }
  `],
})
export class ClassificacaoComponent {
  private readonly bolaoService = inject(BolaoService);

  readonly bolao = this.bolaoService.bolao;
  readonly classificacao = this.bolaoService.classificacao;
  readonly totalPremio = this.bolaoService.totalPremio;
  readonly vencedores = this.bolaoService.vencedores;

  get jogosEncerrados(): number {
    return this.bolao().jogos.filter(j => j.encerrado).length;
  }
}
