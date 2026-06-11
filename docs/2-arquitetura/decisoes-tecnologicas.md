---
name: decisoes-tecnicas-bolao
description: Decisões tecnológicas do bolão frontend
metadata:
  type: project
---

# Decisões Tecnológicas

## Stack Escolhida

| Camada | Tecnologia | Versão | Motivo |
|--------|-----------|--------|--------|
| Framework | Angular | 20 | Padrão be3coder, componentes standalone |
| Linguagem | TypeScript | 5.x | Type safety, melhor DX |
| UI Components | Angular Material | 20 | Componentes prontos e acessíveis |
| Estilos | SCSS + Material Theme | — | Customização do tema Copa |
| Estado | Angular Signals | nativo | Reatividade sem biblioteca externa |
| Persistência | LocalStorage | nativo | App frontend-only, sem backend |
| Ícones | Material Icons | — | Já incluso com Angular Material |
| Build | Angular CLI 20 | — | Tooling oficial |

## Padrões Arquiteturais

- **Standalone Components**: Todos os componentes são standalone (sem NgModules)
- **Signals**: Estado gerenciado com signals nativos do Angular
- **Feature-based structure**: Pastas organizadas por funcionalidade
- **Smart/Dumb Components**: Lógica de negócio no service, UI nos componentes
- **Single Service**: `BolaoService` centraliza todo o estado e regras de negócio

## Decisões de UX

- Tema verde e amarelo (Copa do Mundo / Brasil)
- Navegação lateral (sidenav) para organizar as seções
- Responsivo para mobile e desktop
- Feedbacks visuais claros (badges, chips, alertas)
- Destaque para vencedor(es) na classificação

## Sem Backend

Por ser apenas frontend:
- Dados persistidos no LocalStorage do browser
- Estado em memória via Angular Signals
- Sem autenticação (aplicativo interno/empresa)
