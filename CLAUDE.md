# Semana Híbrida 🐊 — Contexto do Projeto

## O que é
App pessoal do Eric (30 anos, 73kg, "falso magro", objetivo: ganhar massa muscular)
para acompanhar o Desafio Atleta Híbrido de 7 dias (treino híbrido: musculação + corrida),
comprado do criador Victor Pareto / Time Híbrido. O app orienta dieta, água e treinos
diários com checklists. Começa na segunda-feira.

## Estado atual
- `index.html`: app completo em HTML/CSS/JS vanilla, funcional, responsivo, PT-BR.
- PWA pronto: `manifest.webmanifest` + `sw.js` (cache offline) + ícones.
- Persistência atual: localStorage (chave `semana-hibrida-eric-v2`).
- Deploy alvo: repositório GitHub + Vercel (site estático, sem build).

## Dados que NÃO devem ser alterados sem pedido do Eric
- Dieta: 6 refeições/dia, ~2.800 kcal, ~160g proteína (constante `MEALS`).
  Restrições: nada de pasta de amendoim; comida simples/barata; whey permitido.
- Treinos (constante `DAYS`): Seg=Musculação A (peito/ombro/tríceps),
  Ter=corrida 1:3, Qua=Musculação B (inferiores), Qui=corrida 1:2,
  Sex=Musculação C (costas/bíceps), Sáb=corrida 1:1 + HIIT abdominal, Dom=descanso.
  Treino às 18h20. Zonas de FC: FCmáx ≈ 187 bpm (Tanaka, 30 anos); Z1 94–110, Z3 131–148.
- Links de vídeo dos exercícios (constante `V`): extraídos do PDF oficial do
  Time Híbrido — manter como estão.
- Água: meta 3L entre 8h e 18h, medida em garrafas Stanley com seletor de
  tamanho (473ml / 709ml / 1064ml).

## Próxima tarefa (prioridade)
~~Adicionar sincronização entre dispositivos com Supabase~~ ✅ Implementado.
Ver `supabase/schema.sql`, `config.js` e seção Sincronização no app.

## Backlog (depois da sync)
- Semana 2+: progressão de cargas e novos ciclos de treino (o Eric vai pedir
  aqui ou no chat do Claude; a dieta pode ser recalculada se o peso mudar).
- Histórico de semanas (arquivar semana concluída em vez de sobrescrever).
- Lembretes/notificações de água (Notification API, opcional).

## Estilo
- Visual atual: verde escuro (#0E2213), menta (#A9F0C3), lima (#7BE38B),
  tema "Time Híbrido/jacaré 🐊". Manter identidade.
- Tudo em português brasileiro, tom direto e motivador, sem exageros.
