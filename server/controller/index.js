/**
 * 路由索引 - 统一导出所有路由
 */

const apiRoutes = require('./api');
const monitoringRoutes = require('./monitoring');
const pageRoutes = require('./pages');

/**
 * 注册所有路由到应用
 * @param {Object} app - Koa 应用实例
 */
function registerRoutes(app) {
  // 注册 API 路由
  app.use(apiRoutes.routes());
  app.use(apiRoutes.allowedMethods());

  // 注册监控路由
  app.use(monitoringRoutes.routes());
  app.use(monitoringRoutes.allowedMethods());

  // 注册页面路由（放在最后，避免覆盖其他路由）
  app.use(pageRoutes.routes());
  app.use(pageRoutes.allowedMethods());
}

module.exports = {
  registerRoutes,
  apiRoutes,
  monitoringRoutes,
  pageRoutes
};