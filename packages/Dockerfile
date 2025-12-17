FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build:server
RUN pnpm deploy --filter @ynab-plus/server /prod/server
RUN pnpm deploy --filter @ynab-plus/frontend /prod/frontend

FROM base as server
COPY --from=build /prod/server /prod/server
WORKDIR /prod/server
EXPOSE 3017
CMD [ "node" "dist/start-server.cjs" ]
