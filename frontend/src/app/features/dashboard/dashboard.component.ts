import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
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
    MatSnackBarModule,
  ],
  template: `
    <div class="dashboard">
      <h1 class="page-title">
        <span>🏆</span> {{ bolao().nome }}
      </h1>

      <!-- Jogos Ao Vivo -->
      <div *ngIf="jogosAoVivo().length > 0" class="ao-vivo-section">
        <div class="section-header ao-vivo-header">
          <span class="live-dot"></span>
          <span>Ao Vivo Agora</span>
          <span class="section-count live-count">{{ jogosAoVivo().length }}</span>
        </div>
        <div class="ao-vivo-grid">
          <div class="ao-vivo-card" *ngFor="let jogo of jogosAoVivo()">
            <div class="ao-vivo-topo">
              <span class="fase-tag">{{ jogo.fase }}</span>
              <span class="minuto-badge" *ngIf="jogo.placardAoVivo!.minuto">{{ jogo.placardAoVivo!.minuto }}'</span>
            </div>
            <div class="ao-vivo-confronto">
              <span class="time-live">{{ jogo.timeCasa }}</span>
              <div class="placar-live">
                <span class="gol-live">{{ jogo.placardAoVivo!.golsCasa }}</span>
                <span class="sep-live">×</span>
                <span class="gol-live">{{ jogo.placardAoVivo!.golsVisitante }}</span>
              </div>
              <span class="time-live">{{ jogo.timeVisitante }}</span>
            </div>
          </div>
        </div>
      </div>

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
            <button mat-stroked-button (click)="importarJogos()" [disabled]="importando()">
              <mat-icon>{{ importando() ? 'hourglass_empty' : 'cloud_download' }}</mat-icon>
              {{ importando() ? 'Importando...' : 'Importar Jogos da Copa' }}
            </button>
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

    /* ── Ao Vivo ── */
    .ao-vivo-section {
      margin-bottom: 28px;
    }

    .ao-vivo-header {
      color: #c62828;
    }

    .ao-vivo-header mat-icon { color: #c62828; }

    .live-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #f44336;
      animation: pulse-live 1.4s infinite;
      flex-shrink: 0;
    }

    @keyframes pulse-live {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.8); }
    }

    .live-count {
      background: #c62828;
    }

    .ao-vivo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 12px;
    }

    .ao-vivo-card {
      background: white;
      border-radius: 12px;
      border: 2px solid #f44336;
      padding: 14px 18px;
      box-shadow: 0 2px 12px rgba(244, 67, 54, 0.15);
    }

    .ao-vivo-topo {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .minuto-badge {
      font-size: 0.78rem;
      font-weight: 700;
      color: #f44336;
      background: #ffebee;
      padding: 2px 8px;
      border-radius: 8px;
    }

    .ao-vivo-confronto {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .time-live {
      font-size: 0.95rem;
      font-weight: 700;
      color: #212121;
      flex: 1;
    }

    .time-live:last-child { text-align: right; }

    .placar-live {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #c62828;
      border-radius: 10px;
      padding: 6px 14px;
    }

    .gol-live {
      font-size: 1.4rem;
      font-weight: 900;
      color: white;
      line-height: 1;
    }

    .sep-live {
      font-size: 1rem;
      color: rgba(255,255,255,0.7);
      font-weight: 600;
    }

    @media (max-width: 600px) {
      .proximos-grid { grid-template-columns: 1fr; }
      .ao-vivo-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class DashboardComponent {
  private readonly bolaoService = inject(BolaoService);
  private readonly snackBar = inject(MatSnackBar);

  readonly bolao = this.bolaoService.bolao;
  readonly importando = signal(false);

  readonly jogosAoVivo = computed(() =>
    this.bolao().jogos.filter(j => !j.encerrado && !!j.placardAoVivo)
  );

  readonly proximosJogos = computed(() =>
    this.bolao().jogos
      .filter(j => !j.encerrado && !!j.dataHora && !j.placardAoVivo)
      .sort((a, b) => new Date(a.dataHora!).getTime() - new Date(b.dataHora!).getTime())
  );

  readonly jogosSemData = computed(() =>
    this.bolao().jogos.filter(j => !j.encerrado && !j.dataHora && !j.placardAoVivo)
  );

  async importarJogos(): Promise<void> {
    this.importando.set(true);
    try {
      const result = await this.bolaoService.importarJogos();
      const msg = result.importados > 0
        ? `${result.importados} jogo(s) importado(s) com sucesso!`
        : `Nenhum jogo novo — ${result.pulados} já estavam cadastrados.`;
      this.snackBar.open(msg, 'OK', { duration: 5000 });
    } catch {
      this.snackBar.open('Erro ao importar jogos. Verifique se a função está publicada no Supabase.', 'OK', { duration: 5000 });
    } finally {
      this.importando.set(false);
    }
  }
}
