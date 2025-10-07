const client = require('prom-client');

// 清除默认注册表，避免自动收集系统指标
client.register.clear();

// 创建自定义指标注册表（不包含默认系统指标）
const register = new client.Registry();

// 如果需要系统指标，可以选择性添加特定指标
// client.collectDefaultMetrics({
//   register,
//   prefix: 'koa_ssr_',
// });

// HTTP 请求持续时间直方图
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10], // 响应时间分桶
});

// HTTP 请求总数计数器
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

// Web Vitals 指标
const webVitalsLCP = new client.Histogram({
  name: 'web_vitals_lcp_seconds',
  help: 'Largest Contentful Paint in seconds',
  labelNames: ['page', 'rating'],
  buckets: [0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 10],
});

const webVitalsFID = new client.Histogram({
  name: 'web_vitals_fid_seconds',
  help: 'First Input Delay in seconds',
  labelNames: ['page', 'rating'],
  buckets: [0.01, 0.05, 0.1, 0.2, 0.3, 0.5, 1],
});

const webVitalsCLS = new client.Histogram({
  name: 'web_vitals_cls_score',
  help: 'Cumulative Layout Shift score',
  labelNames: ['page', 'rating'],
  buckets: [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.5, 1],
});

// 注册所有自定义指标
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(webVitalsLCP);
register.registerMetric(webVitalsFID);
register.registerMetric(webVitalsCLS);

module.exports = {
  register,
  httpRequestDuration,
  httpRequestsTotal,
  webVitalsLCP,
  webVitalsFID,
  webVitalsCLS,
};