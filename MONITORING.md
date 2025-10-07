# 监控功能使用指南

本项目集成了 Prometheus + Grafana 监控解决方案，支持以下监控指标：

## 监控指标

### 系统指标
- CPU 使用率
- 内存使用量
- 进程启动时间

### HTTP 指标
- 请求总数 (`http_requests_total`)
- 请求响应时间 (`http_request_duration_seconds`)
- 按路由、方法、状态码分组

### SSR 性能指标
- 服务端渲染时间 (`ssr_render_duration_seconds`)

### Web Vitals 指标
- LCP (Largest Contentful Paint)
- FID (First Input Delay) 
- CLS (Cumulative Layout Shift)

## 开发环境使用

### 本地开发
```bash
# 启动开发服务器（包含监控功能）
pnpm dev

# 访问监控端点
curl http://localhost:3000/metrics
```

### Docker 开发环境
```bash
# 使用开发环境配置启动（本地构建镜像）
docker-compose -f docker-compose.dev.yml up --build -d

# 查看服务状态
docker-compose -f docker-compose.dev.yml ps

# 停止服务
docker-compose -f docker-compose.dev.yml down
```

### 访问监控界面
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)
- **应用监控端点**: http://localhost:3000/metrics

## 生产环境部署

生产环境使用标准的 `docker-compose.yml` 配置：

```bash
# 生产环境部署（使用预构建镜像）
docker-compose up -d
```

这种方式与现有的 CI/CD 流水线完全兼容，不会影响：
- GitHub Actions 构建流程
- 多架构镜像构建 (linux/amd64, linux/arm64)
- 镜像推送到 Docker Registry

## 配置文件说明

- `docker-compose.yml`: 生产环境配置，使用 `${IMAGE}:${TAG}` 环境变量
- `docker-compose.dev.yml`: 开发环境配置，使用本地构建 `build: .`
- `monitoring/prometheus.yml`: Prometheus 抓取配置
- `monitoring/grafana/provisioning/`: Grafana 数据源和仪表板配置

## 监控数据查询示例

### Prometheus 查询
```promql
# HTTP 请求率
rate(http_requests_total[5m])

# 平均响应时间
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])

# 错误率
rate(http_requests_total{status_code!~"2.."}[5m]) / rate(http_requests_total[5m])
```

### 测试监控功能
```bash
# 生成测试流量
for i in {1..100}; do 
  curl -s http://localhost:3000/api/hello > /dev/null
  curl -s http://localhost:3000/api/data > /dev/null
  curl -s http://localhost:3000/ > /dev/null
done

# 查看指标
curl -s http://localhost:3000/metrics | grep http_requests_total
```

## 故障排除

### 常见问题
1. **Prometheus 无法抓取数据**: 检查网络连接和端点可访问性
2. **Grafana 无法连接 Prometheus**: 确认数据源配置正确
3. **监控指标缺失**: 确认应用代码包含最新的监控功能

### 日志查看
```bash
# 查看应用日志
docker-compose logs app

# 查看 Prometheus 日志
docker-compose logs prometheus

# 查看 Grafana 日志
docker-compose logs grafana
```