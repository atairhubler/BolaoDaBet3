import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { BolaoService } from '../../core/services/bolao.service';
import { Jogo, Participante } from '../../core/models';

@Component({
  selector: 'app-palpites',
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
    MatSelectModule,
    MatChipsModule,
    MatDividerModule,
    MatSnackBarModule,
    MatTabsModule,
  ],
  template: `
    <div class="palpites-page">
      <div class="page-header">
        <mat-icon class="page-icon">edit_note</mat-icon>
        <div>
          <h1>Palpites</h1>
          <p>Registre os palpites de cada participante para cada jogo.</p>
        </div>
      </div>

      <div *ngIf="semParticipantes || semJogos" class="alert-card">
        <mat-icon>warning</mat-icon>
        <div>
          <strong>Atenção:</strong>
          <span *ngIf="semParticipantes"> Adicione participantes antes de registrar palpites.</span>
          <span *ngIf="semJogos"> Cadastre jogos antes de registrar palpites.</span>
        </div>
        <a routerLink="/participantes" mat-stroked-button *ngIf="semParticipantes">Ir para Participantes</a>
        <a routerLink="/jogos" mat-stroked-button *ngIf="semJogos && !semParticipantes">Ir para Jogos</a>
      </div>

      <div *ngIf="!semParticipantes && !semJogos">
        <!-- Seletor de Jogo -->
        <mat-card class="selector-card">
          <mat-card-content>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Selecione o Jogo</mat-label>
              <mat-icon matPrefix>sports_soccer</mat-icon>
              <mat-select [(ngModel)]="jogoSelecionadoId" (ngModelChange)="onJogoChange()">
                <mat-option *ngFor="let j of jogosAbertos()" [value]="j.id">
                  {{ j.timeCasa }} vs {{ j.timeVisitante }} — {{ j.fase }}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </mat-card-content>
        </mat-card>

        <!-- Tabela de palpites -->
        <mat-card *ngIf="jogoSelecionado()" class="palpites-card">
          <mat-card-header>
            <mat-card-title class="jogo-titulo">
              {{ jogoSelecionado()!.timeCasa }}
              <span class="vs-badge">VS</span>
              {{ jogoSelecionado()!.timeVisitante }}
            </mat-card-title>
            <mat-card-subtitle>{{ jogoSelecionado()!.fase }}</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <div class="palpites-header">
              <span class="participante-col">Participante</span>
              <span class="time-col">{{ jogoSelecionado()!.timeCasa }}</span>
              <span class="x-col"></span>
              <span class="time-col">{{ jogoSelecionado()!.timeVisitante }}</span>
              <span class="action-col"></span>
            </div>

            <div class="palpite-row" *ngFor="let p of participantes()">
              <span class="participante-nome">
                <mat-icon>person</mat-icon>
                {{ p.nome }}
              </span>

              <div class="placar-inputs">
                <input
                  type="number"
                  class="gol-input"
                  [(ngModel)]="palpitesForm[p.id + '_casa']"
                  min="0"
                  max="20"
                  placeholder="0"
                />
                <span class="x-separator">×</span>
                <input
                  type="number"
                  class="gol-input"
                  [(ngModel)]="palpitesForm[p.id + '_visitante']"
                  min="0"
                  max="20"
                  placeholder="0"
                />
              </div>

              <button
                mat-flat-button
                color="primary"
                size="small"
                (click)="salvarPalpite(p)"
                [disabled]="!palpiteValido(p.id)"
                class="save-btn"
              >
                <mat-icon>save</mat-icon>
                {{ palpiteJaExiste(p.id) ? 'Atualizar' : 'Salvar' }}
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Resumo dos palpites do jogo -->
        <mat-card *ngIf="jogoSelecionado() && jogoSelecionado()!.palpites.length > 0" class="resumo-card">
          <mat-card-header>
            <mat-card-title>Palpites Registrados</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="resumo-row" *ngFor="let palpite of jogoSelecionado()!.palpites">
              <span class="resumo-nome">{{ getNomeParticipante(palpite.participanteId) }}</span>
              <mat-chip class="palpite-chip">
                {{ palpite.golsCasa }} × {{ palpite.golsVisitante }}
              </mat-chip>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .palpites-page { max-width: 800px; }

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
      margin-bottom: 16px;
    }

    .alert-card mat-icon { color: #f57c00; }

    .selector-card { margin-bottom: 20px; }
    .full-width { width: 100%; }

    .jogo-titulo {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.2rem !important;
    }

    .vs-badge {
      background: #1b5e20;
      color: white;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 0.8rem;
    }

    .palpites-header {
      display: grid;
      grid-template-columns: 1fr 80px 24px 80px auto;
      gap: 8px;
      padding: 8px 12px;
      background: #f5f5f5;
      border-radius: 8px;
      margin-bottom: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      color: #757575;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      align-items: center;
    }

    .time-col, .x-col { text-align: center; }

    .palpite-row {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 12px;
      align-items: center;
      padding: 10px 12px;
      border-bottom: 1px solid #f5f5f5;
    }

    .palpite-row:last-child { border-bottom: none; }

    .participante-nome {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;
    }

    .participante-nome mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #9e9e9e;
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
      font-size: 1.2rem;
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
      font-size: 1.2rem;
    }

    .save-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.8rem !important;
    }

    .resumo-card { margin-top: 20px; }

    .resumo-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #f5f5f5;
    }

    .resumo-row:last-child { border-bottom: none; }

    .resumo-nome { font-weight: 500; }

    .palpite-chip {
      background: #e8f5e9 !important;
      color: #2e7d32 !important;
      font-weight: 700 !important;
    }

    @media (max-width: 600px) {
      .palpites-header { display: none; }
      .palpite-row { grid-template-columns: 1fr; gap: 8px; }
    }
  `],
})
export class PalpitesComponent {
  private readonly bolaoService = inject(BolaoService);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  jogoSelecionadoId = '';
  palpitesForm: Record<string, number> = {};

