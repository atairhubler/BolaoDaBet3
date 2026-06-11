import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { BolaoService } from '../../../core/services/bolao.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  template: `
    <mat-sidenav-container class="app-container">
      <mat-sidenav
        #sidenav
        [mode]="isMobile() ? 'over' : 'side'"
        [opened]="!isMobile()"
        class="app-sidenav"
      >
        <div class="sidenav-header">
          <span class="trophy-icon">🏆</span>
          <div class="sidenav-title">
            <span class="bolao-name">{{ bolao().nome }}</span>
            <span class="bolao-subtitle">Bet3</span>
          </div>
        </div>

        <mat-nav-list>
          <a mat-list-item routerLink="/" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/configuracao" routerLinkActive="active-link">
            <mat-icon matListItemIcon>settings</mat-icon>
            <span matListItemTitle>Configuração</span>
          </a>
          <a mat-list-item routerLink="/participantes" routerLinkActive="active-link">
            <mat-icon matListItemIcon>group</mat-icon>
            <span matListItemTitle>Participantes</span>
            <span class="badge" matListItemMeta *ngIf="bolao().participantes.length > 0"
                  style="color:#000 !important;background:#ffd600 !important;border-radius:10px;font-size:0.7rem;font-weight:700;padding:1px 6px;min-width:18px;display:inline-flex;align-items:center;justify-content:center;">
              {{ bolao().participantes.length }}
            </span>
          </a>
          <a mat-list-item routerLink="/jogos" routerLinkActive="active-link">
            <mat-icon matListItemIcon>sports_soccer</mat-icon>
            <span matListItemTitle>Jogos</span>
            <span class="badge" matListItemMeta *ngIf="bolao().jogos.length > 0"
                  style="color:#000 !important;background:#ffd600 !important;border-radius:10px;font-size:0.7rem;font-weight:700;padding:1px 6px;min-width:18px;display:inline-flex;align-items:center;justify-content:center;">
              {{ bolao().jogos.length }}
            </span>
          </a>
          <a mat-list-item routerLink="/palpites" routerLinkActive="active-link">
            <mat-icon matListItemIcon>edit_note</mat-icon>
            <span matListItemTitle>Palpites</span>
          </a>
          <a mat-list-item routerLink="/resultados" routerLinkActive="active-link">
            <mat-icon matListItemIcon>scoreboard</mat-icon>
            <span matListItemTitle>Resultados</span>
          </a>
          <mat-divider></mat-divider>
          <a mat-list-item routerLink="/classificacao" routerLinkActive="active-link" class="classificacao-link">
            <mat-icon matListItemIcon>emoji_events</mat-icon>
            <span matListItemTitle>Classificação</span>
          </a>
        </mat-nav-list>

        <div class="sidenav-footer">
          <div class="premio-info">
            <mat-icon>monetization_on</mat-icon>
            <div>
              <div class="premio-label">Prêmio Total</div>
              <div class="premio-value">{{ totalPremio() | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</div>
            </div>
          </div>
        </div>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar class="app-toolbar">
          <button mat-icon-button *ngIf="isMobile()" (click)="sidenav.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="toolbar-title">{{ bolao().nome }}</span>
          <span class="toolbar-spacer"></span>
          <span class="toolbar-badge" *ngIf="vencedores().length > 0">
            🥇 {{ vencedores().length === 1 ? vencedores()[0].participante.nome + ' venceu!' : vencedores().length + ' vencedores!' }}
          </span>
          <button mat-icon-button
                  (click)="compartilhar()"
                  matTooltip="Gerar link para participantes"
                  class="share-btn">
            <mat-icon>share</mat-icon>
          </button>
        </mat-toolbar>

        <div class="content-area">
          <router-outlet />
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .app-container { height: 100vh; }

    .app-sidenav {
      width: 260px;
      background: #1b5e20;
      color: white;

      /* Sobrescreve variáveis CSS do Material M3 para forçar branco no sidenav */
      --mat-list-item-label-text-color: rgba(255, 255, 255, 0.9);
      --mat-list-item-supporting-text-color: rgba(255, 255, 255, 0.7);
      --mat-list-item-leading-icon-color: rgba(255, 255, 255, 0.9);
      --mat-list-item-trailing-icon-color: rgba(255, 255, 255, 0.7);
      --mat-list-item-hover-label-text-color: #ffd600;
      --mat-list-item-hover-leading-icon-color: #ffd600;
      --mat-list-item-hover-state-layer-color: rgba(255, 214, 0, 0.15);
      --mat-list-item-focus-label-text-color: #ffd600;
      --mat-list-item-focus-leading-icon-color: #ffd600;
      --mat-list-item-pressed-label-text-color: #ffd600;
      --mdc-list-list-item-label-text-color: rgba(255, 255, 255, 0.9);
      --mdc-list-list-item-hover-label-text-color: #ffd600;
      --mdc-list-list-item-focus-label-text-color: #ffd600;
      --mat-divider-color: rgba(255, 255, 255, 0.15);
    }

    .sidenav-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 24px 16px 16px;
      background: #2e7d32;
    }

    .trophy-icon { font-size: 2rem; }

    .sidenav-title {
      display: flex;
      flex-direction: column;
    }

    .bolao-name {
      font-size: 1rem;
      font-weight: 700;
      color: #ffd600;
      line-height: 1.2;
    }

    .bolao-subtitle {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.7);
    }

    mat-nav-list {
      padding-top: 8px;
      padding-bottom: 90px;
    }

    mat-nav-list a {
      color: rgba(255, 255, 255, 0.9) !important;
      border-radius: 0 24px 24px 0;
      margin-right: 8px;
    }

    /* Força ícones e textos brancos dentro do sidenav */
    mat-nav-list a mat-icon,
    mat-nav-list a [matListItemIcon] {
      color: rgba(255, 255, 255, 0.9) !important;
    }

    mat-nav-list a span,
    mat-nav-list a [matListItemTitle] {
      color: rgba(255, 255, 255, 0.9) !important;
    }

    mat-nav-list a:hover mat-icon,
    mat-nav-list a:hover span:not(.badge),
    mat-nav-list a.active-link mat-icon,
    mat-nav-list a.active-link span:not(.badge),
    mat-nav-list a.active-link [matListItemTitle] {
      color: #ffd600 !important;
    }

    mat-nav-list a:hover,
    mat-nav-list a.active-link {
      background: rgba(255, 214, 0, 0.2) !important;
    }

    .classificacao-link {
      font-weight: 600;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: #ffd600;
      color: #000 !important;
      border-radius: 10px;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 1px 6px;
      margin-left: 6px;
      min-width: 18px;
    }

    .sidenav-footer {
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 16px;
      background: rgba(0, 0, 0, 0.2);
    }

    .premio-info {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #ffd600;
    }

    .premio-info mat-icon {
      font-size: 28px;
      color: #ffd600 !important;
    }

    .premio-label {
      font-size: 0.7rem;
      color: rgba(255,255,255,0.7);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .premio-value {
      font-size: 1.1rem;
      font-weight: 700;
      color: #ffd600;
    }

    .app-toolbar {
      background: white;
      color: #1b5e20;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .toolbar-title {
      font-weight: 600;
      font-size: 1.1rem;
    }

    .toolbar-spacer { flex: 1; }

    .toolbar-badge {
      background: #ffd600;
      color: #1b5e20;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .share-btn { color: #1b5e20; }

    .content-area {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    @media (max-width: 600px) {
      .content-area { padding: 16px; }
    }
  `],
})
export class LayoutComponent {
  private readonly bolaoService = inject(BolaoService);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly snackBar = inject(MatSnackBar);

  readonly bolao = this.bolaoService.bolao;
  readonly totalPremio = this.bolaoService.totalPremio;
  readonly vencedores = this.bolaoService.vencedores;

  readonly isMobile = toSignal(
    this.breakpointObserver.observe(Breakpoints.Handset).pipe(map(r => r.matches)),
    { initialValue: false }
  );

  compartilhar(): void {
    const base = document.baseURI.endsWith('/') ? document.baseURI : document.baseURI + '/';
    const url = `${base}publico`;
    navigator.clipboard.writeText(url).then(() => {
      this.snackBar.open('Link copiado! Os participantes sempre verão os dados mais recentes.', 'OK', {
        duration: 4000,
        panelClass: 'snack-success',
      });
    }).catch(() => {
      this.snackBar.open('Erro ao copiar link.', 'OK', { duration: 3000 });
    });
  }
}
