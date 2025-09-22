# --- builder: 构建前端 ---
  FROM node:18-alpine AS builder
  WORKDIR /app
  RUN corepack enable
  
  # 仅拷贝必须文件，安装包含 devDependencies 的依赖以便构建
  COPY package.json ./
  # 优先使用 lockfile 安装，失败则回退到普通安装
  RUN pnpm install --frozen-lockfile || \
      pnpm install
  
  # 拷贝前端代码并构建（Vite 配置位于 client/vite.config.mjs）
  # 注意：这里需要拷贝所有需要构建的代码，包括 server/views 以便构建 SSR
  COPY client ./client
  COPY server ./server
  COPY package.json ./
  RUN pnpm run build
  
  
  # --- runtime: 生产镜像 ---
  FROM node:18-alpine
  WORKDIR /app
  RUN corepack enable
  
  # 仅安装生产依赖
  COPY package.json ./
  RUN pnpm install --prod --frozen-lockfile || \
      pnpm install --prod
  
  # 拷贝服务端代码
  COPY server ./server
  
  # 关键修复：从 builder 阶段拷贝完整的构建产物
  COPY --from=builder /app/build ./build
  
  EXPOSE 3000
  CMD ["node", "server/index.js"]
