FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json ./
RUN bun install --production

COPY src/ ./src/
COPY data/ ./data/

EXPOSE 4000

CMD ["bun", "run", "src/index.ts"]
