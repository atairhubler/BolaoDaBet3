---
name: fluxograma-bolao
description: Fluxo de uso da aplicação bolão
metadata:
  type: project
---

# Fluxograma da Aplicação

```
┌─────────────────────────────────────────────────────────────┐
│                    BOLÃO DA COPA DO MUNDO                    │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │  1. CONFIGURAÇÃO   │
                    │  - Nome do bolão   │
                    │  - Valor entrada   │
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────┐
                    │  2. PARTICIPANTES  │
                    │  - Adicionar       │
                    │  - Remover         │
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────┐
                    │    3. JOGOS        │
                    │  - Cadastrar jogo  │
                    │  - Time A vs B     │
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────┐
                    │   4. PALPITES      │
                    │  - Por participante│
                    │  - Por jogo        │
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────┐
                    │  5. RESULTADOS     │
                    │  - Placar real     │
                    │  - Pontuação calc. │
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────┐
                    │  6. CLASSIFICAÇÃO  │
                    │  - Ranking         │
                    │  - Vencedor(es)    │
                    │  - Prêmio          │
                    └────────────────────┘

## Regras de Pontuação

Placar exato  → 3 pontos
Vencedor certo (não o placar) → 1 ponto
Errou tudo    → 0 pontos

## Cálculo do Prêmio

Total = Valor Entrada × Número de Participantes
Vencedor(es) = Participante(s) com mais pontos
Prêmio por vencedor = Total ÷ Número de vencedores
```
