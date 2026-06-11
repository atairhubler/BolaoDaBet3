---
name: specs-componentes-bolao
description: Especificação dos componentes Angular do bolão
metadata:
  type: project
---

# Especificação de Componentes

## Modelos de Dados (Models)

```typescript
interface Participante {
  id: string;
  nome: string;
}

interface Palpite {
  participanteId: string;
  golsCasa: number;
  golsVisitante: number;
}

interface Resultado {
  golsCasa: number;
  golsVisitante: number;
}

interface Jogo {
  id: string;
  timeCasa: string;
  timeVisitante: string;
  fase: string;
  dataHora?: string;
  palpites: Palpite[];
  resultado?: Resultado;
  encerrado: boolean;
}

interface Bolao {
  nome: string;
  valorEntrada: number;
  participantes: Participante[];
  jogos: Jogo[];
}

interface ClassificacaoItem {
  participante: Participante;
  pontos: number;
  acertosExatos: number;
  acertosVencedor: number;
  vencedor: boolean;
  premio?: number;
}
```

## Rotas

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/` | `DashboardComponent` | Visão geral do bolão |
| `/configuracao` | `ConfiguracaoComponent` | Configurar bolão |
| `/participantes` | `ParticipantesComponent` | Gerenciar participantes |
| `/jogos` | `JogosComponent` | Listar e gerenciar jogos |
| `/jogos/:id/palpites` | `PalpitesComponent` | Palpites de um jogo |
| `/resultados` | `ResultadosComponent` | Registrar resultados |
| `/classificacao` | `ClassificacaoComponent` | Ranking e vencedores |

## BolaoService — Responsabilidades

- `bolao` signal: estado completo
- `classificacao` computed: ranking calculado
- `totalPremio` computed: valor total do prêmio
- `vencedores` computed: lista de vencedores
- `adicionarParticipante(nome)`: adiciona participante
- `removerParticipante(id)`: remove participante
- `adicionarJogo(timeCasa, timeVisitante, fase)`: cria jogo
- `removerJogo(id)`: remove jogo
- `registrarPalpite(jogoId, participanteId, golsCasa, golsVisitante)`: salva palpite
- `registrarResultado(jogoId, golsCasa, golsVisitante)`: finaliza jogo
- `calcularPontuacao(palpite, resultado)`: 3/1/0 pontos

## Regras de Pontuação

- Acertou o placar exato → 3 pontos
- Acertou o vencedor (ou empate) sem acertar o placar → 1 ponto
- Errou → 0 pontos
