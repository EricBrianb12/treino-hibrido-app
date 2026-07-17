# Semana Híbrida 🐊

App de acompanhamento de 7 dias do Desafio Atleta Híbrido: dieta, água (garrafas Stanley) e treinos com vídeos.

- Site estático — sem build, sem dependências npm
- PWA: instalável na tela inicial do celular, funciona offline
- Progresso salvo no aparelho (localStorage) + sincronização opcional via Supabase

## 1. Criar conta e banco no Supabase (grátis)

1. Acesse [supabase.com](https://supabase.com) → **Start your project** → entre com GitHub (ou e-mail).
2. **New project** → escolha um nome (ex.: `semana-hibrida`) → senha do banco → região **South America (São Paulo)** se disponível → **Create new project** (leva ~1 min).
3. No menu lateral: **SQL Editor** → **New query**.
4. Abra o arquivo `supabase/schema.sql` deste repositório, copie todo o conteúdo, cole no editor e clique **Run**. Deve aparecer "Success".
5. Vá em **Project Settings** (ícone de engrenagem) → **API** e anote:
   - **Project URL** (ex.: `https://abcdefgh.supabase.co`)
   - **anon public** key (começa com `eyJ...`)

## 2. Configurar o app localmente

```bash
cp config.example.js config.js
```

Edite `config.js` e cole sua URL e anon key do passo 5.

Abra `index.html` no navegador (ou use um servidor local). Na seção **Sincronização 🔄**:

- **Gerar código novo** — cria um código de 7 caracteres e envia seu progresso para a nuvem.
- **Conectar** — digite o mesmo código em outro aparelho para puxar os dados (last-write-wins).

## 3. Colocar no ar (GitHub + Vercel)

### GitHub

1. Crie uma conta em [github.com](https://github.com) se ainda não tiver.
2. **New repository** → nome `semana-hibrida` → **Create repository** (público ou privado).
3. No terminal, na pasta do projeto:

```bash
git init
git add .
git commit -m "App Semana Híbrida com sync Supabase"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/semana-hibrida.git
git push -u origin main
```

> **Importante:** inclua o `config.js` no commit (a anon key é pública por design; o RLS protege os dados). Nunca commite a `service_role` key.

### Vercel

1. Conta em [vercel.com](https://vercel.com) → entre com GitHub.
2. **Add New → Project** → importe `semana-hibrida`.
3. Framework Preset: **Other** (site estático, sem build).
4. **Deploy** — pronto em `https://semana-hibrida-xxxx.vercel.app`.

## Instalar como app no celular

- **Android (Chrome):** abra o link → menu ⋮ → **Adicionar à tela inicial** / **Instalar app**.
- **iPhone (Safari):** abra o link → Compartilhar → **Adicionar à Tela de Início**.

## Observações

- O progresso fica no navegador; limpar dados do navegador apaga o progresso local (a nuvem mantém se você tiver código de sync).
- Quem souber seu código de sync pode ver/editar seu progresso — use só entre seus aparelhos.
- Para editar dieta/treinos, altere as constantes `MEALS` e `DAYS` em `index.html`.
