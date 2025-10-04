const Koa = require('koa');
const Router = require('koa-router');
const serve = require('koa-static');
const path = require('path');

const app = new Koa();
const router = new Router();

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

app.use(router.routes());
app.use(router.allowedMethods());

const port = process.env.PORT || 3000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`);
});


