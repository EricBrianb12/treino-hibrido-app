// ---------------- dados compartilhados (dieta, treinos, progresso) ----------------
// Usado por app.js (checklist diário) e fotos.js (dashboard de fotos/peso).

export const MEALS = [
  { id:"cafe", time:"07h00", name:"Café da manhã", desc:"3 ovos mexidos · 2 fatias de pão (50g) · 1 banana (100g) · café preto", kcal:520, prot:28 },
  { id:"lanche1", time:"10h00", name:"Lanche da manhã", desc:"1 copo de leite integral (250ml) · 1 fruta (maçã ou laranja, ~130g)", kcal:250, prot:10 },
  { id:"almoco", time:"12h30", name:"Almoço", desc:"200g de arroz cozido · 100g de feijão (1 concha) · 150g de frango ou carne · salada à vontade + fio de azeite", kcal:750, prot:45 },
  { id:"pretreino", time:"17h00", name:"Pré-treino", desc:"2 fatias de pão (50g) com mel (15g) · 1 banana (100g) — leve, só pra dar gás", kcal:350, prot:8 },
  { id:"jantar", time:"20h00", name:"Jantar (pós-treino)", desc:"150g de arroz cozido · 150g de frango ou carne moída · 1 ovo · 100g de legumes", kcal:700, prot:48 },
  { id:"ceia", time:"22h00", name:"Ceia", desc:"30g de whey com água ou leite (ou 170g de iogurte natural + 20g de aveia)", kcal:230, prot:26 },
];
export const TOTAL_KCAL = MEALS.reduce((s,m)=>s+m.kcal,0);
export const TOTAL_PROT = MEALS.reduce((s,m)=>s+m.prot,0);
export const WATER_GOAL_ML = 3000;
export const BOTTLE_SIZES = [ {ml:473,label:"473ml"}, {ml:709,label:"709ml"}, {ml:1064,label:"1L"} ];
const RUN_ZONES = "Suas zonas (30 anos · FCmáx ≈ 187 bpm): Z1 leve = 94–110 bpm (conversa fácil) · Z3 moderado = 131–148 bpm (conversa difícil)";
const V = {
  aqSup:"https://www.youtube.com/watch?v=M8goKw7_-tU",
  aqDinamico:"https://www.youtube.com/watch?v=n3oSXWHxRZc",
  run13:"https://www.youtube.com/watch?v=l458UMWaUZY",
  run12:"https://www.youtube.com/watch?v=PMMe4m4A7jI",
  run11:"https://www.youtube.com/watch?v=XXKGgbXsSYk",
  intensidade:"https://www.youtube.com/watch?v=Rmd1AUs0wy4",
  a2:"https://www.youtube.com/watch?v=X6VqXSqm6OA",
  a3:"https://www.youtube.com/watch?v=Fdb6lfKW8EU",
  a4:"https://www.youtube.com/watch?v=WHJ-8Jr8Ug4",
  a5:"https://www.youtube.com/watch?v=OXgLJbVtIYk",
  bMob:"https://www.youtube.com/watch?v=sBJK1MU1JGg",
  bAgach:"https://www.youtube.com/watch?v=oM4dQnw2r44",
  bExt:"https://www.youtube.com/watch?v=I_s_nJzuIt0",
  bLeg:"https://www.youtube.com/watch?v=XrwFXYahprI",
  bFlex:"https://www.youtube.com/watch?v=0puAmlxM_i8",
  bHack:"https://www.youtube.com/watch?v=rRts63f3lpg",
  bAbd:"https://www.youtube.com/watch?v=Rg25JFpGLGg",
  bPant:"https://www.youtube.com/watch?v=SsNlVHY15Xs",
  cCavalinho:"https://www.youtube.com/watch?v=LtlC2kvF8_g",
  cPuxada:"https://www.youtube.com/watch?v=rgF7Pxhl1t0",
  cCrucifixo:"https://www.youtube.com/watch?v=8T0lJXVFsVg",
  cMartelo:"https://www.youtube.com/watch?v=64MVKBH1QS8",
  dHiit:"https://www.youtube.com/watch?v=dL8YAQLmKDY",
};
export const DAYS = [
  { id:"seg", label:"SEG", title:"Musculação A", subtitle:"Peito, ombro e tríceps", type:"gym",
    note:"Descanse 90s entre os bi-sets. Escolha cargas que deixem as últimas 3 repetições difíceis mas com técnica limpa.",
    blocks:[
      {t:"Aquecimento: mobilidade de ombros e braços — 5 min", v:V.aqSup},
      {t:"Bi-set 3x: 15 flexões no solo + 15 elevação lateral", v:V.a2},
      {t:"Bi-set 3x: 15 supino reto + 15 elevação frontal", v:V.a3},
      {t:"Bi-set 3x: 15 supino inclinado c/ halteres + 15 flexão militar", v:V.a4},
      {t:"Bi-set 3x: 15 voador polia alta + 15 tríceps coice c/ halteres", v:V.a5},
    ]},
  { id:"ter", label:"TER", title:"Corrida intervalada 1:3", subtitle:"≈ 24 minutos · moderado", type:"run", note:RUN_ZONES,
    blocks:[
      {t:"Aquecimento dinâmico: 5 min caminhada/trote leve (Z1)", v:V.aqDinamico},
      {t:"7x: 30 seg forte (Z3) + 90 seg leve (Z1)", v:V.run13},
      {t:"Desaquecimento: 5 min bem leve (Z1)", v:V.intensidade},
    ]},
  { id:"qua", label:"QUA", title:"Musculação B", subtitle:"Membros inferiores", type:"gym",
    note:"Descanse 45s–1min entre séries. Amplitude completa vale mais que carga alta.",
    blocks:[
      {t:"Aquecimento: flexibilidade e mobilidade de inferiores", v:V.bMob},
      {t:"3x15 agachamento com peso do corpo (45s)", v:V.bAgach},
      {t:"3x15 cadeira extensora (1 min)", v:V.bExt},
      {t:"3x15 leg press 45 (45s)", v:V.bLeg},
      {t:"3x15 mesa flexora (45s)", v:V.bFlex},
      {t:"3x15 agachamento hack (45s)", v:V.bHack},
      {t:"Bi-set 3x: 15 cadeira abdutora + 15 panturrilha em pé (45s)", v:V.bAbd, v2:V.bPant},
    ]},
  { id:"qui", label:"QUI", title:"Corrida intervalada 1:2", subtitle:"≈ 26 minutos · moderado", type:"run", note:RUN_ZONES,
    blocks:[
      {t:"Aquecimento dinâmico: 5 min caminhada/trote leve (Z1)", v:V.aqDinamico},
      {t:"7x: 45 seg forte (Z3) + 90 seg leve (Z1)", v:V.run12},
      {t:"Desaquecimento: 5 min bem leve (Z1)", v:V.intensidade},
    ]},
  { id:"sex", label:"SEX", title:"Musculação C", subtitle:"Costas e bíceps", type:"gym",
    note:"Na remada cavalinho: 6 repetições pesadas + 12 leves na mesma série — 2 min de descanso.",
    blocks:[
      {t:"Aquecimento: mobilidade de ombros e costas — 5 min", v:V.aqSup},
      {t:"3x (6 pesadas + 12 leves): remada cavalinho — 2 min", v:V.cCavalinho},
      {t:"Bi-set 3x: 15 puxada alta + 15 remada com halteres (90s)", v:V.cPuxada},
      {t:"Bi-set 3x: 15 crucifixo invertido c/ halteres + 15 remada baixa (90s)", v:V.cCrucifixo},
      {t:"3x15 bíceps martelo (45s)", v:V.cMartelo},
    ]},
  { id:"sab", label:"SÁB", title:"Corrida 1:1 + HIIT abdominal", subtitle:"≈ 24 min corrida + 4 min abdômen", type:"run",
    note:RUN_ZONES + " · No HIIT: 20s de exercício + 10s de descanso, sem parar.",
    blocks:[
      {t:"Aquecimento dinâmico: 5 min leve (Z1)", v:V.aqDinamico},
      {t:"7x: 1 min forte (Z3) + 1 min leve (Z1)", v:V.run11},
      {t:"Desaquecimento: 5 min leve (Z1)", v:V.intensidade},
      {t:"HIIT 1ª volta: 20s crunch · 20s elevação de pernas · 20s remador · 20s prancha (10s entre cada)", v:V.dHiit},
      {t:"HIIT 2ª volta: repetir a sequência", v:V.dHiit},
    ]},
  { id:"dom", label:"DOM", title:"Descanso total", subtitle:"O músculo cresce hoje", type:"rest",
    note:"Sem treino. Se quiser, caminhada leve de 20 min e alongamento. Mantenha a dieta e a água — recuperação também é treino.",
    blocks:[
      {t:"Dormir 7h30+ esta noite"},
      {t:"Alongamento leve ou caminhada (opcional)"},
      {t:"Preparar as marmitas / compras da próxima semana"},
    ]},
];

