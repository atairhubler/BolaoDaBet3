import { Component, inject, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
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
    DatePipe,
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

      <!-- Próximos Jogos em Destaque -->
      <div *ngIf="proximosJogos().length > 0" class="proximos-section">
        <div class="section-header">
          <mat-icon>upcoming</mat-icon>
          <span>Próximos Jogos</span>
          <span class="section-count">{{ proximosJogos().length }}</span>
        </div>

        <div class="proximos-grid">
          <div class="proximo-card" *ngFor="let jogo of proximosJogos()">
            <div class="proximo-data">
              <div class="data-dia">{{ jogo.dataHora | date:'EEE':'':'pt-BR' }}</div>
              <div class="data-numero">{{ jogo.dataHora | date:'dd/MM' }}</div>
              <div class="data-hora">{{ jogo.dataHora | date:'HH:mm':'America/Sao_Paulo' }}</div>
            </div>
            <div class="proximo-divider"></div>
            <div class="proximo-confronto">
              <div class="fase-tag">{{ jogo.fase }}</div>
              <div class="confronto-times">
                <span class="time-nome">{{ jogo.timeCasa }}</span>
                <span class="vs-separador">VS</span>
                <span class="time-nome">{{ jogo.timeVisitante }}</span>
              </div>
              <div class="palpites-badge" *ngIf="jogo.palpites.length > 0">
                <mat-icon>how_to_vote</mat-icon>
                {{ jogo.palpites.length }} palpite(s)
              </div>
              <div class="sem-palpites" *ngIf="jogo.palpites.length === 0">
                <mat-icon>warning_amber</mat-icon>
                Sem palpites ainda
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Jogos sem data registrada (em aberto mas sem horário) -->
      <div *ngIf="jogosSemData().length > 0" class="sem-data-section">
        <div class="section-header secondary">
          <mat-icon>sports_soccer</mat-icon>
          <span>Jogos em Aberto (sem data)</span>
          <span class="section-count secondary">{{ jogosSemData().length }}</span>
        </div>
        <div class="sem-data-list">
          <div class="sem-data-row" *ngFor="let jogo of jogosSemData()">
            <span class="time-sd">{{ jogo.timeCasa }}</span>
            <span class="vs-sd">VS</span>
            <span class="time-sd">{{ jogo.timeVisitante }}</span>
            <span class="fase-sd">{{ jogo.fase }}</span>
          </div>
        </div>
      </div>

      <!-- Ações Rápidas -->
      <mat-card class="actions-card">
        <mat-card-header>
          <mat-card-title>Ações Rápidas</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="actions-grid">
            <a routerLink="/jogos" mat-stroked-button color="primary">
              <mat-icon>add_circle</mat-icon> Cadastrar Jogo
            </a>
            <a routerLink="/palpites" mat-stroked-button color="primary">
              <mat-icon>edit_note</mat-icon> Registrar Palpites
            </a>
            <a routerLink="/classificacao" mat-flat-button color="primary">
              <mat-icon>emoji_events</mat-icon> Ver Classificação
            </a>
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

    /* ── Seção próximos jogos ── */
    .proximos-section {
      margin-bottom: 28px;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 14px;
      font-size: 1.05rem;
      font-weight: 700;
      color: #1b5e20;
    }

    .section-header mat-icon { color: #2e7d32; }

    .section-header.secondary {
      color: #555;
      font-weight: 600;
      font-size: 0.95rem;
    }

    .section-header.secondary mat-icon { color: #9e9e9e; }

    .section-count {
      background: #2e7d32;
      color: white;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 10px;
    }

    .section-count.secondary {
      background: #bdbdbd;
    }

    .proximos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 14px;
    }

    .proximo-card {
      display: flex;
      align-items: stretch;
      background: white;
      border-radius: 12px;
      border: 1px solid #e0e0e0;
      border-left: 4px solid #2e7d32;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      transition: box-shadow 0.15s, transform 0.15s;
    }

    .proximo-card:hover {
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
      transform: translateY(-2px);
    }

    .proximo-data {
      background: #1b5e20;
      color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 14px 16px;
      min-width: 72px;
      gap: 2px;
    }

    .data-dia {
      font-size: 0.68rem;
      font-weight: 600;
      text-transform: uppercase;
      opacity: 0.8;
      letter-spacing: 0.5px;
    }

    .data-numero {
      font-size: 1.3rem;
      font-weight: 900;
      line-height: 1.1;
    }

    .data-hora {
      font-size: 0.78rem;
      font-weight: 600;
      background: rgba(255,255,255,0.18);
      padding: 2px 6px;
      border-radius: 8px;
      margin-top: 4px;
    }

    .proximo-divider {
      width: 1px;
      background: #e0e0e0;
    }

    .proximo-confronto {
      flex: 1;
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .fase-tag {
      font-size: 0.72rem;
      color: #757575;
      background: #f5f5f5;
      padding: 2px 8px;
      border-radius: 8px;
      align-self: flex-start;
    }

    .confronto-times {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .time-nome {
      font-size: 0.95rem;
      font-weight: 700;
      color: #212121;
    }

    .vs-separador {
      font-size: 0.75rem;
      font-weight: 800;
      color: #9e9e9e;
      letter-spacing: 1px;
    }

    .palpites-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.75rem;
      color: #2e7d32;
      font-weight: 600;
    }

    .palpites-badge mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .sem-palpites {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.75rem;
      color: #e65100;
      font-weight: 500;
    }

    .sem-palpites mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    /* ── Jogos sem data ── */
    .sem-data-section {
      margin-bottom: 24px;
    }

    .sem-data-list {
      background: white;
      border-radius: 10px;
      border: 1px solid #e0e0e0;
      overflow: hidden;
    }

    .sem-data-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      border-bottom: 1px solid #f5f5f5;
      font-size: 0.9rem;
    }

    .sem-data-row:last-child { border-bottom: none; }

    .time-sd { font-weight: 600; color: #424242; }
    .vs-sd { color: #9e9e9e; font-size: 0.8rem; font-weight: 700; }

    .fase-sd {
      margin-left: auto;
      font-size: 0.75rem;
      color: #757575;
      background: #f5f5f5;
      padding: 2px 8px;
      border-radius: 8px;
    }

    /* ── Ações rápidas ── */
    .actions-card, .empty-card {
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

    /* ── Estado vazio ── */
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

    @media (max-width: 600px) {
      .proximos-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class DashboardComponent {
  private readonly bolaoService = inject(BolaoService);

  readonly bolao = this.bolaoService.bolao;

  readonly proximosJogos = computed(() =>
    this.bolao().jogos
      .filter(j => !j.encerrado && !!j.dataHora)
      .sort((a, b) => new Date(a.dataHora!).getTime() - new Date(b.dataHora!).getTime())
  );

  readonly jogosSemData = computed(() =>
    this.bolao().jogos.filter(j => !j.encerrado && !j.dataHora)
  );
}
