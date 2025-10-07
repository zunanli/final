const { httpRequestDuration, httpRequestsTotal, ssrRenderDuration } = require('../metrics');

/**
 * HTTP 请求监控中间件
 * 记录请求持续时间和请求总数
 */
function httpMonitoring() {
  return async (ctx, next) => {
    const start = Date.now();
    const startTime = process.hrtime();

    try {
      await next();
    } catch (error) {
      // 记录错误状态码
      ctx.status = error.status || 500;
      throw error;
    } finally {
      const duration = Date.now() - start;
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const durationInSeconds = seconds + nanoseconds / 1e9;

      // 获取路由信息（简化版）
      const route = ctx.path || 'unknown';
      const method = ctx.method;
      const statusCode = ctx.status.toString();

      // 记录指标
      httpRequestDuration
        .labels(method, route, statusCode)
        .observe(durationInSeconds);

      httpRequestsTotal
        .labels(method, route, statusCode)
        .inc();

      // 可选：在开发环境下打印监控信息
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Monitor] ${method} ${route} ${statusCode} - ${duration}ms`);
      }
    }
  };
}

/**
 * SSR 渲染时间监控
 * 用于记录服务端渲染的性能
 */
function ssrMonitoring(pageName) {
  return {
    start() {
      this.startTime = process.hrtime();
    },
    
    end() {
      if (this.startTime) {
        const [seconds, nanoseconds] = process.hrtime(this.startTime);
        const duration = seconds + nanoseconds / 1e9;
        
        ssrRenderDuration
          .labels(pageName || 'unknown')
          .observe(duration);
          
        if (process.env.NODE_ENV === 'development') {
          console.log(`[SSR Monitor] ${pageName} rendered in ${(duration * 1000).toFixed(2)}ms`);
        }
      }
    }
  };
}

module.exports = {
  httpMonitoring,
  ssrMonitoring,
};