// ---------------- perfil (pra projeção de peso em fotos.js) ----------------
export const PROFILE = { heightCm: 170, ageYears: 30, sex: "male" };

// ---------------- sync (compartilhado com app.js e fotos.js) ----------------
export const SYNC_CODE = "semana-hibrida-eric"; // fixo: é só o Eric, entre os próprios aparelhos

// ---------------- estado/progresso ----------------
export const STORE_KEY = "semana-hibrida-eric-v2";
export const emptyWeek = () => ({
  bottleSize: 709,
  updatedAt: null,
  days: Object.fromEntries(DAYS.map(d => [d.id, { meals:{}, water:0, workout:{} }])),
});

export function bottlesGoal(store) { return Math.round(WATER_GOAL_ML / store.bottleSize); }

export function dayProgress(store, id) {
  const d = DAYS.find(x => x.id === id);
  const w = store.days[id];
  const mealsDone = MEALS.filter(m => w.meals[m.id]).length;
  const workoutDone = d.blocks.filter((_,i) => w.workout[i]).length;
  const total = MEALS.length + d.blocks.length + 1;
  const done = mealsDone + workoutDone + (w.water >= bottlesGoal(store) ? 1 : 0);
  return Math.round((done/total)*100);
}

export function weekProgress(store) {
  return Math.round(DAYS.reduce((s,d)=>s+dayProgress(store, d.id),0)/DAYS.length);
}
