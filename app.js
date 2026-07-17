import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// ---------------- dados ----------------
const MEALS = [
  { id:"cafe", time:"07h00", name:"Café da manhã", desc:"3 ovos mexidos · 2 fatias de pão (50g) · 1 banana (100g) · café preto", kcal:520, prot:28 },
  { id:"lanche1", time:"10h00", name:"Lanche da manhã", desc:"1 copo de leite integral (250ml) · 1 fruta (maçã ou laranja, ~130g)", kcal:250, prot:10 },
  { id:"almoco", time:"12h30", name:"Almoço", desc:"200g de arroz cozido · 100g de feijão (1 concha) · 150g de frango ou carne · salada à vontade + fio de azeite", kcal:750, prot:45 },
  { id:"pretreino", time:"17h00", name:"Pré-treino", desc:"2 fatias de pão (50g) com mel (15g) · 1 banana (100g) — leve, só pra dar gás", kcal:350, prot:8 },
  { id:"jantar", time:"20h00", name:"Jantar (pós-treino)", desc:"150g de arroz cozido · 150g de frango ou carne moída · 1 ovo · 100g de legumes", kcal:700, prot:48 },
  { id:"ceia", time:"22h00", name:"Ceia", desc:"30g de whey com água ou leite (ou 170g de iogurte natural + 20g de aveia)", kcal:230, prot:26 },
];
const TOTAL_KCAL = MEALS.reduce((s,m)=>s+m.kcal,0);
const TOTAL_PROT = MEALS.reduce((s,m)=>s+m.prot,0);
const WATER_GOAL_ML = 3000;
const BOTTLE_SIZES = [ {ml:473,label:"473ml"}, {ml:709,label:"709ml"}, {ml:1064,label:"1L"} ];
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
const DAYS = [
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

// ---------------- estado ----------------
const STORE_KEY = "semana-hibrida-eric-v2";
const emptyWeek = () => ({
  bottleSize: 709,
  updatedAt: null,
  days: Object.fromEntries(DAYS.map(d => [d.id, { meals:{}, water:0, workout:{} }])),
});
let store;
try {
  const raw = localStorage.getItem(STORE_KEY);
  if (raw) {
    const parsed = JSON.parse(raw);
    const base = emptyWeek();
    store = { bottleSize: parsed.bottleSize || base.bottleSize, updatedAt: parsed.updatedAt || null, days: { ...base.days, ...(parsed.days||{}) } };
  } else store = emptyWeek();
} catch(e) { store = emptyWeek(); }

let dayId = "seg";
// abre no dia da semana atual (seg=1 ... dom=0)
const jsDay = new Date().getDay();
const map = { 1:"seg", 2:"ter", 3:"qua", 4:"qui", 5:"sex", 6:"sab", 0:"dom" };
dayId = map[jsDay] || "seg";

function save() {
  store.updatedAt = new Date().toISOString();
  try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch(e) {}
  scheduleSync();
}

// ---------------- sync (Supabase) ----------------
const SUPABASE_URL = window.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || "";
const SYNC_CODE = "semana-hibrida-eric"; // fixo: é só o Eric, entre os próprios aparelhos, sem código manual
const SYNC_POLL_MS = 8000;
const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
let syncStatus = "idle"; // idle | syncing | synced | error

function syncStatusLabel(s) {
  return { syncing:"sincronizando…", synced:"sincronizado ✓", error:"erro ao sincronizar" }[s] || "";
}
function syncStatusColor(s) {
  return { syncing:"var(--dim)", synced:"var(--lime)", error:"var(--danger)" }[s] || "var(--dim)";
}

let syncTimer = null;
let pollTimer = null;

async function pullFromCloud(silent) {
  if (!supabase) return false;
  if (!silent) { syncStatus = "syncing"; render(); }
  try {
    const { data, error } = await supabase.from("progress").select("data,updated_at").eq("sync_code", SYNC_CODE).maybeSingle();
    if (error) throw error;
    if (data && (!store.updatedAt || new Date(data.updated_at) > new Date(store.updatedAt))) {
      const base = emptyWeek();
      store = { ...base, ...data.data, updatedAt: data.updated_at };
      try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch(e) {}
      syncStatus = "synced";
      render();
      return true;
    }
    syncStatus = "synced";
    if (!silent) render();
    return false;
  } catch (e) {
    syncStatus = "error";
    render();
    return false;
  }
}

function scheduleSync() {
  if (!supabase) return;
  syncStatus = "syncing";
  clearTimeout(syncTimer);
  syncTimer = setTimeout(pushToCloud, 1200);
}

async function pushToCloud() {
  if (!supabase) return;
  try {
    const updatedAt = store.updatedAt || new Date().toISOString();
    const { error } = await supabase.from("progress").upsert(
      { sync_code: SYNC_CODE, data: store, updated_at: updatedAt },
      { onConflict: "sync_code" }
    );
    if (error) throw error;
    syncStatus = "synced";
  } catch (e) {
    syncStatus = "error";
  }
  render();
}

function startAutoSync() {
  if (!supabase) return;
  pullFromCloud(false);
  clearInterval(pollTimer);
  pollTimer = setInterval(() => pullFromCloud(true), SYNC_POLL_MS);
}
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") pullFromCloud(true);
});

