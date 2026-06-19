import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BolaoService } from '../../core/services/bolao.service';
import { Jogo, Participante } from '../../core/models';

const getDataBrasilia = (dataHora: string): string =>
  new Date(dataHora).toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });

const formatarChip = (dataStr: string): string => {
  const [y, m, d] = dataStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }).replace('.', '');
};

@Component({
  selector: 'app-palpites',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="palpites-page">
      <div class="page-header">
        <mat-icon class="page-icon">edit_note</mat-icon>
        <div>
          <h1>Palpites</h1>
          <p>Registre os palpites para os jogos abertos.</p>
        </div>
      </div>

      <!-- Filtro por data -->
      <div class="filtro-bar" *ngIf="datasDisponiveis().length > 0">
        <mat-icon class="filtro-icon">calendar_today</mat-icon>
        <div class="filtro-chips">
          <button
            class="chip-data"
            [class.chip-ativo]="filtroData() === ''"
            (click)="filtroData.set('')"
          >Todos</button>
          <button
            class="chip-data"
            *ngFor="let d of datasDisponiveis()"
            [class.chip-ativo]="filtroData() === d"
            (click)="selecionarData(d)"
          >{{ formatarChip(d) }}</button>
        </div>
        <span *ngIf="filtroData()" class="filtro-resultado">
          {{ jogosAbertos().length }} jogo(s)
        </span>
      </div>

      <!-- Alerta: sem participantes -->
      <div *ngIf="semParticipantes" class="alert-card">
        <mat-icon>warning</mat-icon>
        <span>Adicione participantes antes de registrar palpites.</span>
        <a routerLink="/participantes" mat-stroked-button>Ir para Participantes</a>
      </div>

      <!-- Estado vazio: nenhum jogo aberto -->
      <mat-card *ngIf="!semParticipantes && jogosAbertos().length === 0" class="empty-card">
        <mat-card-content>
          <div class="empty-state">
            <span>⚽</span>
            <h2>{{ filtroData() ? 'Nenhum jogo nesta data' : 'Nenhum jogo aberto' }}</h2>
            <p *ngIf="filtroData()">Selecione outra data ou clique em "Todos" para ver todos os jogos.</p>
            <p *ngIf="!filtroData()">Todos os jogos foram encerrados ou não há jogos cadastrados.</p>
            <a *ngIf="!filtroData()" routerLink="/jogos" mat-flat-button color="primary">Ir para Jogos</a>
            <button *ngIf="filtroData()" mat-stroked-button (click)="filtroData.set('')">Ver todos os jogos</button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Cards de jogos abertos -->
      <div *ngFor="let jogo of jogosAbertos(); trackBy: trackById" class="jogo-section">
        <mat-card class="jogo-card">
          <!-- Cabeçalho do jogo (clicável para expandir/retrair) -->
          <div class="jogo-header" (click)="toggleJogo(jogo.id)">
            <div class="jogo-titulo">
              <span class="time">{{ jogo.timeCasa }}</span>
              <span class="vs-badge">VS</span>
              <span class="time">{{ jogo.timeVisitante }}</span>
            </div>
            <div class="jogo-meta">
              <span class="fase-badge">{{ jogo.fase }}</span>
              <span *ngIf="jogo.dataHora" class="data-jogo">
                <mat-icon>event</mat-icon>
                {{ jogo.dataHora | date:'EEE dd/MM':'':'pt-BR' }}
                <mat-icon>schedule</mat-icon>
                {{ jogo.dataHora | date:'HH:mm':'America/Sao_Paulo' }}
              </span>
              <span class="palpites-count">
                <mat-icon>how_to_vote</mat-icon>
                {{ jogo.palpites.length }} / {{ participantes().length }} palpites
              </span>
              <span class="premio-jogo" *ngIf="jogo.palpites.length > 0">
                <mat-icon>monetization_on</mat-icon>
                {{ jogo.palpites.length * valorEntrada() | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
              </span>
              <mat-icon class="expand-icon">
                {{ isExpanded(jogo.id) ? 'expand_less' : 'expand_more' }}
              </mat-icon>
            </div>
          </div>

          <mat-card-content *ngIf="isExpanded(jogo.id)">
            <!-- Cabeçalho da tabela -->
            <div class="tabela-header">
              <span>Participante</span>
              <span class="text-center">{{ jogo.timeCasa }}</span>
              <span></span>
              <span class="text-center">{{ jogo.timeVisitante }}</span>
              <span></span>
            </div>

            <!-- Linha por participante -->
            <div
              class="palpite-row"
              *ngFor="let p of participantes()"
              [class.tem-palpite]="palpiteJaExiste(jogo, p.id)"
            >
              <span class="participante-nome">
                <mat-icon class="person-icon">person</mat-icon>
                <span>{{ p.nome }}</span>
                <span *ngIf="palpiteJaExiste(jogo, p.id)" class="palpite-atual">
                  {{ getPalpiteAtual(jogo, p.id) }}
                </span>
              </span>

              <div class="placar-inputs">
                <input
                  type="number"
                  class="gol-input"
                  [(ngModel)]="getForm(jogo.id)[p.id + '_casa']"
                  min="0"
                  max="20"
                  placeholder="0"
                />
                <span class="x-separator">×</span>
                <input
                  type="number"
                  class="gol-input"
                  [(ngModel)]="getForm(jogo.id)[p.id + '_visitante']"
                  min="0"
                  max="20"
                  placeholder="0"
                />
              </div>

              <div class="row-actions">
                <button
                  mat-flat-button
                  [color]="palpiteJaExiste(jogo, p.id) ? 'accent' : 'primary'"
                  (click)="salvarPalpite(jogo.id, p)"
                  [disabled]="!palpiteValido(jogo.id, p.id)"
                  class="save-btn"
                >
                  <mat-icon>{{ palpiteJaExiste(jogo, p.id) ? 'update' : 'save' }}</mat-icon>
                  {{ palpiteJaExiste(jogo, p.id) ? 'Atualizar' : 'Salvar' }}
                </button>
                <button
                  *ngIf="palpiteJaExiste(jogo, p.id)"
                  mat-icon-button
                  color="warn"
                  (click)="removerPalpite(jogo.id, p)"
                  class="remove-btn"
                  title="Remover palpite"
                >
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .palpites-page { max-width: 860px; }

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

    /* Filtro por data */
    .filtro-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .filtro-icon {
      color: #2e7d32;
      font-size: 20px;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .filtro-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      flex: 1;
    }

    .chip-data {
      padding: 5px 14px;
      border-radius: 20px;
      border: 1.5px solid #c8e6c9;
      background: white;
      color: #2e7d32;
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
      white-space: nowrap;
      text-transform: capitalize;
    }

    .chip-data:hover { background: #e8f5e9; border-color: #2e7d32; }

    .chip-ativo {
      background: #2e7d32 !important;
      color: white !important;
      border-color: #2e7d32 !important;
    }

    .filtro-resultado {
      font-size: 0.82rem;
      color: #757575;
      font-weight: 500;
      white-space: nowrap;
    }

    /* Alert */
    .alert-card {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #fff3e0;
      border: 1px solid #ff9800;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .alert-card mat-icon { color: #f57c00; }

    /* Empty state */
    .empty-card mat-card-content { padding: 0 !important; }
    .empty-state {
      text-align: center;
      padding: 40px 20px;
    }
    .empty-state span { font-size: 4rem; }
    .empty-state h2 { color: #1b5e20; margin: 16px 0 8px; }
    .empty-state p { color: #757575; margin-bottom: 24px; }

    /* Jogo card */
    .jogo-section { margin-bottom: 24px; }

    .jogo-card { overflow: hidden; }

    .jogo-header {
      background: linear-gradient(135deg, #1b5e20, #2e7d32);
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;
      cursor: pointer;
      user-select: none;
      transition: filter 0.15s;
    }

    .jogo-header:hover { filter: brightness(1.1); }

    .expand-icon {
      color: rgba(255,255,255,0.8);
      font-size: 22px;
      width: 22px;
      height: 22px;
      transition: transform 0.2s;
    }

    .jogo-titulo {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .time {
      font-size: 1.2rem;
      font-weight: 700;
      color: white;
    }

    .vs-badge {
      background: rgba(255,255,255,0.2);
      color: #ffd600;
      padding: 2px 10px;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 700;
    }

    .jogo-meta {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .fase-badge {
      background: rgba(255,255,255,0.15);
      color: rgba(255,255,255,0.9);
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 0.78rem;
    }

    .data-jogo {
      display: flex;
      align-items: center;
      gap: 3px;
      color: rgba(255,255,255,0.85);
      font-size: 0.8rem;
      background: rgba(255,255,255,0.1);
      padding: 3px 8px;
      border-radius: 10px;
      text-transform: capitalize;
    }

    .data-jogo mat-icon {
      font-size: 13px;
      width: 13px;
      height: 13px;
      opacity: 0.8;
    }

    .palpites-count {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #ffd600;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .palpites-count mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .premio-jogo {
      display: flex;
      align-items: center;
      gap: 4px;
      background: rgba(255, 214, 0, 0.25);
      color: #ffd600;
      font-size: 0.88rem;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 12px;
    }

    .premio-jogo mat-icon {
      font-size: 15px;
      width: 15px;
      height: 15px;
    }

    /* Tabela */
    .tabela-header {
      display: grid;
      grid-template-columns: 1fr 70px 24px 70px auto;
      gap: 8px;
      padding: 8px 16px;
      background: #f5f5f5;
      font-size: 0.75rem;
      font-weight: 600;
      color: #757575;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      align-items: center;
    }

    .text-center { text-align: center; }

    .palpite-row {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 12px;
      align-items: center;
      padding: 10px 16px;
      border-bottom: 1px solid #f0f0f0;
      transition: background 0.15s;
    }

    .palpite-row:last-child { border-bottom: none; }
    .palpite-row:hover { background: #fafafa; }
    .palpite-row.tem-palpite { background: #f9fbe7; }
    .palpite-row.tem-palpite:hover { background: #f0f4c3; }

    .participante-nome {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;
      flex-wrap: wrap;
    }

    .person-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #9e9e9e;
    }

    .palpite-atual {
      background: #e8f5e9;
      color: #2e7d32;
      font-size: 0.78rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 10px;
      margin-left: 4px;
    }

    .placar-inputs {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .gol-input {
      width: 52px;
      height: 40px;
      text-align: center;
      font-size: 1.1rem;
      font-weight: 700;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      outline: none;
      transition: border-color 0.2s;
    }

    .gol-input:focus { border-color: #2e7d32; }

    .x-separator {
      font-weight: 700;
      color: #9e9e9e;
      font-size: 1.1rem;
    }

    .row-actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .save-btn {
      font-size: 0.8rem !important;
      height: 36px;
    }

    .remove-btn {
      width: 36px;
      height: 36px;
      flex-shrink: 0;
    }

    @media (max-width: 600px) {
      .tabela-header { display: none; }
      .palpite-row { grid-template-columns: 1fr; gap: 8px; }

      /* Cabeçalho do jogo mais compacto no mobile */
      .jogo-header { padding: 10px 12px; }
      .jogo-titulo { gap: 6px; }
      .time { font-size: 0.88rem; }
      .vs-badge { font-size: 0.7rem; padding: 1px 5px; }

      /* Oculta fase e contagem de palpites no mobile */
      .fase-badge { display: none; }
      .palpites-count { display: none; }

      /* Mantém apenas data e prêmio na meta */
      .jogo-meta { gap: 6px; }
    }
  `],
})
export class PalpitesComponent {
  private readonly bolaoService = inject(BolaoService);
  private readonly snackBar = inject(MatSnackBar);

  private readonly forms: Record<string, Record<string, number>> = {};
  private readonly expandedJogos = signal<Set<string>>(new Set());

  readonly filtroData = signal('');

  readonly datasDisponiveis = computed(() => {
    const datas = new Set<string>();
    for (const jogo of this.bolaoService.bolao().jogos.filter(j => !j.encerrado && !!j.dataHora)) {
      datas.add(getDataBrasilia(jogo.dataHora!));
    }
    return Array.from(datas).sort();
  });

  readonly jogosAbertos = computed(() => {
    const filtro = this.filtroData();
    return this.bolaoService.bolao().jogos.filter(j => {
      if (j.encerrado) return false;
      if (filtro) {
        if (!j.dataHora) return false;
        return getDataBrasilia(j.dataHora) === filtro;
      }
      return true;
    });
  });

  readonly participantes = () => this.bolaoService.bolao().participantes;
  readonly valorEntrada = () => this.bolaoService.bolao().valorEntrada;

  readonly formatarChip = formatarChip;

  get semParticipantes(): boolean {
    return this.participantes().length === 0;
  }

  selecionarData(data: string): void {
    this.filtroData.set(this.filtroData() === data ? '' : data);
  }

  trackById(_: number, jogo: Jogo): string {
    return jogo.id;
  }

  isExpanded(jogoId: string): boolean {
    return this.expandedJogos().has(jogoId);
  }

  toggleJogo(jogoId: string): void {
    this.expandedJogos.update(set => {
      const next = new Set(set);
      if (next.has(jogoId)) {
        next.delete(jogoId);
      } else {
        next.add(jogoId);
      }
      return next;
    });
  }

  getForm(jogoId: string): Record<string, number> {
    if (!this.forms[jogoId]) {
      this.forms[jogoId] = {};
      const jogo = this.bolaoService.bolao().jogos.find(j => j.id === jogoId);
      if (jogo) {
        for (const palpite of jogo.palpites) {
          this.forms[jogoId][`${palpite.participanteId}_casa`] = palpite.golsCasa;
          this.forms[jogoId][`${palpite.participanteId}_visitante`] = palpite.golsVisitante;
        }
      }
    }
    return this.forms[jogoId];
  }

  palpiteValido(jogoId: string, participanteId: string): boolean {
    const form = this.forms[jogoId] ?? {};
    const casa = form[`${participanteId}_casa`];
    const visitante = form[`${participanteId}_visitante`];
    return casa !== undefined && casa !== null && !isNaN(Number(casa)) &&
           visitante !== undefined && visitante !== null && !isNaN(Number(visitante)) &&
           Number(casa) >= 0 && Number(visitante) >= 0;
  }

  palpiteJaExiste(jogo: Jogo, participanteId: string): boolean {
    return !!jogo.palpites.some(p => p.participanteId === participanteId);
  }

  getPalpiteAtual(jogo: Jogo, participanteId: string): string {
    const p = jogo.palpites.find(x => x.participanteId === participanteId);
    return p ? `${p.golsCasa}×${p.golsVisitante}` : '';
  }

  salvarPalpite(jogoId: string, participante: Participante): void {
    if (!this.palpiteValido(jogoId, participante.id)) return;
    const form = this.forms[jogoId];
    const casa = Math.max(0, Math.floor(Number(form[`${participante.id}_casa`] ?? 0)));
    const visitante = Math.max(0, Math.floor(Number(form[`${participante.id}_visitante`] ?? 0)));
    this.bolaoService.registrarPalpite(jogoId, participante.id, casa, visitante);
    this.snackBar.open(`Palpite de ${participante.nome} salvo: ${casa}×${visitante}`, 'OK', {
      duration: 2500,
    });
  }

  removerPalpite(jogoId: string, participante: Participante): void {
    this.bolaoService.removerPalpite(jogoId, participante.id);
    if (this.forms[jogoId]) {
      delete this.forms[jogoId][`${participante.id}_casa`];
      delete this.forms[jogoId][`${participante.id}_visitante`];
    }
    this.snackBar.open(`Palpite de ${participante.nome} removido.`, 'OK', { duration: 2500 });
  }
}
