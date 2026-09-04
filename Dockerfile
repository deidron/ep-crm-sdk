FROM node:24.20-alpine AS build
WORKDIR /app

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./

RUN pnpm install --frozen-lockfile --no-runtime

COPY . .

RUN node server/sync-routes.mjs

RUN pnpm run build:libs

RUN pnpm run build

FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*

ENV CRM_BACKEND=host.docker.internal:80
ENV CRM_WORKSPACE=""

COPY --from=build /app/dist/ep-crm-demo/browser /usr/share/nginx/html

COPY server/nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
