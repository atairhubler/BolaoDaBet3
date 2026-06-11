import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
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
  'Argentina', 'Alemanha', 'Brasil', 'França', 'Inglaterra', 'Espanha',
  'Itália', 'Portugal', 'Holanda', 'Bélgica', 'Croácia', 'Uruguai',
  'Colômbia', 'México', 'Japão', 'Marrocos', 'Senegal', 'Estados Unidos',
  'Canadá', 'Austrália', 'Polônia', 'Sérvia', 'Suíça', 'Dinamarca',
  'Coreia do Sul', 'Equador', 'Camarões', 'Ghana', 'Costa Rica', 'Tunísia',
  'Arábia Saudita', 'Qatar',
];

@Component({
  selector: 'app-jogos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatChipsModule,
    MatSelectModule,
    MatExpansionModule,
    MatDialogModule,
    MatSnackBarModule,
    MatDividerModule,
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

            <button
              mat-flat-button
              color="primary"
              (click)="adicionar()"
              [disabled]="!timeCasa || !timeVisitante || !fase || timeCasa === timeVisitante"
            >
              <mat-icon>add</mat-icon> Adicionar Jogo
            </button>
          </div>
          <mat-error *ngIf="timeCasa && timeVisitante && timeCasa === timeVisitante">
            Os times devem ser diferentes!
          </mat-error>
        </mat-card-content>
      </mat-card>

      <!-- Lista de jogos -->
      <mat-card class="list-card">
        <mat-card-header>
          <mat-card-title>
            Jogos Cadastrados
            <mat-chip class="count-chip">{{ jogos().length }}</mat-chip>
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <div class="empty-jogos" *ngIf="jogos().length === 0">
            <mat-icon>sports_soccer</mat-icon>
            <p>Nenhum jogo cadastrado ainda.</p>
          </div>

          <div class="jogo-item" *ngFor="let jogo of jogos(); let i = index">
            <div class="jogo-header">
              <mat-chip [class]="jogo.encerrado ? 'chip-encerrado' : 'chip-aberto'">
                {{ jogo.encerrado ? '✓ Encerrado' : '⏳ Em aberto' }}
              </mat-chip>
              <span class="fase-badge">{{ jogo.fase }}</span>
            </div>

            <div class="jogo-placar">
              <span class="time time-casa">{{ jogo.timeCasa }}</span>
              <div class="placar-box">
                <span *ngIf="jogo.resultado" class="resultado-placar">
                  {{ jogo.resultado.golsCasa }} × {{ jogo.resultado.golsVisitante }}
                </span>
                <span *ngIf="!jogo.resultado" class="vs-text">VS</span>
              </div>
              <span class="time time-visitante">{{ jogo.timeVisitante }}</span>
            </div>

            <div class="jogo-info">
              <span class="palpites-count">
                <mat-icon>edit_note</mat-icon>
                {{ jogo.palpites.length }} palpite(s)
              </span>
              <div class="jogo-actions">
                <button mat-stroked-button color="primary" routerLink="/palpites" [queryParams]="{jogoId: jogo.id}">
                  <mat-icon>edit_note</mat-icon> Palpites
                </button>
                <button mat-icon-button color="warn" (click)="remover(jogo)" [disabled]="jogo.encerrado">
                  <mat-icon>delete_outline</mat-icon>
                </button>
              </div>
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

    .add-form {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
      padding: 8px 0;
    }

    .add-form mat-form-field { min-width: 180px; }

    .vs-divider {
      font-weight: 900;
      font-size: 1.2rem;
      color: #9e9e9e;
      padding: 0 4px;
      padding-top: 10px;
    }

    .add-form button {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 4px;
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

    .jogo-info {
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

    .jogo-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .jogo-actions button {
      display: flex;
      align-items: center;
      gap: 4px;
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

  readonly fases = FASES_COPA;
  readonly timesDisponiveis = TIMES_COPA;
  readonly jogos = () => this.bolaoService.bolao().jogos;

  adicionar(): void {
    if (!this.timeCasa || !this.timeVisitante || !this.fase || this.timeCasa === this.timeVisitante) return;

    this.bolaoService.adicionarJogo(this.timeCasa, this.timeVisitante, this.fase);
    this.snackBar.open(`${this.timeCasa} vs ${this.timeVisitante} adicionado!`, 'OK', {
      duration: 2500,
      panelClass: 'snack-success',
    });
    this.timeCasa = '';
    this.timeVisitante = '';
    this.fase = '';
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
