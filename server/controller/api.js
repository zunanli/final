/**
 * API 路由 - 包含路由定义和处理逻辑
 */
const Router = require('koa-router');
const { generateTestData, getDataStats } = require('../services/dataService');

const router = new Router();

/**
 * 健康检查接口
 */
router.get('/api/hello', async (ctx) => {
  ctx.body = { 
    message: 'hello api',
    timestamp: new Date().toISOString(),
    status: 'ok'
  };
});

/**
 * 获取测试数据
 */
router.get('/api/data', async (ctx) => {
  try {
    const { count = 5000 } = ctx.query;
    const dataCount = Math.min(parseInt(count) || 5000, 10000); // 限制最大数据条数
    
    const data = generateTestData(dataCount);
    const stats = getDataStats(data);
    
    ctx.body = {
      success: true,
      data: data,
      total: data.length,
      stats: stats
    };
  } catch (error) {
    console.error('Error generating data:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Failed to generate data'
    };
  }
});

module.exports = router;