import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { TOTAL_KCAL, PROFILE, SYNC_CODE, weekProgress, emptyWeek } from "./data.js";

const SUPABASE_URL = window.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || "";
const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
const BUCKET = "photos";
const ACTIVITY_MULTIPLIER = 1.55; // moderadamente ativo (treina ~6x/semana)
const KCAL_PER_KG = 7700; // aproximação padrão

const esc = (s) => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const fmt1 = (n) => n.toFixed(1).replace(".", ",");
const fmt0 = (n) => Math.round(n).toString();

let session = null;
let view = "loading"; // loading | login | app
let loginError = "";
let loginBusy = false;
let formError = "";
let busy = { weight: false, photo: false };

let weekAvg = 0;
let weighIns = [];
let photos = [];

function computeProjection() {
  if (!weighIns.length) return null;
  const currentWeight = Number(weighIns[0].weight_kg);
  const { heightCm, ageYears, sex } = PROFILE;
  const bmr = sex === "female"
    ? 10*currentWeight + 6.25*heightCm - 5*ageYears - 161
    : 10*currentWeight + 6.25*heightCm - 5*ageYears + 5;
  const tdee = bmr * ACTIVITY_MULTIPLIER;
  const dailySurplus = TOTAL_KCAL - tdee;
  const maxGainKg = (dailySurplus * 7) / KCAL_PER_KG;
  return {
    currentWeight,
    tdee,
    dailySurplus,
    projectedFull: currentWeight + maxGainKg,
    projectedCurrentPace: currentWeight + maxGainKg * (weekAvg / 100),
  };
}

async function loadWeekAvg() {
  try {
    const { data } = await supabase.from("progress").select("data").eq("sync_code", SYNC_CODE).maybeSingle();
    const store = data?.data ? { ...emptyWeek(), ...data.data } : emptyWeek();
    weekAvg = weekProgress(store);
  } catch (e) { weekAvg = 0; }
}

