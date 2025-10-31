const Koa = require('koa');
const serve = require('koa-static');
const bodyParser = require('koa-bodyparser');
const path = require('path');

// 导入中间件
const { httpMonitoring } = require('./middlewares/monitoring');
const { errorMonitoring } = require('./middlewares/nodeMonitoring');

// 导入路由
const { registerRoutes } = require('./controller');

const app = new Koa();

// 中间件配置
app.use(bodyParser());
app.use(httpMonitoring());
app.use(errorMonitoring());

// SSR 中间件
require('./middlewares/ssr')(app);

// 静态资源服务
const staticDir = path.join(process.cwd(), 'build/client');
app.use(serve(staticDir, { defer: false, maxage: 0 }));

// 注册所有路由
registerRoutes(app);

// 启动服务器
const port = process.env.PORT || 3000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});


