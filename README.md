# 🏆 Bolão da Copa do Mundo

Aplicação frontend Angular para gerenciar o bolão da Copa do Mundo na empresa.

## Como rodar

```bash
cd frontend
npx @angular/cli@20 serve
```

Acesse: **http://localhost:4200**

## Como usar

1. **Configuração** → Defina o nome do bolão e o valor de entrada por participante
2. **Participantes** → Adicione todos que vão participar
3. **Jogos** → Cadastre os jogos (Time A vs Time B + fase da Copa)
4. **Palpites** → Para cada jogo, cada participante informa o placar que acredita
5. **Resultados** → Após o jogo, insira o placar real
6. **Classificação** → Veja quem ganhou e quanto cada vencedor recebe

## Pontuação

| Resultado | Pontos |
|-----------|--------|
| Placar exato | ⚽ 3 pontos |
| Acertou o vencedor (não o placar) | ✓ 1 ponto |
| Errou | ✗ 0 pontos |

## Prêmio

O prêmio total é `valor da entrada × número de participantes`.
Se houver múltiplos vencedores (mesma pontuação máxima), o prêmio é dividido igualmente.

## Stack

- Angular 20 (Standalone Components + Signals)
- Angular Material (tema verde/amarelo Copa)
- LocalStorage (sem backend)
