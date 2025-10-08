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
