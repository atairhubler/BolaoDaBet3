import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BolaoService } from '../../core/services/bolao.service';

@Component({
  selector: 'app-configuracao',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="configuracao-page">
      <div class="page-header">
        <mat-icon class="page-icon">settings</mat-icon>
        <div>
          <h1>Configuração do Bolão</h1>
          <p>Defina o nome e o valor de entrada do bolão.</p>
        </div>
      </div>

      <mat-card class="config-card">
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="salvar()" class="config-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nome do Bolão</mat-label>
              <mat-icon matPrefix>emoji_events</mat-icon>
              <input matInput formControlName="nome" placeholder="Ex: Bolão Copa 2026" />
              <mat-error *ngIf="form.get('nome')?.hasError('required')">Nome é obrigatório</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Valor da Entrada por Participante (R$)</mat-label>
              <mat-icon matPrefix>attach_money</mat-icon>
              <input
                matInput
                type="number"
                formControlName="valorEntrada"
                placeholder="Ex: 50"
                min="1"
                step="0.01"
              />
              <mat-hint>Cada participante paga este valor para entrar no bolão.</mat-hint>
              <mat-error *ngIf="form.get('valorEntrada')?.hasError('required')">Valor é obrigatório</mat-error>
              <mat-error *ngIf="form.get('valorEntrada')?.hasError('min')">Valor mínimo: R$ 0,01</mat-error>
            </mat-form-field>

            <div class="preview-card" *ngIf="form.valid">
              <mat-icon>calculate</mat-icon>
              <div>
                <div class="preview-label">Com {{ participantesCount }} participante(s)</div>
                <div class="preview-value">
                  Prêmio total: <strong>R$ {{ calcularPremio() | number:'1.2-2':'pt-BR' }}</strong>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">
                <mat-icon>save</mat-icon> Salvar Configurações
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .configuracao-page { max-width: 600px; }

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

    .page-header p {
      margin: 4px 0 0;
      color: #757575;
    }

    .config-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 8px 0;
    }

    .full-width { width: 100%; }

    .preview-card {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #e8f5e9;
      border-radius: 8px;
      padding: 14px 16px;
      color: #2e7d32;
    }

    .preview-card mat-icon { font-size: 28px; }
    .preview-label { font-size: 0.85rem; color: #388e3c; }
    .preview-value { font-size: 1.1rem; }
    .preview-value strong { font-size: 1.2rem; }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      padding-top: 8px;
    }

    .form-actions button {
      display: flex;
      align-items: center;
      gap: 6px;
    }
  `],
})
export class ConfiguracaoComponent implements OnInit {
  private readonly bolaoService = inject(BolaoService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  form = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    valorEntrada: [50, [Validators.required, Validators.min(0.01)]],
  });

  get participantesCount(): number {
    return this.bolaoService.bolao().participantes.length;
  }

  ngOnInit(): void {
    const { nome, valorEntrada } = this.bolaoService.bolao();
    this.form.patchValue({ nome, valorEntrada });
  }

  calcularPremio(): number {
    const valor = Number(this.form.get('valorEntrada')?.value ?? 0);
    return valor * this.participantesCount;
  }

  salvar(): void {
    if (this.form.invalid) return;
    const { nome, valorEntrada } = this.form.value;
    this.bolaoService.atualizarConfiguracoes(nome!, Number(valorEntrada));
    this.snackBar.open('Configurações salvas com sucesso!', 'OK', {
      duration: 3000,
      panelClass: 'snack-success',
    });
  }
}
