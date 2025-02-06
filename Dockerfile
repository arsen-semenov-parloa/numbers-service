FROM node:22.11-alpine AS base

WORKDIR /usr/src/app
COPY . .

FROM base AS prod-deps

RUN --mount=type=cache,id=npm-cache,target=/root/.npm npm ci --production

FROM base AS build

RUN --mount=type=cache,id=npm-cache,target=/root/.npm npm ci
RUN npm run build

FROM node:22.11-alpine

WORKDIR /usr/src/app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=prod-deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

EXPOSE 3000
CMD [ "node", "dist/main" ]