async function loadWeighIns() {
  try {
    const { data, error } = await supabase
      .from("weigh_ins")
      .select("id,weight_kg,recorded_at")
      .order("recorded_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(20);
    if (error) throw error;
    weighIns = data || [];
  } catch (e) { weighIns = []; }
}

async function loadPhotos() {
  try {
    const { data, error } = await supabase.storage.from(BUCKET).list("", { sortBy: { column: "name", order: "desc" } });
    if (error) throw error;
    const files = (data || []).filter(f => f.name && !f.name.startsWith("."));
    const withUrls = await Promise.all(files.map(async (f) => {
      const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(f.name, 3600);
      return { path: f.name, url: signed?.signedUrl, date: f.name.slice(0, 10) };
    }));
    photos = withUrls.filter(p => p.url);
  } catch (e) { photos = []; }
}

async function loadAll() {
  await Promise.all([loadWeekAvg(), loadWeighIns(), loadPhotos()]);
  render();
}

window.doLogin = async () => {
  const email = document.getElementById("login-email")?.value.trim();
  const pass = document.getElementById("login-pass")?.value;
  if (!email || !pass) return;
  loginBusy = true; loginError = ""; render();
  const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
  loginBusy = false;
  if (error) { loginError = "E-mail ou senha incorretos."; render(); return; }
};

window.doLogout = async () => { await supabase.auth.signOut(); };

window.saveWeight = async () => {
  const val = parseFloat(document.getElementById("weight-input")?.value);
  const date = document.getElementById("weight-date")?.value || new Date().toISOString().slice(0, 10);
  if (!val || val <= 0) { formError = "Peso inválido."; render(); return; }
  busy.weight = true; formError = ""; render();
  try {
    const { error } = await supabase.from("weigh_ins").insert({ weight_kg: val, recorded_at: date });
    if (error) throw error;
    document.getElementById("weight-input").value = "";
    await loadWeighIns();
  } catch (e) {
    formError = "Erro ao salvar peso.";
  }
  busy.weight = false;
  render();
};

window.uploadPhoto = async () => {
  const input = document.getElementById("photo-input");
  const file = input?.files?.[0];
  if (!file) return;
  busy.photo = true; formError = ""; render();
  try {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const dateStr = new Date().toISOString().slice(0, 10);
    const rand = Math.random().toString(36).slice(2, 8);
    const path = `${dateStr}_${rand}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type || "image/jpeg" });
    if (error) throw error;
    if (input) input.value = "";
    await loadPhotos();
  } catch (e) {
    formError = "Erro ao enviar foto.";
  }
  busy.photo = false;
  render();
};

const inputStyle = "background:var(--card-soft);border:1.5px solid var(--line);border-radius:10px;color:var(--text);padding:9px 12px;font-family:inherit;font-size:14px;width:100%";

function renderLogin() {
  return `
  <header>
    <div class="eyebrow">ÁREA PRIVADA 🔒</div>
    <h1>Fotos &amp; Peso</h1>
    <div class="subtitle">Só você entra aqui</div>
  </header>
  <section class="card">
    <div class="card-title">Entrar</div>
    <div class="stack" style="margin-top:10px">
      <input id="login-email" type="email" placeholder="e-mail" style="${inputStyle}" autocomplete="username">
      <input id="login-pass" type="password" placeholder="senha" style="${inputStyle}" autocomplete="current-password" onkeydown="if(event.key==='Enter') doLogin()">
    </div>
    ${loginError ? `<p class="note" style="color:var(--danger)">${esc(loginError)}</p>` : ""}
    <button class="size-btn active" style="width:100%;margin-top:12px;padding:10px 0" onclick="doLogin()" ${loginBusy ? "disabled" : ""}>${loginBusy ? "Entrando…" : "Entrar"}</button>
  </section>
  <p class="footer-note" style="text-align:center;margin-top:14px"><a href="index.html" style="color:var(--dim)">← voltar pro checklist</a></p>`;
}

function renderApp() {
  const proj = computeProjection();
  return `
  <header>
    <div class="row-between">
      <div>
        <div class="eyebrow">ÁREA PRIVADA 🔒</div>
        <h1>Fotos &amp; Peso</h1>
      </div>
      <button class="size-btn" style="flex:none;padding:8px 14px" onclick="doLogout()">Sair</button>
    </div>
  </header>

  <section class="card">
    <div class="card-title">Peso</div>
    <div class="stack" style="margin-top:10px">
      <input id="weight-input" type="number" step="0.1" inputmode="decimal" placeholder="peso em kg" style="${inputStyle}">
      <input id="weight-date" type="date" value="${new Date().toISOString().slice(0,10)}" style="${inputStyle}">
    </div>
    ${formError ? `<p class="note" style="color:var(--danger)">${esc(formError)}</p>` : ""}
    <button class="size-btn active" style="width:100%;margin-top:10px;padding:9px 0" onclick="saveWeight()" ${busy.weight ? "disabled" : ""}>${busy.weight ? "Salvando…" : "Registrar peso"}</button>
    ${weighIns.length ? `
      <div class="stack" style="margin-top:12px">
        ${weighIns.slice(0,5).map(w => `
          <div class="row-between" style="font-size:13px;color:var(--dim)">
            <span>${esc(w.recorded_at)}</span>
            <span style="color:var(--mint);font-weight:700">${fmt1(Number(w.weight_kg))} kg</span>
          </div>`).join("")}
      </div>` : `<p class="note">Nenhum peso registrado ainda.</p>`}
  </section>

  <section class="card">
    <div class="card-title">Projeção da semana</div>
    ${proj ? `
      <p class="note">Manutenção estimada: <strong style="color:var(--sand)">~${fmt0(proj.tdee)} kcal/dia</strong> · Dieta atual: <strong style="color:var(--sand)">${TOTAL_KCAL} kcal/dia</strong> (${proj.dailySurplus >= 0 ? "superávit" : "déficit"} de ~${fmt0(Math.abs(proj.dailySurplus))} kcal/dia).</p>
      <div class="stack" style="margin-top:8px">
        <div class="row-between">
          <span style="font-size:13px;color:var(--dim)">Peso atual</span>
          <span style="font-weight:800;color:var(--mint)">${fmt1(proj.currentWeight)} kg</span>
        </div>
        <div class="row-between">
          <span style="font-size:13px;color:var(--dim)">No ritmo atual (${weekAvg}% da semana)</span>
          <span style="font-weight:800;color:var(--mint)">${fmt1(proj.projectedCurrentPace)} kg</span>
        </div>
        <div class="row-between">
          <span style="font-size:13px;color:var(--dim)">Se seguir 100% até o fim da semana</span>
          <span style="font-weight:800;color:var(--lime)">${fmt1(proj.projectedFull)} kg</span>
        </div>
      </div>
      <p class="footer-note" style="margin-top:10px">Estimativa aproximada (fórmula Mifflin-St Jeor + ~7.700 kcal por kg). Água, sono e digestão fazem o número real variar dia a dia.</p>
    ` : `<p class="note">Registre um peso pra ver a projeção da semana.</p>`}
  </section>

  <section class="card" style="margin-bottom:8px">
    <div class="card-title">Fotos de progresso</div>
    <div class="stack" style="margin-top:10px">
      <input id="photo-input" type="file" accept="image/*" style="${inputStyle}">
    </div>
    <button class="size-btn active" style="width:100%;margin-top:10px;padding:9px 0" onclick="uploadPhoto()" ${busy.photo ? "disabled" : ""}>${busy.photo ? "Enviando…" : "Enviar foto de hoje"}</button>
    ${photos.length ? `
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px">
        ${photos.map(p => `
          <a href="${p.url}" target="_blank" rel="noopener" style="display:block">
            <img src="${p.url}" alt="Foto de ${esc(p.date)}" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:10px;border:1px solid var(--line)">
            <div style="font-size:10px;color:var(--dim);text-align:center;margin-top:3px">${esc(p.date)}</div>
          </a>`).join("")}
      </div>` : `<p class="note" style="margin-top:10px">Nenhuma foto ainda. As fotos ficam privadas, só você acessa.</p>`}
  </section>

  <p class="footer-note" style="text-align:center;margin-bottom:16px"><a href="index.html" style="color:var(--dim)">← voltar pro checklist</a></p>`;
}

function render() {
  const html = view === "app" ? renderApp() : view === "login" ? renderLogin() : `<p class="note" style="margin-top:40px;text-align:center">Carregando…</p>`;
  document.getElementById("app").innerHTML = html;
}

render();

if (!supabase) {
  view = "login";
  loginError = "Sincronização não configurada (config.js sem credenciais do Supabase).";
  render();
} else {
  supabase.auth.onAuthStateChange((_event, s) => {
    const wasLoggedIn = !!session;
    session = s;
    view = s ? "app" : "login";
    render();
    if (s && !wasLoggedIn) loadAll();
  });
}
