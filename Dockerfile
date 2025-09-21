# --- builder: 构建前端 ---
FROM node:18-alpine AS builder
WORKDIR /app
RUN corepack enable

# 仅拷贝必须文件，安装包含 devDependencies 的依赖以便构建
COPY package.json ./
RUN pnpm install --frozen-lockfile || pnpm install

# 拷贝前端代码并构建（Vite 配置位于 client/vite.config.mjs）
COPY client ./client
RUN pnpm run build


# --- runtime: 生产镜像 ---
FROM node:18-alpine
WORKDIR /app
RUN corepack enable

# 仅安装生产依赖
COPY package.json ./
RUN pnpm install --prod --frozen-lockfile || pnpm install --prod

# 拷贝服务端代码
COPY server ./server

# 拷贝构建产物：优先带上仓库中的 build（如包含 SSR 视图），再覆盖最新 client 构建
COPY build ./build
COPY --from=builder /app/build/client ./build/client

EXPOSE 3000
CMD ["node", "server/index.js"]


