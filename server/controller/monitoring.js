/**
 * 监控路由 - 包含路由定义和处理逻辑
 */
const Router = require('koa-router');
const { getMetrics, getContentType, recordWebVital, validateWebVitalsData } = require('../services/monitoringService');

const router = new Router();

/**
 * 获取 Prometheus 指标
 */
router.get('/metrics', async (ctx) => {
  try {
    ctx.set('Content-Type', getContentType());
    ctx.body = await getMetrics();
  } catch (error) {
    console.error('Error getting metrics:', error);
    ctx.status = 500;
    ctx.body = { error: 'Failed to get metrics' };
  }
});

/**
 * 处理 Web Vitals 数据上报
 */
router.post('/api/report', async (ctx) => {
  try {
    const data = ctx.request.body || {};
    
    // 验证数据格式
    const validation = validateWebVitalsData(data);
    if (!validation.valid) {
      ctx.status = 400;
      ctx.body = { error: validation.error };
      return;
    }

    // 记录指标
    const { name, value, rating, page } = data;
    recordWebVital(name, value, rating, page);

    ctx.body = { 
      success: true, 
      message: 'Web Vital metric recorded successfully' 
    };
  } catch (error) {
    console.error('Error recording Web Vital:', error);
    ctx.status = 500;
    ctx.body = { 
      success: false, 
      error: 'Failed to record Web Vital metric' 
    };
  }
});

module.exports = router;