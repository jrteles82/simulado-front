# Simulado Front (Angular Standalone)

Frontend Angular Standalone que consome a API NestJS.

## Rodando em desenvolvimento
```bash
npm install
npm start
```
- App: http://localhost:4200
- Proxy: `/api` -> `http://localhost:3000` (ajuste `proxy.conf.json` se necessário).

## Build de produção
```bash
npm run build
```
Saída em `dist/simulado-front`.

## Deploy no Vercel
1. Instale o CLI do Vercel localmente (`npm install -g vercel`) e autentique (`vercel login`).
2. No diretório do projeto, execute `vercel` e aceite as opções sugeridas (o arquivo `vercel.json` já define `buildCommand` e `outputDirectory`).
3. Para publicar em produção, rode `vercel --prod`.

> O frontend usa `src/environments/environment.production.ts` para apontar a API pública em produção; ajuste `apiBase` conforme o domínio real. Se preferir usar rewrites no Vercel, altere também o `vercel.json`.
