FROM oven/bun:latest

COPY package.json ./
COPY bun.lock ./
COPY src ./src
COPY tsconfig.json ./

RUN bun install
RUN bun src/build.ts
RUN mv dist/** .

CMD ["bun", "run", "start.js"]
