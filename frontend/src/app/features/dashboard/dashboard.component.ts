import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { BolaoService } from '../../core/services/bolao.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CurrencyPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
  ],
  template: `
    <div class="dashboard">
      <h1 class="page-title">
        <span>🏆</span> {{ bolao().nome }}
      </h1>

      <!-- Cards de resumo -->
      <div class="summary-grid">
        <mat-card class="summary-card">
          <mat-card-content>
            <div class="summary-icon green"><mat-icon>monetization_on</mat-icon></div>
            <div class="summary-info">
              <div class="summary-value">{{ totalPremio() | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</div>
              <div class="summary-label">Prêmio Total</div>
              <div class="summary-sub">{{ bolao().valorEntrada | currency:'BRL':'symbol':'1.2-2':'pt-BR' }} × {{ bolao().participantes.length }} participantes</div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card">
          <mat-card-content>
            <div class="summary-icon blue"><mat-icon>group</mat-icon></div>
            <div class="summary-info">
              <div class="summary-value">{{ bolao().participantes.length }}</div>
              <div class="summary-label">Participantes</div>
              <a routerLink="/participantes" mat-button color="primary" class="card-link">Gerenciar →</a>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card">
          <mat-card-content>
            <div class="summary-icon orange"><mat-icon>sports_soccer</mat-icon></div>
            <div class="summary-info">
              <div class="summary-value">{{ jogosTotal }}</div>
              <div class="summary-label">Jogos</div>
              <div class="summary-sub">
                {{ jogosEncerrados }} encerrado(s) · {{ jogosAbertos }} em aberto
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card" *ngIf="vencedores().length > 0">
          <mat-card-content>
            <div class="summary-icon gold"><mat-icon>emoji_events</mat-icon></div>
            <div class="summary-info">
              <div class="summary-value">🥇</div>
              <div class="summary-label">
                {{ vencedores().length === 1 ? 'Vencedor' : 'Vencedores' }}
              </div>
              <div class="summary-sub" *ngFor="let v of vencedores()">
                {{ v.participante.nome }} — {{ v.pontos }} pts
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Ações rápidas -->
      <mat-card class="actions-card">
        <mat-card-header>
          <mat-card-title>Ações Rápidas</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="actions-grid">
            <a routerLink="/participantes" mat-stroked-button color="primary">
              <mat-icon>person_add</mat-icon> Adicionar Participante
            </a>
            <a routerLink="/jogos" mat-stroked-button color="primary">
              <mat-icon>add_circle</mat-icon> Cadastrar Jogo
            </a>
            <a routerLink="/palpites" mat-stroked-button color="primary">
              <mat-icon>edit_note</mat-icon> Registrar Palpites
            </a>
            <a routerLink="/resultados" mat-stroked-button color="accent">
              <mat-icon>scoreboard</mat-icon> Inserir Resultados
            </a>
            <a routerLink="/classificacao" mat-flat-button color="primary">
              <mat-icon>emoji_events</mat-icon> Ver Classificação
            </a>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Últimos jogos -->
      <mat-card *ngIf="ultimosJogos.length > 0" class="recent-card">
        <mat-card-header>
          <mat-card-title>Jogos Recentes</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="jogo-row" *ngFor="let jogo of ultimosJogos">
            <mat-chip [class]="jogo.encerrado ? 'chip-encerrado' : 'chip-aberto'">
              {{ jogo.encerrado ? 'Encerrado' : 'Em aberto' }}
            </mat-chip>
            <span class="jogo-confronto">
              {{ jogo.timeCasa }}
              <span class="placar" *ngIf="jogo.resultado">
                {{ jogo.resultado.golsCasa }} × {{ jogo.resultado.golsVisitante }}
              </span>
              <span class="vs" *ngIf="!jogo.resultado"> vs </span>
              {{ jogo.timeVisitante }}
            </span>
            <span class="jogo-fase">{{ jogo.fase }}</span>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Estado vazio -->
      <mat-card *ngIf="bolao().participantes.length === 0 && bolao().jogos.length === 0" class="empty-card">
        <mat-card-content>
          <div class="empty-state">
            <span class="empty-icon">⚽</span>
            <h2>Bem-vindo ao Bolão!</h2>
            <p>Para começar, configure o bolão e adicione os participantes.</p>
            <div class="empty-actions">
              <a routerLink="/configuracao" mat-flat-button color="primary">Configurar Bolão</a>
              <a routerLink="/participantes" mat-stroked-button color="primary">Adicionar Participantes</a>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-title {
      font-size: 1.8rem;
      font-weight: 700;
      color: #1b5e20;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .summary-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px !important;
    }

    .summary-icon {
      width: 52px;
      height: 52px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .summary-icon mat-icon { font-size: 28px; color: white; }
    .summary-icon.green { background: #2e7d32; }
    .summary-icon.blue { background: #1565c0; }
    .summary-icon.orange { background: #e65100; }
    .summary-icon.gold { background: #f57f17; }

    .summary-value {
      font-size: 1.6rem;
      font-weight: 700;
      color: #212121;
      line-height: 1;
    }

    .summary-label {
      font-size: 0.85rem;
      color: #757575;
      margin-top: 4px;
    }

    .summary-sub {
      font-size: 0.75rem;
      color: #9e9e9e;
      margin-top: 2px;
    }

    .card-link {
      padding: 0;
      font-size: 0.8rem;
      margin-top: 4px;
    }

    .actions-card, .recent-card, .empty-card {
      margin-bottom: 24px;
    }

    .actions-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      padding-top: 8px;
    }

    .actions-grid a {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .jogo-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid #f5f5f5;
    }

    .jogo-row:last-child { border-bottom: none; }

    .chip-encerrado { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-aberto { background: #fff3e0 !important; color: #e65100 !important; }

    .jogo-confronto {
      font-weight: 500;
      flex: 1;
    }

    .vs { color: #9e9e9e; margin: 0 4px; }
    .placar {
      background: #1b5e20;
      color: white;
      padding: 2px 10px;
      border-radius: 12px;
      font-weight: 700;
      margin: 0 8px;
    }

    .jogo-fase {
      font-size: 0.8rem;
      color: #757575;
      background: #f5f5f5;
      padding: 2px 8px;
      border-radius: 8px;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
    }

    .empty-icon { font-size: 4rem; }

    .empty-state h2 {
      color: #1b5e20;
      margin: 16px 0 8px;
    }

    .empty-state p {
      color: #757575;
      margin-bottom: 24px;
    }

    .empty-actions {
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
    }
  `],
})
export class DashboardComponent {
  private readonly bolaoService = inject(BolaoService);

  readonly bolao = this.bolaoService.bolao;
  readonly totalPremio = this.bolaoService.totalPremio;
  readonly vencedores = this.bolaoService.vencedores;

  get jogosTotal(): number { return this.bolao().jogos.length; }
  get jogosEncerrados(): number { return this.bolao().jogos.filter(j => j.encerrado).length; }
  get jogosAbertos(): number { return this.bolao().jogos.filter(j => !j.encerrado).length; }
  get ultimosJogos() { return [...this.bolao().jogos].reverse().slice(0, 5); }
}
