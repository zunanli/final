# 极简全栈 Koa + React SSR 项目

本项目是一个极简的、生产就绪的全栈应用模板，后端采用 Koa.js，前端为支持服务器端渲染（SSR）的 React，整体由 Vite 驱动。项目包含一套完整的、自动化的 CI/CD 流水线，使用 GitHub Actions、Docker 和 Nginx（用于反向代理和 SSL 终止）。

## 核心技术

- **后端**: [Koa.js](https://koajs.com/)
- **前端**: [React](https://reactjs.org/)
- **构建工具**: [Vite](https://vitejs.dev/)
- **包管理器**: [pnpm](https://pnpm.io/)
- **容器化**: [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- **CI/CD**: [GitHub Actions](https://github.com/features/actions)
- **反向代理**: [Nginx](https://nginx.org/)
- **SSL/TLS**: [Let's Encrypt](https://letsencrypt.org/) 与 [Certbot](https://certbot.eff.org/)

## 项目结构

```
.
├── .github/workflows/deploy.yml  # GitHub Actions CI/CD 工作流
├── client/                       # 前端 React 应用
│   ├── src/                      # 源代码
│   └── vite.config.mjs           # 客户端构建的 Vite 配置
├── server/                       # 后端 Koa 应用
│   ├── index.js                  # Koa 服务器入口文件
│   ├── middlewares/ssr.js        # SSR 中间件
│   ├── views/                    # 用于 SSR 的 React 组件
│   └── vite.ssr.config.mjs       # SSR 构建的 Vite 配置
├── scripts/                      # 部署与工具脚本
│   ├── build-and-push.sh         # 构建并推送 Docker 镜像
│   ├── deploy.sh                 # 在服务器上部署应用
│   ├── issue-cert.sh             # 签发 SSL 证书
│   └── renew-cert.sh             # 续订 SSL 证书
├── Dockerfile                    # 用于生产环境的多阶段 Dockerfile
├── docker-compose.yml            # 用于生产环境服务的 Docker Compose 配置
├── nginx/nginx.conf              # Nginx 配置文件
└── package.json                  # 项目依赖与脚本
```

## 构建流程

项目使用 Vite 进行客户端和服务器端打包，由 `package.json` 中定义的 `pnpm` 脚本管理。

1.  **`pnpm run build:client`**: 将 `client/` 目录下的 React 应用编译为 `build/client/` 目录下的静态资源包。这包括 JavaScript、CSS 和一个用于资源映射的 `manifest.json` 文件。
2.  **`pnpm run build:ssr`**: 将 `server/views/` 目录下的 JSX 组件转换为 CommonJS 模块，存放在 `build/server/views/`，使其能在 Node.js 环境中用于服务器端渲染。
3.  **`pnpm run build`**: 按顺序执行 `build:client` 和 `build:ssr`，以创建完整的构建产物。

## 部署原理与 CI/CD 工作流

本项目实现了一套完全自动化的部署流水线。当代码被推送到 `main` 分支时，GitHub Actions 会协调从构建镜像到在服务器上部署的整个过程。

### 1. Docker化（容器化）

为保证一致性和可移植性，应用被容器化。

- **`Dockerfile`**: 使用多阶段构建（multi-stage `Dockerfile`）来创建优化的生产镜像。
    - **构建器阶段 (Builder Stage)**: 在此阶段，安装所有依赖（包括 `devDependencies`），并使用 `pnpm run build` 构建应用。
    - **运行阶段 (Runtime Stage)**: 此阶段从一个干净的 Node.js 基础镜像开始，仅拷贝生产依赖（`node_modules`）、服务器代码以及从 `builder` 阶段构建的产物。这使得最终的镜像更小、更安全。
- **`docker-compose.yml`**: 此文件为生产环境定义了两个服务：
    - `app`: 从构建好的 Docker 镜像运行 Koa.js 应用。
    - `nginx`: 运行 Nginx 反向代理。它被配置为依赖于 `app` 服务。

### 2. 使用 GitHub Actions 实现 CI/CD

工作流在 `.github/workflows/deploy.yml` 中定义：

1.  **触发器**: 工作流在每次 `push` 到 `main` 分支时运行。
2.  **构建**: 它会检出代码，设置 Docker Buildx（用于多架构支持），登录到 Docker Hub，并运行 `docker/build-push-action`。此操作使用 `Dockerfile` 构建 Docker 镜像，并将其推送到 Docker Hub，附带两个标签：`latest` 和 Git 提交的 SHA 值。
3.  **部署**: 然后，它使用 SSH 操作连接到生产服务器并执行部署脚本。该脚本会拉取最新的代码和新的 Docker 镜像，然后使用 `docker compose up -d` 重启服务。

### 3. Nginx 反向代理与 SSL/TLS 终止

Nginx 位于 Node.js 应用之前，处理所有传入的流量。

- **角色**: 它作为反向代理，将请求转发到 Docker 网络内运行在 `http://app:3000` 的 `app` 服务。
- **SSL/TLS 终止**: Nginx 负责处理 HTTPS。它终止 SSL/TLS 连接，即解密传入的 HTTPS 流量，并将其作为普通的 HTTP 流量转发给应用。这为 Node.js 应用卸载了加密计算的负担。

### 4. 使用 Let's Encrypt 管理 SSL 证书

整个 SSL 证书生命周期通过 Let's Encrypt（一个免费、自动化的证书颁发机构, CA）和 `certbot` 客户端实现自动化。

#### Nginx 如何访问 SSL 证书

`docker-compose.yml` 文件配置了一个卷映射，使 `nginx` 容器能够以只读方式访问存储在宿主机上的 SSL 证书。

```yaml
# docker-compose.yml
services:
  nginx:
    # ...
    volumes:
      # 将宿主机的 letsencrypt 目录挂载到容器中
      - /etc/letsencrypt:/etc/letsencrypt:ro
```

然后，`nginx.conf` 文件使用容器内的路径来引用这些证书：

```nginx
# nginx/nginx.conf
server {
  listen 443 ssl;
  # ...
  ssl_certificate     /etc/letsencrypt/live/oo0x0oo.click/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/oo0x0oo.click/privkey.pem;
  # ...
}
```
这种设置可以安全地将证书提供给 Nginx，而无需将它们存储在 Docker 镜像内部。

#### 如何签发 SSL 证书 (ACME `http-01` 质询)

`scripts/issue-cert.sh` 脚本自动化了首次获取证书的过程。以下是该过程详细的底层剖析：

1.  **启动**: 通过运行 `sudo ./scripts/issue-cert.sh` 启动该过程。此脚本使用 `certonly` 和 `--webroot` 选项执行 `certbot` 命令。

2.  **Certbot 与 Let's Encrypt 通信**:
    - `certbot` 连接 Let's Encrypt API，并为您的域名（例如 `oo0x0oo.click`）请求证书。
    - Let's Encrypt 的服务器会返回一个“质询”——一个唯一的令牌。为了证明您控制该域名，您必须在服务器上的特定 URL 使此令牌可用。

3.  **`http-01` 质询**:
    - Let's Encrypt 会要求 `certbot` 将令牌放置在特定路径：`http://oo0x0oo.click/.well-known/acme-challenge/<TOKEN_FILENAME>`。
    - `certbot` 使用 `--webroot -w /var/www/certbot` 参数，在宿主机的 `/var/www/certbot/.well-known/acme-challenge/` 目录内创建一个包含令牌内容的文件。

4.  **CA 如何验证质询**:
    - 这是 Nginx 配置和 Docker 卷挂载变得至关重要的地方。
    - `docker-compose.yml` 文件将宿主机目录 `/var/www/certbot` 映射到 `nginx` 容器内的 `/var/www/certbot` 目录。
        ```yaml
        # docker-compose.yml
        volumes:
          - /var/www/certbot:/var/www/certbot
        ```
    - `nginx.conf` 有一个特殊的 `location` 块来处理对质询目录的请求：
        ```nginx
        # nginx/nginx.conf
        location /.well-known/acme-challenge/ {
          root /var/www/certbot;
        }
        ```
    - 当 Let's Encrypt 服务器向 `http://oo0x0oo.click/.well-known/acme-challenge/<TOKEN_FILENAME>` 发出 HTTP 请求时，Nginx 会接收到它。
    - `location` 块匹配此请求路径。然后，Nginx 直接从其容器内的 `/var/www/certbot` 目录提供令牌文件，该目录映射到 `certbot` 放置文件的宿主机目录。

5.  **签发**:
    - 一旦 Let's Encrypt 成功检索到令牌并验证其与预期值匹配，它就确认您控制该域名。
    - 然后，CA 签署您的证书，`certbot` 会下载它，并将证书文件（包括 `fullchain.pem` 和 `privkey.pem`）放入宿主机的 `/etc/letsencrypt/live/oo0x0oo.click/` 目录中。
    - 最后，脚本运行 `docker exec nginx_proxy nginx -s reload`，使 Nginx 重新加载其配置并开始使用新证书，而无需停机。

#### 如何续订证书

来自 Let's Encrypt 的 SSL 证书有效期为 90 天。`scripts/renew-cert.sh` 脚本旨在定期运行（例如，通过 cron 作业）以自动续订。

- 它运行 `certbot renew`，该命令会检查所有已安装的证书，并自动续订任何即将到期的证书。
- 续订过程使用与初始签发相同的 `http-01` 质询机制。
- 如果证书成功续订，脚本会重新加载 Nginx 以应用新证书。