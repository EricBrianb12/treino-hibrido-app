import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { MEALS, TOTAL_KCAL, TOTAL_PROT, WATER_GOAL_ML, BOTTLE_SIZES, DAYS, STORE_KEY, SYNC_CODE, emptyWeek, bottlesGoal, dayProgress, weekProgress } from "./data.js";

// ---------------- estado ----------------
let store;
try {
  const raw = localStorage.getItem(STORE_KEY);
  if (raw) {
    const parsed = JSON.parse(raw);
    const base = emptyWeek();
    store = { bottleSize: parsed.bottleSize || base.bottleSize, updatedAt: parsed.updatedAt || null, days: { ...base.days, ...(parsed.days||{}) }, cargas: parsed.cargas || {} };
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
const SYNC_POLL_MS = 20000; // rede de segurança; a via principal é o Realtime
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

function applyRemoteRow(row) {
  if (!row || (store.updatedAt && new Date(row.updated_at) <= new Date(store.updatedAt))) return false;
  const base = emptyWeek();
  store = { ...base, ...row.data, updatedAt: row.updated_at };
  try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch(e) {}
  syncStatus = "synced";
  render();
  return true;
}

async function pullFromCloud(silent) {
  if (!supabase) return false;
  if (!silent) { syncStatus = "syncing"; render(); }
  try {
    const { data, error } = await supabase.from("progress").select("data,updated_at").eq("sync_code", SYNC_CODE).maybeSingle();
    if (error) throw error;
    const applied = applyRemoteRow(data);
    if (!applied) { syncStatus = "synced"; if (!silent) render(); }
    return applied;
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

  supabase
    .channel("progress-" + SYNC_CODE)
    .on("postgres_changes", { event: "*", schema: "public", table: "progress", filter: `sync_code=eq.${SYNC_CODE}` }, (payload) => {
      applyRemoteRow(payload.new);
    })
    .subscribe();
}
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") pullFromCloud(true);
});

// ---------------- helpers ----------------
const esc = (s) => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
function slugify(s) {
  return s.toLowerCase()
    .normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
function exerciseId(dId, blockText) { return dId + "-" + slugify(blockText); }
function lastCargaKg(exId) {
  const arr = (store.cargas && store.cargas[exId]) || [];
  if (!arr.length) return null;
  return arr.reduce((latest, r) => (!latest || r.data > latest.data) ? r : latest, null).kg;
}

// ---------------- ações ----------------
window.setDay = (id) => { dayId = id; render(); };
window.toggleMeal = (id) => { store.days[dayId].meals[id] = !store.days[dayId].meals[id]; save(); render(); };
window.toggleWorkout = (i) => { store.days[dayId].workout[i] = !store.days[dayId].workout[i]; save(); render(); };
window.setBottle = (ml) => { store.bottleSize = ml; save(); render(); };
window.waterAdd = (n) => {
  const g = bottlesGoal(store);
  store.days[dayId].water = Math.min(g, Math.max(0, store.days[dayId].water + n));
  save(); render();
};
window.saveCarga = (exId, rawVal) => {
  const kg = parseFloat(String(rawVal).replace(",", "."));
  if (!kg || kg <= 0) return;
  if (!store.cargas) store.cargas = {};
  if (!store.cargas[exId]) store.cargas[exId] = [];
  const today = new Date().toISOString().slice(0,10);
  const arr = store.cargas[exId];
  const idx = arr.findIndex(r => r.data === today);
  if (idx >= 0) arr[idx] = { data: today, kg }; else arr.push({ data: today, kg });
  save(); render();
};

// ---------------- render ----------------
function render() {
  const day = DAYS.find(d => d.id === dayId);
  const dd = store.days[dayId];
  const g = bottlesGoal(store);
  const prog = dayProgress(store, dayId);
  const weekAvg = weekProgress(store);
  const protDone = MEALS.filter(m=>dd.meals[m.id]).reduce((s,m)=>s+m.prot,0);
  const kcalDone = MEALS.filter(m=>dd.meals[m.id]).reduce((s,m)=>s+m.kcal,0);
  const liters = ((dd.water*store.bottleSize)/1000).toFixed(1).replace(".",",");
  const perBottleMin = Math.round(600/g);
  const cadence = perBottleMin >= 60 ? (Math.round(perBottleMin/30)*30/60).toString().replace(".",",")+"h" : perBottleMin+" min";

  document.getElementById("app").innerHTML = `
  <header>
    <div class="eyebrow">DESAFIO ATLETA HÍBRIDO 🐊</div>
    <h1>${day.label} — ${esc(day.title)}</h1>
    <div class="subtitle">${esc(day.subtitle)}</div>
  </header>

  <nav class="day-row" aria-label="Dias da semana">
    ${DAYS.map(d => {
      const p = dayProgress(store, d.id);
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
        const exId = exerciseId(day.id, b.t);
        const lastKg = day.type==="gym" ? lastCargaKg(exId) : null;
        return `<div class="item ${c?"checked":""}" style="cursor:default">
          <input type="checkbox" ${c?"checked":""} onchange="toggleWorkout(${i})">
          ${day.type==="gym" ? `<input type="number" step="0.5" min="0" inputmode="decimal" placeholder="${lastKg!=null?`última: ${lastKg}kg`:"kg"}" onblur="saveCarga('${exId}', this.value)" style="flex:none;width:64px;background:var(--card-soft);border:1.5px solid var(--line);border-radius:8px;color:var(--text);padding:6px 8px;font-size:12px;font-family:inherit;text-align:center">` : ""}
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
      ? "Seu progresso sincroniza em tempo real entre todos os seus aparelhos, sem precisar de código."
      : `Sincronização ainda não configurada. Crie o <code style="color:var(--mint)">config.js</code> a partir do <code style="color:var(--mint)">config.example.js</code> com as credenciais do Supabase.`}</p>
  </section>

  <p class="footer-note" style="text-align:center;margin-bottom:16px"><a href="fotos.html" style="color:var(--dim)">📸 Fotos & peso (área privada) →</a></p>`;
}
render();
startAutoSync();

// PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(()=>{}));
}
