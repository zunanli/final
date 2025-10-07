const Koa = require('koa');
const Router = require('koa-router');
const serve = require('koa-static');
const path = require('path');

// 导入监控相关模块
const { register, webVitalsLCP, webVitalsFID, webVitalsCLS } = require('./metrics');
const { httpMonitoring } = require('./middlewares/monitoring');

const app = new Koa();
const router = new Router();

// 应用监控中间件（在其他中间件之前）
app.use(httpMonitoring());

// mount ssr middleware
require('./middlewares/ssr')(app);

// static assets: serve built client bundle under /static
const staticDir = path.join(process.cwd(), 'build/client');
app.use(serve(staticDir, { defer: false, maxage: 0 }));

// health and minimal api
router.get('/api/hello', async (ctx) => {
  ctx.body = { message: 'hello api1111111' };
});

// data api
router.get('/api/data', async (ctx) => {
  // 生成5000条测试数据
  const data = [];
  for (let i = 0; i < 5000; i++) {
    data.push({
      id: i + 1,
      name: `Item ${i + 1}`,
      value: Math.floor(Math.random() * 1000),
      description: `This is item number ${i + 1}`
    });
  }
  ctx.body = {
    success: true,
    data: data,
    total: data.length
  };
});

// SSR route as requested
router.get(['/h5(.*)'], async (ctx) => {
  const data = { title: 'Hello SSR', now: Date.now() };
  await ctx.ssr('pages/index/main', data);
});

// default redirect to /h5
router.get('/', (ctx) => {
  ctx.redirect('/h5');
});

// 监控指标端点
router.get('/metrics', async (ctx) => {
  ctx.set('Content-Type', register.contentType);
  ctx.body = await register.metrics();
});

// Web Vitals 数据上报端点
router.post('/api/report', async (ctx) => {
  try {
    const { name, value, rating, page } = ctx.request.body || {};
    
    if (!name || value === undefined) {
      ctx.status = 400;
      ctx.body = { error: 'Missing required fields: name, value' };
      return;
    }

    const valueInSeconds = value / 1000; // 转换为秒
    const pageName = page || 'unknown';
    const metricRating = rating || 'unknown';

    // 根据指标类型记录到对应的 Prometheus 指标
    switch (name.toUpperCase()) {
      case 'LCP':
        webVitalsLCP.labels(pageName, metricRating).observe(valueInSeconds);
        break;
      case 'FID':
        webVitalsFID.labels(pageName, metricRating).observe(valueInSeconds);
        break;
      case 'CLS':
        webVitalsCLS.labels(pageName, metricRating).observe(value); // CLS 不需要转换
        break;
      default:
        console.warn(`Unknown Web Vital metric: ${name}`);
    }

    ctx.body = { success: true, message: 'Metric recorded' };
  } catch (error) {
    console.error('Error recording Web Vital:', error);
    ctx.status = 500;
    ctx.body = { error: 'Internal server error' };
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

const port = process.env.PORT || 3000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`);
});


