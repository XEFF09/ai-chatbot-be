FROM node:20 AS builder

WORKDIR /usr/src/app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

COPY protos ./protos
COPY src/genproto ./src/genproto

RUN pnpm install

COPY . .
RUN pnpm run build


FROM node:20

WORKDIR /usr/src/app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/protos ./protos

EXPOSE 3000

CMD ["node", "dist/main"]
