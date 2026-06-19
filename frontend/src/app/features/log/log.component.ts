import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { BolaoService } from '../../core/services/bolao.service';
import { PalpiteLog } from '../../core/models';

@Component({
  selector: 'app-log',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  template: `
    <div class="log-page">
      <div class="page-header">
        <mat-icon class="page-icon">history</mat-icon>
        <div>
          <h1>Log de Palpites</h1>
          <p>Histórico completo de registros e alterações — visível a todos para evitar fraudes.</p>
        </div>
      </div>

      <!-- Carregando -->
      <div *ngIf="carregando()" class="loading-state">
        <mat-spinner diameter="40"></mat-spinner>
        <span>Carregando histórico...</span>
      </div>

      <!-- Vazio -->
      <mat-card *ngIf="!carregando() && logs().length === 0" class="empty-card">
        <mat-card-content>
          <div class="empty-state">
            <mat-icon>manage_search</mat-icon>
            <h2>Nenhum palpite registrado ainda</h2>
            <p>Os registros aparecerão aqui assim que os participantes enviarem seus palpites.</p>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Contador -->
      <div *ngIf="!carregando() && logs().length > 0" class="summary-bar">
        <mat-icon>receipt_long</mat-icon>
        <span>{{ logs().length }} registro{{ logs().length !== 1 ? 's' : '' }} no total</span>
        <span class="live-dot" title="Atualizações em tempo real"></span>
        <span class="live-label">ao vivo</span>
      </div>

      <!-- Lista de logs -->
      <div *ngIf="!carregando()" class="log-list">
        <div *ngFor="let log of logs(); trackBy: trackById" class="log-entry">
          <div class="log-timeline">
            <div class="timeline-dot"
              [class.dot-criado]="log.acao === 'CRIADO'"
              [class.dot-atualizado]="log.acao === 'ATUALIZADO'"
              [class.dot-removido]="log.acao === 'REMOVIDO'"></div>
            <div class="timeline-line"></div>
          </div>

          <div class="log-card"
            [class.card-atualizado]="log.acao === 'ATUALIZADO'"
            [class.card-removido]="log.acao === 'REMOVIDO'">
            <div class="log-header">
              <div class="log-participante">
                <mat-icon>person</mat-icon>
                <span>{{ log.participante_nome }}</span>
              </div>
              <span class="acao-badge"
                [class.badge-criado]="log.acao === 'CRIADO'"
                [class.badge-atualizado]="log.acao === 'ATUALIZADO'"
                [class.badge-removido]="log.acao === 'REMOVIDO'">
                <mat-icon>{{ log.acao === 'CRIADO' ? 'add_circle' : log.acao === 'ATUALIZADO' ? 'edit' : 'delete' }}</mat-icon>
                {{ log.acao }}
              </span>
            </div>

            <div class="log-jogo">
              <span class="time-nome">{{ log.time_casa }}</span>
              <div class="placar-badge">
                <span class="placar-gol">{{ log.gols_casa }}</span>
                <span class="placar-x">×</span>
                <span class="placar-gol">{{ log.gols_visitante }}</span>
              </div>
              <span class="time-nome">{{ log.time_visitante }}</span>
            </div>

            <div class="log-data">
              <mat-icon>schedule</mat-icon>
              <span>{{ log.created_at | date:'dd/MM/yyyy HH:mm:ss':'America/Sao_Paulo' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .log-page { max-width: 760px; }

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
      color: #2e7d32;
    }

    .page-header h1 {
      margin: 0;
      font-size: 1.6rem;
      font-weight: 700;
      color: #1b5e20;
    }

    .page-header p { margin: 4px 0 0; color: #757575; }

    /* Loading */
    .loading-state {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 40px 0;
      color: #757575;
    }

    /* Empty */
    .empty-card mat-card-content { padding: 0 !important; }
    .empty-state {
      text-align: center;
      padding: 48px 20px;
    }
    .empty-state mat-icon {
      font-size: 3.5rem;
      width: 3.5rem;
      height: 3.5rem;
      color: #bdbdbd;
    }
    .empty-state h2 { color: #1b5e20; margin: 16px 0 8px; }
    .empty-state p  { color: #9e9e9e; }

    /* Summary bar */
    .summary-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 20px;
      color: #555;
      font-size: 0.9rem;
    }

    .summary-bar mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #2e7d32;
    }

    .live-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #4caf50;
      animation: pulse 1.5s infinite;
      margin-left: 8px;
    }

    .live-label {
      font-size: 0.78rem;
      color: #4caf50;
      font-weight: 600;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.3; }
    }

    /* Timeline */
    .log-list { display: flex; flex-direction: column; }

    .log-entry {
      display: flex;
      gap: 12px;
      margin-bottom: 4px;
    }

    .log-timeline {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 20px;
      flex-shrink: 0;
    }

    .timeline-dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      margin-top: 18px;
      flex-shrink: 0;
    }

    .dot-criado    { background: #2e7d32; }
    .dot-atualizado { background: #f57c00; }

    .timeline-line {
      flex: 1;
      width: 2px;
      background: #e0e0e0;
      margin-top: 2px;
    }

    .log-entry:last-child .timeline-line { display: none; }

    /* Log card */
    .log-card {
      flex: 1;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 10px;
      padding: 12px 16px;
      margin-bottom: 10px;
      border-left: 3px solid #2e7d32;
      transition: box-shadow 0.15s;
    }

    .log-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }

    .card-atualizado { border-left-color: #f57c00; }
    .card-removido   { border-left-color: #c62828; background: #fff8f8; }

    .dot-removido { background: #c62828; }

    .badge-removido {
      background: #ffebee;
      color: #b71c1c;
    }

    .log-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .log-participante {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      color: #1b5e20;
      font-size: 0.95rem;
    }

    .log-participante mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #9e9e9e;
    }

    .acao-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .acao-badge mat-icon {
      font-size: 13px;
      width: 13px;
      height: 13px;
    }

    .badge-criado {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .badge-atualizado {
      background: #fff3e0;
      color: #e65100;
    }

    .log-jogo {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
      flex-wrap: wrap;
    }

    .time-nome {
      font-size: 0.88rem;
      color: #424242;
    }

    .placar-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      background: #1b5e20;
      border-radius: 8px;
      padding: 2px 10px;
    }

    .placar-gol {
      font-size: 1rem;
      font-weight: 700;
      color: white;
    }

    .placar-x {
      font-size: 0.75rem;
      color: rgba(255,255,255,0.7);
      font-weight: 600;
    }

    .log-data {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #9e9e9e;
      font-size: 0.78rem;
    }

    .log-data mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    @media (max-width: 600px) {
      .log-jogo { gap: 6px; }
      .time-nome { font-size: 0.8rem; }
    }
  `],
})
export class LogComponent implements OnInit, OnDestroy {
  private readonly bolaoService = inject(BolaoService);

  readonly logs = signal<PalpiteLog[]>([]);
  readonly carregando = signal(true);

  private unsubscribe?: () => void;

  async ngOnInit(): Promise<void> {
    const dados = await this.bolaoService.carregarLogs();
    this.logs.set(dados);
    this.carregando.set(false);

    this.unsubscribe = this.bolaoService.inscricaoLogs((novoLog) => {
      this.logs.update(atual => [novoLog, ...atual]);
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe?.();
  }

  trackById(_: number, log: PalpiteLog): number {
    return log.id;
  }
}
