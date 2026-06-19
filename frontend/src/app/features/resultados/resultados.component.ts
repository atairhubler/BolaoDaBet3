import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BolaoService } from '../../core/services/bolao.service';
import { Jogo } from '../../core/models';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-resultados',
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
    MatChipsModule,
    MatDividerModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  template: `
    <div class="resultados-page">
      <div class="page-header">
        <mat-icon class="page-icon">scoreboard</mat-icon>
        <div>
          <h1>Resultados</h1>
          <p>Resultados atualizados automaticamente via API. Entrada manual disponível como fallback.</p>
        </div>
      </div>

      <div *ngIf="semJogos" class="alert-card">
        <mat-icon>warning</mat-icon>
        <span>Nenhum jogo cadastrado ainda.</span>
        <a routerLink="/jogos" mat-stroked-button>Cadastrar Jogos</a>
      </div>

      <!-- Aviso sobre atualização automática -->
      <div *ngIf="jogosAbertos().length > 0" class="info-automatico">
        <mat-icon>schedule</mat-icon>
        <span>Os resultados são atualizados automaticamente a cada 20 minutos via API. Use a opção manual apenas se a atualização automática falhar.</span>
      </div>

      <!-- Jogos em aberto -->
      <div *ngIf="jogosAbertos().length > 0">
        <h2 class="section-title">
          <mat-icon>schedule</mat-icon>
          Jogos em Aberto ({{ jogosAbertos().length }})
        </h2>

        <mat-card class="jogo-card" *ngFor="let jogo of jogosAbertos()">
          <mat-card-content>
            <div class="jogo-header">
              <span class="fase-badge">{{ jogo.fase }}</span>
              <span class="palpites-info">
                <mat-icon>edit_note</mat-icon>
                {{ jogo.palpites.length }} palpite(s)
              </span>
            </div>

            <div class="jogo-confronto">
              <span class="time">{{ jogo.timeCasa }}</span>
              <span class="vs">VS</span>
              <span class="time">{{ jogo.timeVisitante }}</span>
            </div>

            <!-- Botão para revelar formulário manual -->
            <div class="manual-toggle">
              <button mat-stroked-button (click)="toggleForm(jogo.id)" class="btn-manual">
                <mat-icon>{{ formVisivel[jogo.id] ? 'visibility_off' : 'edit' }}</mat-icon>
                {{ formVisivel[jogo.id] ? 'Ocultar entrada manual' : 'Inserir resultado manualmente' }}
              </button>
            </div>

            <!-- Formulário oculto por padrão -->
            <div *ngIf="formVisivel[jogo.id]" class="resultado-form">
              <span class="resultado-label">Resultado:</span>
              <div class="placar-row">
                <input
                  type="number"
                  class="gol-input"
                  [(ngModel)]="resultadoForm[jogo.id + '_casa']"
                  min="0"
                  max="20"
                  placeholder="0"
                />
                <span class="x-sep">×</span>
                <input
                  type="number"
                  class="gol-input"
                  [(ngModel)]="resultadoForm[jogo.id + '_visitante']"
                  min="0"
                  max="20"
                  placeholder="0"
                />
                <button
                  mat-flat-button
                  color="primary"
                  (click)="registrar(jogo)"
                  [disabled]="!resultadoValido(jogo.id)"
                >
                  <mat-icon>check_circle</mat-icon> Confirmar
                </button>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Jogos encerrados -->
      <div *ngIf="jogosEncerrados().length > 0">
        <h2 class="section-title encerrados-title">
          <mat-icon>check_circle</mat-icon>
          Jogos Encerrados ({{ jogosEncerrados().length }})
        </h2>

        <mat-card class="jogo-card encerrado-card" *ngFor="let jogo of jogosEncerrados()">
          <mat-card-content>
            <div class="jogo-header">
              <mat-chip class="chip-encerrado">✓ Encerrado</mat-chip>
              <span class="fase-badge">{{ jogo.fase }}</span>
            </div>

            <div class="jogo-confronto">
              <span class="time">{{ jogo.timeCasa }}</span>
              <span class="placar-final">
                {{ jogo.resultado!.golsCasa }} × {{ jogo.resultado!.golsVisitante }}
              </span>
              <span class="time">{{ jogo.timeVisitante }}</span>
            </div>

            <!-- Preview dos palpites e ganhos por jogo -->
            <div class="palpites-preview" *ngIf="jogo.palpites.length > 0">
              <div class="palpite-item" *ngFor="let palpite of jogo.palpites">
                <span class="palpite-nome">{{ getNome(palpite.participanteId) }}</span>
                <span class="palpite-placar">{{ palpite.golsCasa }} × {{ palpite.golsVisitante }}</span>
                <span
                  class="palpite-pts"
                  [class.pts-3]="calcPts(palpite, jogo.resultado!) === 3"
                  [class.pts-1]="calcPts(palpite, jogo.resultado!) === 1"
                  [class.pts-0]="calcPts(palpite, jogo.resultado!) === 0"
                >
                  {{ getGanho(jogo.id, palpite.participanteId) | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                </span>
              </div>
            </div>

            <div class="reabrir-action">
              <button mat-stroked-button color="warn" (click)="reabrir(jogo)">
                <mat-icon>undo</mat-icon> Reabrir Jogo
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .resultados-page { max-width: 800px; }

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

    .alert-card {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #fff3e0;
      border: 1px solid #ff9800;
      border-radius: 8px;
      padding: 16px;
    }

    .alert-card mat-icon { color: #f57c00; }

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.1rem;
      color: #1b5e20;
      margin: 24px 0 12px;
    }

    .encerrados-title { color: #388e3c; }
    .encerrados-title mat-icon { color: #388e3c; }

    .jogo-card { margin-bottom: 12px; }

    .encerrado-card { background: #fafafa; }

    .jogo-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .fase-badge {
      font-size: 0.8rem;
      color: #757575;
      background: #f5f5f5;
      padding: 3px 10px;
      border-radius: 10px;
    }

    .palpites-info {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.8rem;
      color: #9e9e9e;
      margin-left: auto;
    }

    .palpites-info mat-icon { font-size: 16px; width: 16px; height: 16px; }

    .jogo-confronto {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 12px 0;
    }

    .time {
      font-size: 1.1rem;
      font-weight: 600;
      min-width: 100px;
      text-align: center;
    }

    .vs {
      font-size: 1rem;
      font-weight: 700;
      color: #9e9e9e;
    }

    .placar-final {
      font-size: 1.6rem;
      font-weight: 900;
      color: white;
      background: #2e7d32;
      padding: 4px 20px;
      border-radius: 10px;
      min-width: 80px;
      text-align: center;
    }

    .resultado-label {
      font-weight: 600;
      color: #424242;
    }

    .placar-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .gol-input {
      width: 56px;
      height: 44px;
      text-align: center;
      font-size: 1.3rem;
      font-weight: 700;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      outline: none;
      transition: border-color 0.2s;
    }

    .gol-input:focus { border-color: #2e7d32; }

    .x-sep {
      font-size: 1.3rem;
      font-weight: 700;
      color: #9e9e9e;
    }

    .placar-row button {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .chip-encerrado { background: #e8f5e9 !important; color: #2e7d32 !important; }

    .palpites-preview {
      margin-top: 8px;
      padding: 8px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .palpite-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 4px 8px;
    }

    .palpite-nome { flex: 1; font-size: 0.9rem; }

    .palpite-placar {
      font-size: 0.9rem;
      font-weight: 600;
      color: #424242;
    }

    .palpite-pts {
      font-weight: 700;
      padding: 2px 10px;
      border-radius: 8px;
      font-size: 0.82rem;
      min-width: 80px;
      text-align: center;
    }

    .pts-3 { background: #e8f5e9; color: #2e7d32; }
    .pts-1 { background: #fff8e1; color: #f57f17; }
    .pts-0 { background: #ffebee; color: #c62828; }

    .reabrir-action {
      display: flex;
      justify-content: flex-end;
      padding-top: 8px;
    }

    .reabrir-action button {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.8rem;
    }

    .info-automatico {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      background: #e3f2fd;
      border: 1px solid #90caf9;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 16px;
      font-size: 0.87rem;
      color: #1565c0;
    }

    .info-automatico mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      margin-top: 1px;
      color: #1976d2;
    }

    .manual-toggle {
      display: flex;
      justify-content: flex-end;
      padding-top: 10px;
      border-top: 1px solid #f5f5f5;
    }

    .btn-manual {
      font-size: 0.78rem;
      color: #9e9e9e !important;
      border-color: #e0e0e0 !important;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .btn-manual mat-icon {
      font-size: 15px;
      width: 15px;
      height: 15px;
    }

    .resultado-form {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 12px;
      background: #fffde7;
      border: 1px dashed #f9a825;
      border-radius: 8px;
      padding: 12px;
    }
  `],
})
export class ResultadosComponent {
  private readonly bolaoService = inject(BolaoService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  resultadoForm: Record<string, number> = {};
  formVisivel: Record<string, boolean> = {};

  toggleForm(jogoId: string): void {
    this.formVisivel[jogoId] = !this.formVisivel[jogoId];
  }

  readonly jogosAbertos = computed(() =>
    this.bolaoService.bolao().jogos.filter(j => !j.encerrado)
  );

  readonly jogosEncerrados = computed(() =>
    this.bolaoService.bolao().jogos.filter(j => j.encerrado)
  );

  readonly ganhosPorJogo = computed(() => {
    const map = new Map<string, Map<string, number>>();
    for (const jogo of this.jogosEncerrados()) {
      map.set(jogo.id, this.bolaoService.calcularGanhoDoJogo(jogo));
    }
    return map;
  });

  getGanho(jogoId: string, participanteId: string): number {
    return this.ganhosPorJogo().get(jogoId)?.get(participanteId) ?? 0;
  }

  get semJogos(): boolean {
    return this.bolaoService.bolao().jogos.length === 0;
  }

  resultadoValido(jogoId: string): boolean {
    const casa = this.resultadoForm[`${jogoId}_casa`];
    const visitante = this.resultadoForm[`${jogoId}_visitante`];
    return casa !== undefined && !isNaN(Number(casa)) && Number(casa) >= 0 &&
           visitante !== undefined && !isNaN(Number(visitante)) && Number(visitante) >= 0;
  }

  registrar(jogo: Jogo): void {
    if (!this.resultadoValido(jogo.id)) return;

    const casa = Math.max(0, Math.floor(Number(this.resultadoForm[`${jogo.id}_casa`] ?? 0)));
    const visitante = Math.max(0, Math.floor(Number(this.resultadoForm[`${jogo.id}_visitante`] ?? 0)));

    this.bolaoService.registrarResultado(jogo.id, casa, visitante);
    delete this.resultadoForm[`${jogo.id}_casa`];
    delete this.resultadoForm[`${jogo.id}_visitante`];

    this.snackBar.open(
      `Resultado registrado: ${jogo.timeCasa} ${casa} × ${visitante} ${jogo.timeVisitante}`,
      'OK',
      { duration: 3000, panelClass: 'snack-success' }
    );
  }

  reabrir(jogo: Jogo): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Reabrir Jogo',
        mensagem: `Deseja reabrir o jogo ${jogo.timeCasa} vs ${jogo.timeVisitante}? O resultado será apagado.`,
        confirmLabel: 'Reabrir',
        confirmColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.bolaoService.reabrirJogo(jogo.id);
        this.snackBar.open('Jogo reaberto.', 'OK', { duration: 2500 });
      }
    });
  }

  calcPts(palpite: { golsCasa: number; golsVisitante: number }, resultado: { golsCasa: number; golsVisitante: number }): number {
    return this.bolaoService.calcularPontuacao(palpite as any, resultado as any);
  }

  getNome(id: string): string {
    return this.bolaoService.bolao().participantes.find(p => p.id === id)?.nome ?? '?';
  }
}