  private readonly queryJogoId = toSignal(
    this.route.queryParams.pipe(map(p => p['jogoId'] ?? '')),
    { initialValue: '' }
  );

  readonly jogosAbertos = computed(() =>
    this.bolaoService.bolao().jogos.filter(j => !j.encerrado)
  );

  readonly participantes = () => this.bolaoService.bolao().participantes;

  readonly jogoSelecionado = computed<Jogo | undefined>(() => {
    const id = this.jogoSelecionadoId || this.queryJogoId();
    if (!this.jogoSelecionadoId && id) {
      setTimeout(() => { this.jogoSelecionadoId = id; this.carregarPalpites(); });
    }
    return this.bolaoService.bolao().jogos.find(j => j.id === id);
  });

  get semParticipantes(): boolean { return this.participantes().length === 0; }
  get semJogos(): boolean { return this.jogosAbertos().length === 0; }

  onJogoChange(): void { this.carregarPalpites(); }

  private carregarPalpites(): void {
    this.palpitesForm = {};
    const jogo = this.bolaoService.bolao().jogos.find(j => j.id === this.jogoSelecionadoId);
    if (!jogo) return;

    for (const palpite of jogo.palpites) {
      this.palpitesForm[`${palpite.participanteId}_casa`] = palpite.golsCasa;
      this.palpitesForm[`${palpite.participanteId}_visitante`] = palpite.golsVisitante;
    }
  }

  palpiteValido(participanteId: string): boolean {
    const casa = this.palpitesForm[`${participanteId}_casa`];
    const visitante = this.palpitesForm[`${participanteId}_visitante`];
    return casa !== undefined && casa !== null && !isNaN(Number(casa)) &&
           visitante !== undefined && visitante !== null && !isNaN(Number(visitante)) &&
           Number(casa) >= 0 && Number(visitante) >= 0;
  }

  palpiteJaExiste(participanteId: string): boolean {
    const jogo = this.jogoSelecionado();
    return !!jogo?.palpites.some(p => p.participanteId === participanteId);
  }

  salvarPalpite(participante: Participante): void {
    if (!this.jogoSelecionadoId || !this.palpiteValido(participante.id)) return;

    const casa = Math.max(0, Math.floor(Number(this.palpitesForm[`${participante.id}_casa`] ?? 0)));
    const visitante = Math.max(0, Math.floor(Number(this.palpitesForm[`${participante.id}_visitante`] ?? 0)));

    this.bolaoService.registrarPalpite(this.jogoSelecionadoId, participante.id, casa, visitante);
    this.snackBar.open(`Palpite de ${participante.nome} salvo: ${casa} × ${visitante}`, 'OK', {
      duration: 2500,
      panelClass: 'snack-success',
    });
  }

  getNomeParticipante(id: string): string {
    return this.participantes().find(p => p.id === id)?.nome ?? 'Desconhecido';
  }
}
