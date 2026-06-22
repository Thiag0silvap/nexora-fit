# Nexora Fit

**Sua evolução, todos os dias.**

Nexora Fit é uma plataforma para gestão de academias, acompanhamento de treinos,
avaliações físicas e evolução dos alunos.

## Aplicações

```txt
apps/
  api/      API NestJS com PostgreSQL e Prisma
  web/      Painel administrativo em Next.js
  mobile/   Aplicativo Expo para alunos e instrutores

packages/
  shared/   Tipos, enums e validações compartilhadas
```

O monorepo utiliza npm workspaces. Os nomes técnicos dos pacotes continuam sob o
namespace `@fitgestao/*` para preservar compatibilidade com instalações existentes.

## Instalação

Na raiz do projeto:

```bash
npm install
```

Configure a API a partir de `apps/api/.env.example` antes de iniciar os serviços.

## Desenvolvimento

```bash
npm run dev:api
npm run dev:web
npm run dev:mobile
```

Por padrão:

- API: `http://localhost:3000`
- Web: `http://localhost:3001`
- Mobile: endereço publicado pelo Expo CLI

## Validação

```bash
npm run build:shared
npm run build:api
npm run build:web
npx tsc -p apps/mobile/tsconfig.json --noEmit
```

## Banco de dados

Os comandos Prisma devem ser executados pelo workspace da API:

```bash
npm --workspace apps/api run prisma:generate
npm --workspace apps/api run prisma:migrate
npm --workspace apps/api run prisma:seed
```

## Health check

Com a API em execução:

```bash
curl http://localhost:3000/health
```

Resposta esperada:

```json
{
  "status": "ok",
  "service": "nexora-fit-api"
}
```

## Escopo atual

- Gestão de alunos, instrutores e biblioteca de exercícios.
- Criação e manutenção de fichas, divisões e exercícios.
- Registro de execuções, cargas e progresso diário.
- Avaliações físicas e medidas corporais.
- Aplicativo mobile para alunos e instrutores.
- Painel Web administrativo.
