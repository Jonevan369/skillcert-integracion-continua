FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json ./server/package.json

RUN npm ci --omit=dev --workspace server

COPY server ./server

EXPOSE 4000

CMD ["sh", "-c", "npm run db:migrate -w server && npm run db:seed -w server && npm run start -w server"]
