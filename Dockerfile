FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci 

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .

RUN ./node_modules/.bin/nest build

RUN npm prune --production

FROM node:22-alpine AS production

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma 

EXPOSE 3000

CMD [ "node", "dist/main" ]