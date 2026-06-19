import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BolaoService } from '../../core/services/bolao.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

const FASES_COPA = [
  'Fase de Grupos',
  'Oitavas de Final',
  'Quartas de Final',
  'Semifinal',
  'Disputa 3º Lugar',
  'Final',
];

const TIMES_COPA = [
  'África do Sul', 'Alemanha', 'Arábia Saudita', 'Argélia', 'Argentina',
  'Austrália', 'Áustria', 'Bélgica', 'Bósnia e Herzegovina', 'Brasil',
  'Cabo Verde', 'Canadá', 'Colômbia', 'Congo RD', 'Coreia do Sul',
  'Costa do Marfim', 'Croácia', 'Curaçao', 'Egito', 'Equador',
  'Escócia', 'Espanha', 'Estados Unidos', 'França', 'Ghana',
  'Haiti', 'Holanda', 'Inglaterra', 'Irã', 'Iraque',
  'Japão', 'Jordânia', 'Marrocos', 'México', 'Noruega',
  'Nova Zelândia', 'Panamá', 'Paraguai', 'Portugal', 'Qatar',
  'Senegal', 'Suécia', 'Suíça', 'Tchéquia', 'Tunísia',
  'Turquia', 'Uruguai', 'Uzbequistão',
];

@Component({
  selector: 'app-jogos',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="jogos-page">
      <div class="page-header">
        <mat-icon class="page-icon">sports_soccer</mat-icon>
        <div>
          <h1>Jogos</h1>
          <p>Cadastre os jogos da Copa do Mundo para o bolão.</p>
        </div>
      </div>

      <!-- Formulário de adição -->
      <mat-card class="add-card">
        <mat-card-header>
          <mat-card-title>Cadastrar Novo Jogo</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="add-form">
            <mat-form-field appearance="outline">
              <mat-label>Time da Casa</mat-label>
              <mat-select [(ngModel)]="timeCasa">
                <mat-option *ngFor="let t of timesDisponiveis" [value]="t">{{ t }}</mat-option>
              </mat-select>
            </mat-form-field>

            <div class="vs-divider">VS</div>

            <mat-form-field appearance="outline">
              <mat-label>Time Visitante</mat-label>
              <mat-select [(ngModel)]="timeVisitante">
                <mat-option *ngFor="let t of timesDisponiveis" [value]="t">{{ t }}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Fase da Copa</mat-label>
              <mat-select [(ngModel)]="fase">
                <mat-option *ngFor="let f of fases" [value]="f">{{ f }}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Data e Hora</mat-label>
              <input
                matInput
                type="datetime-local"
                [(ngModel)]="dataHora"
                placeholder="Opcional"
              />
              <mat-icon matSuffix>schedule</mat-icon>
            </mat-form-field>
          </div>

          <mat-error *ngIf="timeCasa && timeVisitante && timeCasa === timeVisitante">
            Os times devem ser diferentes!
          </mat-error>

          <div class="add-actions">
            <button
              mat-flat-button
              color="primary"
              (click)="adicionar()"
              [disabled]="!timeCasa || !timeVisitante || !fase || timeCasa === timeVisitante"
            >
              <mat-icon>add</mat-icon> Adicionar Jogo
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Busca por seleção -->
      <div class="busca-bar">
        <mat-icon class="filtro-icon">search</mat-icon>
        <input
          class="busca-input"
          type="text"
          placeholder="Buscar por seleção..."
          [value]="filtroTime()"
          (input)="filtroTime.set($any($event.target).value)"
        />
        <button *ngIf="filtroTime()" class="busca-clear" (click)="filtroTime.set('')" title="Limpar">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Jogos Abertos -->
      <mat-card class="list-card list-card-abertos">
        <mat-card-header>
          <mat-card-title>
            Jogos em Aberto
            <mat-chip class="count-chip count-abertos">{{ jogosAbertos().length }}</mat-chip>
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <div class="empty-jogos" *ngIf="jogosAbertos().length === 0">
            <mat-icon>{{ filtroTime() ? 'search_off' : 'check_circle' }}</mat-icon>
            <p *ngIf="filtroTime()">Nenhuma seleção encontrada para "<strong>{{ filtroTime() }}</strong>".</p>
            <p *ngIf="!filtroTime()">Nenhum jogo aberto no momento.</p>
            <button *ngIf="filtroTime()" mat-stroked-button (click)="filtroTime.set('')" style="margin-top:8px">
              Limpar busca
            </button>
          </div>

          <div class="jogo-item jogo-aberto" *ngFor="let jogo of jogosAbertos()">
            <div class="jogo-header">
              <mat-chip class="chip-aberto">⏳ Em aberto</mat-chip>
              <span class="fase-badge">{{ jogo.fase }}</span>
              <span *ngIf="jogo.dataHora" class="data-hora-badge">
                <mat-icon>schedule</mat-icon>
                {{ jogo.dataHora | date:'dd/MM/yyyy HH:mm' }}
              </span>
            </div>

            <div class="jogo-placar">
              <span class="time time-casa">{{ jogo.timeCasa }}</span>
              <div class="placar-box">
                <span class="vs-text">VS</span>
              </div>
              <span class="time time-visitante">{{ jogo.timeVisitante }}</span>
            </div>

            <!-- Edição inline de data/hora -->
            <div class="edit-datahora" *ngIf="editandoId === jogo.id">
              <input
                type="datetime-local"
                class="datahora-input"
                [(ngModel)]="editandoValor"
              />
              <button mat-flat-button color="primary" (click)="salvarDataHora(jogo.id)">
                <mat-icon>check</mat-icon> Salvar
              </button>
              <button mat-stroked-button (click)="cancelarEdicao()">
                <mat-icon>close</mat-icon>
              </button>
            </div>

            <div class="jogo-footer">
              <span class="palpites-count">
                <mat-icon>how_to_vote</mat-icon>
                {{ jogo.palpites.length }} palpite(s)
              </span>
              <div class="footer-actions">
                <button mat-icon-button color="primary" (click)="editarDataHora(jogo)" title="Editar data/hora">
                  <mat-icon>edit_calendar</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="remover(jogo)">
                  <mat-icon>delete_outline</mat-icon>
                </button>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Toggle jogos encerrados -->
      <div class="encerrados-toggle" *ngIf="jogosEncerrados().length > 0">
        <button mat-stroked-button (click)="toggleEncerrados()">
          <mat-icon>{{ mostrarEncerrados() ? 'expand_less' : 'expand_more' }}</mat-icon>
          {{ mostrarEncerrados() ? 'Ocultar' : 'Ver' }} jogos encerrados
          <span class="count-encerrados">{{ jogosEncerrados().length }}</span>
        </button>
      </div>

      <!-- Jogos Encerrados (colapsável) -->
      <mat-card class="list-card list-card-encerrados" *ngIf="mostrarEncerrados() && jogosEncerrados().length > 0">
        <mat-card-header>
          <mat-card-title>
            Jogos Encerrados
            <mat-chip class="count-chip count-encerrados-chip">{{ jogosEncerrados().length }}</mat-chip>
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <div class="jogo-item jogo-encerrado" *ngFor="let jogo of jogosEncerrados()">
            <div class="jogo-header">
              <mat-chip class="chip-encerrado">✓ Encerrado</mat-chip>
              <span class="fase-badge">{{ jogo.fase }}</span>
              <span *ngIf="jogo.dataHora" class="data-hora-badge">
                <mat-icon>schedule</mat-icon>
                {{ jogo.dataHora | date:'dd/MM/yyyy HH:mm' }}
              </span>
            </div>

            <div class="jogo-placar">
              <span class="time time-casa">{{ jogo.timeCasa }}</span>
              <div class="placar-box">
                <span *ngIf="jogo.resultado" class="resultado-placar">
                  {{ jogo.resultado.golsCasa }} × {{ jogo.resultado.golsVisitante }}
                </span>
              </div>
              <span class="time time-visitante">{{ jogo.timeVisitante }}</span>
            </div>

            <div class="jogo-footer">
              <span class="palpites-count">
                <mat-icon>how_to_vote</mat-icon>
                {{ jogo.palpites.length }} palpite(s)
              </span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .jogos-page { max-width: 800px; }

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

    .add-card { margin-bottom: 20px; }

    .busca-bar {
      display: flex;
      align-items: center;
      background: #fff;
      border: 1.5px solid #e0e0e0;
      border-radius: 24px;
      padding: 8px 16px;
      margin-bottom: 16px;
      gap: 8px;
      transition: border-color 0.2s;
    }

    .busca-bar:focus-within { border-color: #43a047; }

    .filtro-icon { color: #9e9e9e; font-size: 1.2rem; width: 1.2rem; height: 1.2rem; }

    .busca-input {
      flex: 1;
      border: none;
      outline: none;
      font-size: 0.95rem;
      background: transparent;
      color: #212121;
    }

    .busca-clear {
      background: none;
      border: none;
      cursor: pointer;
      padding: 2px;
      display: flex;
      align-items: center;
      color: #9e9e9e;
      border-radius: 50%;
      transition: background 0.15s;
    }

    .busca-clear:hover { background: #f5f5f5; color: #616161; }
    .busca-clear mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }

    .add-form {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: flex-start;
      padding: 8px 0;
    }

    .add-form mat-form-field { min-width: 180px; }

    .vs-divider {
      font-weight: 900;
      font-size: 1.2rem;
      color: #9e9e9e;
      padding: 16px 4px 0;
    }

    .add-actions {
      margin-top: 4px;
      display: flex;
      justify-content: flex-end;
    }

    .add-actions button {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .count-chip {
      margin-left: 10px;
      background: #e8f5e9 !important;
      color: #2e7d32 !important;
      font-size: 0.8rem !important;
    }

    .empty-jogos {
      text-align: center;
      padding: 40px 20px;
      color: #9e9e9e;
    }

    .empty-jogos mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      margin-bottom: 12px;
    }

    .jogo-item {
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 12px;
      transition: box-shadow 0.2s;
    }

    .jogo-item:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }

    .jogo-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }

    .list-card-abertos {
      border-left: 4px solid #2e7d32;
    }

    .list-card-encerrados {
      opacity: 0.85;
      border-left: 4px solid #bdbdbd;
    }

    .jogo-aberto {
      border-color: #c8e6c9;
    }

    .jogo-encerrado {
      background: #fafafa;
      border-color: #e0e0e0;
    }

    .encerrados-toggle {
      display: flex;
      justify-content: center;
      margin: 8px 0 12px;
    }

    .encerrados-toggle button {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #757575;
      border-color: #e0e0e0;
    }

    .count-encerrados {
      background: #e0e0e0;
      color: #616161;
      border-radius: 10px;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 1px 6px;
      min-width: 18px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .count-abertos {
      background: #e8f5e9 !important;
      color: #2e7d32 !important;
    }

    .count-encerrados-chip {
      background: #eeeeee !important;
      color: #616161 !important;
    }

    .chip-encerrado { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-aberto { background: #fff3e0 !important; color: #e65100 !important; }

    .fase-badge {
      font-size: 0.8rem;
      color: #757575;
      background: #f5f5f5;
      padding: 3px 10px;
      border-radius: 10px;
    }

    .data-hora-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.8rem;
      color: #1565c0;
      background: #e3f2fd;
      padding: 3px 10px;
      border-radius: 10px;
    }

    .data-hora-badge mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .jogo-placar {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 12px 0;
    }

    .time {
      font-size: 1.1rem;
      font-weight: 600;
      color: #212121;
      min-width: 100px;
    }

    .time-casa { text-align: right; }
    .time-visitante { text-align: left; }

    .placar-box {
      min-width: 80px;
      text-align: center;
    }

    .resultado-placar {
      font-size: 1.4rem;
      font-weight: 900;
      color: #1b5e20;
      background: #e8f5e9;
      padding: 4px 16px;
      border-radius: 8px;
    }

    .vs-text {
      font-size: 1.1rem;
      font-weight: 700;
      color: #9e9e9e;
    }

    .jogo-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #f5f5f5;
    }

    .palpites-count {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.85rem;
      color: #757575;
    }

    .palpites-count mat-icon { font-size: 18px; width: 18px; height: 18px; }

    .footer-actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .edit-datahora {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 0;
      flex-wrap: wrap;
      border-top: 1px dashed #c8e6c9;
    }

    .datahora-input {
      height: 36px;
      border: 2px solid #2e7d32;
      border-radius: 6px;
      padding: 0 8px;
      font-size: 0.9rem;
      outline: none;
    }

    @media (max-width: 600px) {
      .add-form { flex-direction: column; }
      .add-form mat-form-field { width: 100%; }
      .vs-divider { padding: 0; }
      .jogo-placar { flex-direction: column; gap: 8px; }
      .time { text-align: center; }
    }
  `],
})
export class JogosComponent {
  private readonly bolaoService = inject(BolaoService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  timeCasa = '';
  timeVisitante = '';
  fase = '';
  dataHora = '';

  editandoId: string | null = null;
  editandoValor = '';

  readonly mostrarEncerrados = signal(false);
  readonly filtroTime = signal('');

  readonly fases = FASES_COPA;
  readonly timesDisponiveis = TIMES_COPA;
  readonly jogos = () => this.bolaoService.bolao().jogos;

  readonly jogosAbertos = computed(() => {
    const busca = this.filtroTime().toLowerCase().trim();
    return this.bolaoService.bolao().jogos.filter(j => {
      if (j.encerrado) return false;
      if (busca && !j.timeCasa.toLowerCase().includes(busca) && !j.timeVisitante.toLowerCase().includes(busca)) return false;
      return true;
    });
  });

  readonly jogosEncerrados = computed(() => {
    const busca = this.filtroTime().toLowerCase().trim();
    return this.bolaoService.bolao().jogos.filter(j => {
      if (!j.encerrado) return false;
      if (busca && !j.timeCasa.toLowerCase().includes(busca) && !j.timeVisitante.toLowerCase().includes(busca)) return false;
      return true;
    });
  });

  toggleEncerrados(): void {
    this.mostrarEncerrados.update(v => !v);
  }

  adicionar(): void {
    if (!this.timeCasa || !this.timeVisitante || !this.fase || this.timeCasa === this.timeVisitante) return;

    this.bolaoService.adicionarJogo(this.timeCasa, this.timeVisitante, this.fase, this.dataHora || undefined);
    this.snackBar.open(`${this.timeCasa} vs ${this.timeVisitante} adicionado!`, 'OK', {
      duration: 2500,
    });
    this.timeCasa = '';
    this.timeVisitante = '';
    this.fase = '';
    this.dataHora = '';
  }

  editarDataHora(jogo: { id: string; dataHora?: string }): void {
    this.editandoId = jogo.id;
    this.editandoValor = jogo.dataHora ?? '';
  }

  salvarDataHora(jogoId: string): void {
    this.bolaoService.atualizarDataHoraJogo(jogoId, this.editandoValor || undefined);
    this.snackBar.open('Data/hora atualizada!', 'OK', { duration: 2500 });
    this.editandoId = null;
    this.editandoValor = '';
  }

  cancelarEdicao(): void {
    this.editandoId = null;
    this.editandoValor = '';
  }

  remover(jogo: { id: string; timeCasa: string; timeVisitante: string }): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Remover Jogo',
        mensagem: `Deseja remover o jogo ${jogo.timeCasa} vs ${jogo.timeVisitante}? Todos os palpites serão perdidos.`,
        confirmLabel: 'Remover',
        confirmColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.bolaoService.removerJogo(jogo.id);
        this.snackBar.open('Jogo removido.', 'OK', { duration: 2500 });
      }
    });
  }
}
