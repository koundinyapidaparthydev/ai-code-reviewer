FROM node:20-alpine
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY prisma ./prisma
RUN npx prisma generate
COPY tsconfig.json ./
COPY src ./src
RUN mkdir -p logs uploads
EXPOSE 5000
# prisma db push on start; leave OPENAI_API_KEY empty for sandbox reviewer
CMD ["sh", "-c", "npx prisma db push && npx ts-node src/server.ts"]
