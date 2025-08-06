FROM node:22.16.0 AS base
ENV PNPM_HOME="/usr/local/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN mkdir -p $PNPM_HOME
RUN npm install -g pnpm

FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm build

FROM base AS runner
WORKDIR /app
EXPOSE 5000
COPY --from=builder /app .
RUN pnpm db:migrate
CMD ["pnpm", "start"]