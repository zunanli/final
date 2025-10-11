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

// Node.js 系统指标
const nodejsMemoryHeapUsed = new client.Gauge({
  name: 'nodejs_memory_heap_used_bytes',
  help: 'Process heap memory used in bytes',
});

const nodejsCpuUsage = new client.Gauge({
  name: 'nodejs_cpu_usage_percent',
  help: 'Process CPU usage percentage',
});

// 错误监控指标
const nodejsUnhandledRejections = new client.Counter({
  name: 'nodejs_unhandled_rejections_total',
  help: 'Total number of unhandled promise rejections',
  labelNames: ['reason'],
});

const nodejsUncaughtExceptions = new client.Counter({
  name: 'nodejs_uncaught_exceptions_total',
  help: 'Total number of uncaught exceptions',
  labelNames: ['error_type'],
});

const nodejsErrors = new client.Counter({
  name: 'nodejs_errors_total',
  help: 'Total number of application errors',
  labelNames: ['error_type', 'error_code'],
});

const nodejsErrorRate = new client.Gauge({
  name: 'nodejs_error_rate',
  help: 'Error rate (errors/total requests)',
});

const httpErrors = new client.Counter({
  name: 'http_errors_total',
  help: 'Total number of HTTP errors',
  labelNames: ['method', 'route', 'status_code', 'error_type'],
});

const nodejsExternalApiErrors = new client.Counter({
  name: 'nodejs_external_api_errors_total',
  help: 'Total number of external API errors',
  labelNames: ['api_name', 'error_type', 'status_code'],
});

// 注册所有自定义指标
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(webVitalsLCP);
register.registerMetric(webVitalsFID);
register.registerMetric(webVitalsCLS);
register.registerMetric(nodejsMemoryHeapUsed);
register.registerMetric(nodejsCpuUsage);
register.registerMetric(nodejsUnhandledRejections);
register.registerMetric(nodejsUncaughtExceptions);
register.registerMetric(nodejsErrors);
register.registerMetric(nodejsErrorRate);
register.registerMetric(httpErrors);
register.registerMetric(nodejsExternalApiErrors);

module.exports = {
  register,
  httpRequestDuration,
  httpRequestsTotal,
  webVitalsLCP,
  webVitalsFID,
  webVitalsCLS,
  nodejsMemoryHeapUsed,
  nodejsCpuUsage,
  nodejsUnhandledRejections,
  nodejsUncaughtExceptions,
  nodejsErrors,
  nodejsErrorRate,
  httpErrors,
  nodejsExternalApiErrors,
};