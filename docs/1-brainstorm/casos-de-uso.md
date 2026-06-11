---
name: casos-de-uso-bolao
description: Casos de uso do bolão da Copa do Mundo
metadata:
  type: project
---

# Casos de Uso

## UC1: Configurar Bolão
- Definir nome do bolão
- Definir valor da entrada por participante
- Salvar configuração

## UC2: Gerenciar Participantes
- Adicionar participante (nome)
- Remover participante
- Listar participantes cadastrados

## UC3: Gerenciar Jogos
- Cadastrar jogo (Time Casa vs Time Visitante + fase da Copa)
- Listar jogos cadastrados
- Ver palpites de cada jogo

## UC4: Registrar Palpites
- Para cada jogo, cada participante informa o placar que acredita
- Palpite: gols do time casa X gols do time visitante
- Prazo: antes do resultado ser registrado

## UC5: Registrar Resultado
- Organizador informa o placar real do jogo
- Sistema calcula pontuação de cada participante para o jogo

## UC6: Visualizar Classificação
- Listar participantes ordenados por pontuação total
- Destacar vencedor(es)
- Exibir quanto cada vencedor ganha
- Prêmio dividido igualmente se múltiplos vencedores

## Fluxo Principal
```
Configurar Bolão → Adicionar Participantes → Cadastrar Jogos
→ Participantes fazem Palpites → Registrar Resultados
→ Ver Classificação → Distribuir Prêmio
```
