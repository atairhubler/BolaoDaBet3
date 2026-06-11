import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { BolaoService } from '../../core/services/bolao.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-participantes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
  ],
  template: `
    <div class="participantes-page">
      <div class="page-header">
        <mat-icon class="page-icon">group</mat-icon>
        <div>
          <h1>Participantes</h1>
          <p>Adicione as pessoas que vão participar do bolão.</p>
        </div>
      </div>

      <!-- Formulário de adição -->
      <mat-card class="add-card">
        <mat-card-content>
          <div class="add-form">
            <mat-form-field appearance="outline" class="name-field">
              <mat-label>Nome do participante</mat-label>
              <mat-icon matPrefix>person_add</mat-icon>
              <input
                matInput
                [(ngModel)]="novoNome"
                placeholder="Ex: João Silva"
                (keyup.enter)="adicionar()"
                maxlength="50"
              />
            </mat-form-field>
            <button
              mat-flat-button
              color="primary"
              (click)="adicionar()"
              [disabled]="!novoNome.trim()"
            >
              <mat-icon>add</mat-icon> Adicionar
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Lista de participantes -->
      <mat-card class="list-card">
        <mat-card-header>
          <mat-card-title>
            Participantes Cadastrados
            <mat-chip class="count-chip">{{ participantes().length }}</mat-chip>
          </mat-card-title>
          <mat-card-subtitle *ngIf="participantes().length > 0">
            Prêmio total: <strong>{{ totalPremio() | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</strong>
            ({{ bolao().valorEntrada | currency:'BRL':'symbol':'1.2-2':'pt-BR' }} × {{ participantes().length }})
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <div class="empty-participants" *ngIf="participantes().length === 0">
            <mat-icon>group_off</mat-icon>
            <p>Nenhum participante cadastrado ainda.</p>
            <p>Adicione o primeiro participante acima!</p>
          </div>

          <mat-list *ngIf="participantes().length > 0">
            <mat-list-item *ngFor="let p of participantes(); let i = index" class="participant-item">
              <div class="participant-number" matListItemIcon>{{ i + 1 }}</div>
              <span matListItemTitle>{{ p.nome }}</span>
              <span matListItemMeta>
                <button mat-icon-button color="warn" (click)="remover(p)" [attr.aria-label]="'Remover ' + p.nome">
                  <mat-icon>delete_outline</mat-icon>
                </button>
              </span>
            </mat-list-item>
          </mat-list>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .participantes-page { max-width: 700px; }

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
      gap: 12px;
      align-items: flex-start;
      padding: 8px 0;
    }

    .name-field { flex: 1; }

    .add-form button {
      margin-top: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
    }

    .count-chip {
      margin-left: 10px;
      background: #e8f5e9 !important;
      color: #2e7d32 !important;
      font-size: 0.8rem !important;
    }

    .empty-participants {
      text-align: center;
      padding: 40px 20px;
      color: #9e9e9e;
    }

    .empty-participants mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      margin-bottom: 12px;
    }

    .participant-item {
      border-bottom: 1px solid #f5f5f5;
    }

    .participant-item:last-child { border-bottom: none; }

    .participant-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #2e7d32;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.85rem;
    }
  `],
})
export class ParticipantesComponent {
  private readonly bolaoService = inject(BolaoService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  novoNome = '';

  readonly bolao = this.bolaoService.bolao;
  readonly participantes = () => this.bolaoService.bolao().participantes;
  readonly totalPremio = this.bolaoService.totalPremio;

  adicionar(): void {
    const nome = this.novoNome.trim();
    if (!nome) return;

    const jaExiste = this.participantes().some(
      p => p.nome.toLowerCase() === nome.toLowerCase()
    );

    if (jaExiste) {
      this.snackBar.open(`"${nome}" já está na lista!`, 'OK', { duration: 3000 });
      return;
    }

    this.bolaoService.adicionarParticipante(nome);
    this.snackBar.open(`${nome} adicionado(a) ao bolão!`, 'OK', {
      duration: 2500,
      panelClass: 'snack-success',
    });
    this.novoNome = '';
  }

  remover(participante: { id: string; nome: string }): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Remover Participante',
        mensagem: `Deseja remover "${participante.nome}" do bolão? Todos os palpites dele(a) serão removidos.`,
        confirmLabel: 'Remover',
        confirmColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.bolaoService.removerParticipante(participante.id);
        this.snackBar.open(`${participante.nome} removido(a).`, 'OK', { duration: 2500 });
      }
    });
  }
}
