# 🚀 生产环境部署流程

## 📋 整体流程概览

### 第一步：准备配置文件
```bash
# 1. 复制环境配置模板
cp .env.production.docker .env.production

# 2. 编辑配置文件，填入真实值
vim .env.production
```

### 第二步：启动服务
```bash
# 使用生产环境配置启动
docker-compose -f docker-compose.production.yml --env-file .env.production up -d
```

## 🔧 配置文件详解

### 📁 文件结构
```
├── .env                           # 基础配置（镜像信息）
├── .env.production.docker         # 生产环境配置模板 ⭐
├── docker-compose.production.yml  # 生产环境服务编排 ⭐
└── mysql/init/01-init.sql         # 数据库初始化脚本 ⭐
```

### 🔄 执行时机详解

#### 1️⃣ `.env.production.docker` - 环境变量模板
**作用：** 定义所有生产环境需要的环境变量
**读取时机：** Docker Compose 启动时读取
**读取者：** `docker-compose.production.yml`

```bash
# 关键配置项
DB_HOST=mysql          # 数据库主机（容器名）
DB_NAME=production_db  # 数据库名
DB_USER=app_user       # 数据库用户
DB_PASSWORD=secure123  # 数据库密码
MYSQL_ROOT_PASSWORD=root123  # MySQL root 密码
```

#### 2️⃣ `mysql/init/01-init.sql` - 数据库初始化
**执行时机：** MySQL 容器 **首次启动** 时自动执行
**执行条件：** 
- 数据目录为空（全新安装）
- 文件挂载到 `/docker-entrypoint-initdb.d/`

```sql
-- 自动执行内容
CREATE TABLE IF NOT EXISTS users (...);  -- 创建表结构
INSERT IGNORE INTO users (...);          -- 插入初始数据
```

#### 3️⃣ `server/db.js` - 应用连接数据库
**读取时机：** Node.js 应用启动时
**读取变量：** 
```javascript
process.env.DB_HOST     // 从环境变量读取
process.env.DB_USER     // 运行时动态获取
process.env.DB_PASSWORD // 不写死在代码中
```

## 🔗 连接流程图

```
1. docker-compose 启动
   ↓
2. 读取 .env.production.docker
   ↓
3. 启动 MySQL 容器
   ↓
4. 执行 01-init.sql（仅首次）
   ↓
5. 启动 App 容器
   ↓
6. server/db.js 读取环境变量
   ↓
7. 连接到 MySQL 数据库
```

## ⚡ 快速部署命令

```bash
# 一键部署（推荐）
cp .env.production.docker .env.production && \
docker-compose -f docker-compose.production.yml --env-file .env.production up -d

# 查看服务状态
docker-compose -f docker-compose.production.yml ps

# 查看日志
docker-compose -f docker-compose.production.yml logs -f app
```

## 🔍 故障排除

### 数据库连接失败
```bash
# 检查 MySQL 容器状态
docker-compose -f docker-compose.production.yml logs mysql

# 检查环境变量
docker-compose -f docker-compose.production.yml config
```

### 初始化脚本未执行
```bash
# 删除数据卷重新初始化
docker-compose -f docker-compose.production.yml down -v
docker-compose -f docker-compose.production.yml up -d
```

## 🛡️ 安全提醒

1. **不要提交** `.env.production` 到版本控制
2. **定期更换** 数据库密码
3. **使用强密码** 至少 12 位字符
4. **生产环境** 启用 SSL 连接