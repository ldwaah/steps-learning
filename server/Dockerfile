FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src
RUN cp prisma/schema.postgresql.prisma prisma/schema.prisma && npx prisma generate
RUN npx tsc

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma
RUN cp prisma/schema.postgresql.prisma prisma/schema.prisma
EXPOSE 3001
CMD ["sh", "-c", "npm run db:prod:setup && node dist/index.js"]
