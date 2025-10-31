/**
 * 页面路由 - 包含路由定义和处理逻辑
 */
const Router = require('koa-router');

const router = new Router();

/**
 * SSR 页面渲染
 */
router.get('/h5(.*)', async (ctx) => {
  try {
    const data = { 
      title: 'Hello SSR', 
      now: Date.now(),
      path: ctx.path,
      userAgent: ctx.headers['user-agent'] || 'unknown'
    };
    await ctx.ssr('pages/index/main', data);
  } catch (error) {
    console.error('SSR rendering error:', error);
    ctx.status = 500;
    ctx.body = 'SSR rendering failed';
  }
});

/**
 * 首页重定向
 */
router.get('/', (ctx) => {
  ctx.redirect('/h5');
});

module.exports = router;