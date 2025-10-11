const {
  nodejsMemoryHeapUsed,
  nodejsCpuUsage,
  nodejsUnhandledRejections,
  nodejsUncaughtExceptions,
  nodejsErrors,
  nodejsErrorRate,
  httpErrors,
  nodejsExternalApiErrors,
  httpRequestsTotal,
} = require('../metrics');

// 用于计算错误率的计数器
let totalRequests = 0;
let totalErrors = 0;

// 定期收集系统指标
function collectSystemMetrics() {
  // 收集内存使用情况
  const memUsage = process.memoryUsage();
  nodejsMemoryHeapUsed.set(memUsage.heapUsed);

  // 收集 CPU 使用情况
  const cpuUsage = process.cpuUsage();
  const cpuPercent = (cpuUsage.user + cpuUsage.system) / 1000000; // 转换为秒
  nodejsCpuUsage.set(cpuPercent);

  // 计算错误率
  if (totalRequests > 0) {
    const errorRate = (totalErrors / totalRequests) * 100;
    nodejsErrorRate.set(errorRate);
  }
}

// 每 5 秒收集一次系统指标
setInterval(collectSystemMetrics, 5000);

// 监听未处理的 Promise 拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  
  const reasonStr = reason ? reason.toString() : 'unknown';
  nodejsUnhandledRejections.inc({ reason: reasonStr });
  
  totalErrors++;
});

// 监听未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  
  const errorType = error.constructor.name || 'Error';
  nodejsUncaughtExceptions.inc({ error_type: errorType });
  
  totalErrors++;
  
  // 注意：在生产环境中，uncaughtException 后应该优雅地关闭进程
  // process.exit(1);
});

// 错误监控中间件
function errorMonitoring() {
  return async (ctx, next) => {
    totalRequests++;
    
    try {
      await next();
      
      // 检查 HTTP 错误状态码
      if (ctx.status >= 400) {
        const errorType = ctx.status >= 500 ? 'server_error' : 'client_error';
        httpErrors.inc({
          method: ctx.method,
          route: ctx.route?.path || ctx.path,
          status_code: ctx.status.toString(),
          error_type: errorType,
        });
        
        totalErrors++;
      }
    } catch (error) {
      console.error('Application Error:', error);
      
      // 记录应用错误
      const errorType = error.constructor.name || 'Error';
      const errorCode = error.code || error.status || 'unknown';
      
      nodejsErrors.inc({
        error_type: errorType,
        error_code: errorCode.toString(),
      });
      
      // 记录 HTTP 错误
      const statusCode = error.status || 500;
      httpErrors.inc({
        method: ctx.method,
        route: ctx.route?.path || ctx.path,
        status_code: statusCode.toString(),
        error_type: 'server_error',
      });
      
      totalErrors++;
      
      // 重新抛出错误，让其他错误处理中间件处理
      throw error;
    }
  };
}

// 外部 API 错误记录函数
function recordExternalApiError(apiName, errorType, statusCode = 'unknown') {
  nodejsExternalApiErrors.inc({
    api_name: apiName,
    error_type: errorType,
    status_code: statusCode.toString(),
  });
}

// 应用错误记录函数
function recordApplicationError(errorType, errorCode = 'unknown') {
  nodejsErrors.inc({
    error_type: errorType,
    error_code: errorCode.toString(),
  });
  totalErrors++;
}

module.exports = {
  errorMonitoring,
  recordExternalApiError,
  recordApplicationError,
  collectSystemMetrics,
};