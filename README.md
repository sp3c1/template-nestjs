# NestJS Monorepo Template

## Env

Should be set in src, so `./src/apps/template/.env`. If a platform has issue with reading the env, adjust the main.ts.

## Docker Composer

Postgres and redis to work alongside app.

```bash
docker composer up -d
```

## Install and run

```bash
npm install
npm run build:libs:all
npm run start:apps:template
```

More build/run commands in pkg json.

This repo follow NestJs monorepo pattern.

## Docker

Docker files are on the level of apps. Run from root.

```bash
docker build -f ./apps/template/Dockerfile . -t template
```

## GraphQL for template

Playground available at [http://localhost:3000/graphql](http://localhost:3000/graphql).

## OpenAPI template

Docs available at [http://localhost:3000/doc](http://localhost:3000/doc)

## Subscription GQL

Make sure to use `graphql-ws` protocol