// ---------------- helpers ----------------
const esc = (s) => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
function bottlesGoal() { return Math.round(WATER_GOAL_ML / store.bottleSize); }
function dayProgress(id) {
  const d = DAYS.find(x => x.id === id);
  const w = store.days[id];
  const mealsDone = MEALS.filter(m => w.meals[m.id]).length;
  const workoutDone = d.blocks.filter((_,i) => w.workout[i]).length;
  const total = MEALS.length + d.blocks.length + 1;
  const done = mealsDone + workoutDone + (w.water >= bottlesGoal() ? 1 : 0);
  return Math.round((done/total)*100);
}

// ---------------- ações ----------------
window.setDay = (id) => { dayId = id; render(); };
window.toggleMeal = (id) => { store.days[dayId].meals[id] = !store.days[dayId].meals[id]; save(); render(); };
window.toggleWorkout = (i) => { store.days[dayId].workout[i] = !store.days[dayId].workout[i]; save(); render(); };
window.setBottle = (ml) => { store.bottleSize = ml; save(); render(); };
window.waterAdd = (n) => {
  const g = bottlesGoal();
  store.days[dayId].water = Math.min(g, Math.max(0, store.days[dayId].water + n));
  save(); render();
};

// ---------------- render ----------------
function render() {
  const day = DAYS.find(d => d.id === dayId);
  const dd = store.days[dayId];
  const g = bottlesGoal();
  const prog = dayProgress(dayId);
  const weekAvg = Math.round(DAYS.reduce((s,d)=>s+dayProgress(d.id),0)/DAYS.length);
  const protDone = MEALS.filter(m=>dd.meals[m.id]).reduce((s,m)=>s+m.prot,0);
  const kcalDone = MEALS.filter(m=>dd.meals[m.id]).reduce((s,m)=>s+m.kcal,0);
  const liters = ((dd.water*store.bottleSize)/1000).toFixed(1).replace(".",",");
  const perBottleMin = Math.round(600/g);
  const cadence = perBottleMin >= 60 ? (Math.round(perBottleMin/30)*30/60).toString().replace(".",",")+"h" : perBottleMin+" min";

  document.getElementById("app").innerHTML = `
  <header>
    <div class="eyebrow">DESAFIO ATLETA HÍBRIDO · SEMANA 1 🐊</div>
    <h1>${day.label} — ${esc(day.title)}</h1>
    <div class="subtitle">${esc(day.subtitle)}</div>
  </header>

  <nav class="day-row" aria-label="Dias da semana">
    ${DAYS.map(d => {
      const p = dayProgress(d.id);
      const cls = (d.id===dayId?"active ":"") + (p===100?"done":"");
      return `<button class="day-btn ${cls}" onclick="setDay('${d.id}')">
        <span class="lbl">${d.label}</span><span class="pct">${p===100?"✓":p+"%"}</span>
      </button>`;
    }).join("")}
  </nav>

  <section class="card">
    <div class="row-between">
      <span class="card-title">Progresso de hoje</span>
      <span class="big-pct ${prog===100?"full":""}">${prog}%</span>
    </div>
    <div class="bar-outer"><div class="bar-inner ${prog===100?"full":""}" style="width:${prog}%"></div></div>
    ${prog===100?`<div class="domin">🐊 Dia dominado. Quem vence o dia, vence a semana.</div>`:""}
  </section>

  <section class="card">
    <div class="row-between">
      <span class="card-title">Alimentação</span>
      <span style="color:var(--dim);font-size:12px">${kcalDone}/${TOTAL_KCAL} kcal · ${protDone}/${TOTAL_PROT}g prot.</span>
    </div>
    <div class="stack">
      ${MEALS.map(m => {
        const c = !!dd.meals[m.id];
        return `<label class="item ${c?"checked":""}">
          <input type="checkbox" ${c?"checked":""} onchange="toggleMeal('${m.id}')">
          <div style="flex:1">
            <div style="display:flex;gap:8px;align-items:baseline">
              <span class="meal-time">${m.time}</span>
              <span class="meal-name strike">${esc(m.name)}</span>
            </div>
            <div class="meal-desc">${esc(m.desc)}</div>
            <div class="meal-macros">~${m.kcal} kcal · ${m.prot}g proteína</div>
          </div>
        </label>`;
      }).join("")}
    </div>
  </section>

  <section class="card">
    <div class="row-between">
      <span class="card-title">Água · Stanley 🥤</span>
      <span style="font-size:12px;font-weight:700;color:${dd.water>=g?"var(--lime)":"var(--dim)"}">${liters}L / 3L</span>
    </div>
    <div class="size-row">
      ${BOTTLE_SIZES.map(b => `<button class="size-btn ${store.bottleSize===b.ml?"active":""}" onclick="setBottle(${b.ml})">${b.label}</button>`).join("")}
    </div>
    <div class="water-goal">Meta: ${g} garrafas entre 8h e 18h</div>
    <div class="water-hint">≈ 1 garrafa a cada ${cadence} · terminou uma? marca aqui</div>
    <div class="water-controls">
      <button class="water-btn" aria-label="Remover garrafa" onclick="waterAdd(-1)">−</button>
      <div class="bottles">
        ${Array.from({length:g}).map((_,i)=>`<div class="bottle ${i<dd.water?"full":""}"></div>`).join("")}
      </div>
      <button class="water-btn add" aria-label="Adicionar garrafa" onclick="waterAdd(1)">+</button>
    </div>
  </section>

  <section class="card">
    <div class="row-between">
      <span class="card-title">${day.type==="run"?"🏃 Corrida":day.type==="gym"?"🏋️ Musculação":"😴 Recuperação"} · ${day.type==="rest"?"hoje é sagrado":"18h20"}</span>
    </div>
    <p class="note">${esc(day.note)}</p>
    <div class="stack" style="margin-top:0">
      ${day.blocks.map((b,i) => {
        const c = !!dd.workout[i];
        return `<div class="item ${c?"checked":""}" style="cursor:default">
          <input type="checkbox" ${c?"checked":""} onchange="toggleWorkout(${i})">
          <div style="flex:1">
            <div class="strike" style="font-size:13.5px;line-height:1.45">${esc(b.t)}</div>
            ${b.v?`<a class="video-link" href="${b.v}" target="_blank" rel="noopener">▶ ver vídeo</a>`:""}
            ${b.v2?`<a class="video-link" href="${b.v2}" target="_blank" rel="noopener">▶ vídeo 2</a>`:""}
          </div>
        </div>`;
      }).join("")}
    </div>
  </section>

  <section class="card">
    <div class="row-between">
      <span class="card-title">Semana</span>
      <span style="color:var(--mint);font-weight:800">${weekAvg}%</span>
    </div>
    <div class="bar-outer"><div class="bar-inner" style="width:${weekAvg}%"></div></div>
    <div class="footer-note">Meta diária: 6 refeições · ${g} garrafas até 18h · treino completo. Progresso salvo automaticamente neste aparelho.</div>
  </section>

  <section class="card" style="margin-bottom:8px">
    <div class="row-between">
      <span class="card-title">Sincronização 🔄</span>
      <span style="font-size:11px;font-weight:700;color:${syncStatusColor(syncStatus)}">${supabase ? (syncStatusLabel(syncStatus) || "automática") : "não configurada"}</span>
    </div>
    <p class="note">${supabase
      ? "Seu progresso sincroniza automaticamente entre todos os seus aparelhos, sem precisar de código."
      : `Sincronização ainda não configurada. Crie o <code style="color:var(--mint)">config.js</code> a partir do <code style="color:var(--mint)">config.example.js</code> com as credenciais do Supabase.`}</p>
  </section>`;
}
render();
startAutoSync();

// PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(()=>{}));
}
