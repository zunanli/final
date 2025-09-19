const path = require('path');
const React = require('react');
const { renderToString } = require('react-dom/server');
const xss = require('xss');

// Minimal placeholders for optional version logic & logging to keep middleware robust
let versionConfig = null;
const mainJsRegex = /main\.js/g;
async function getVersionConfig() {
  versionConfig = {};
}
const LogHelper = {
  fatalError: (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
  },
};

module.exports = (app) => {
  if (!app || !app.context) {
    throw new Error('Parameter app is needed!');
  }

  const koaInstance = app;

  koaInstance.context.ssr = async function (ssrTemplatePath, model) {
    const ctx = this;
    const mergedContext = Object.assign(
      {
        env: process.env.NODE_ENV,
      },
      ctx.state || {},
      model || {},
    );

    const xssFilter = (targetObj) => {
      const safeObj = {};
      Object.keys(targetObj || {}).forEach((targetObjItem) => {
        const safeKey = xss(targetObjItem);
        const safeValue = targetObj[safeKey];
        safeObj[safeKey] = xss(safeValue);
      });

      return safeObj;
    };

    const safeMergedContext = xssFilter(mergedContext);
    const safeParams = xssFilter(ctx.query || {});

    ctx.set('X-Content-Type-Options', 'nosniff');

    try {
      const finalViewPath = path.join(process.cwd(), 'build/server/views', `${ssrTemplatePath}.js`);
      // eslint-disable-next-line import/no-dynamic-require, global-require
      const Component = require(finalViewPath)?.default;
      ctx.type = 'text/html';

      if (typeof Component !== 'string' && ctx.url !== '/favicon.ico') {
        let page = await renderToString(
          React.createElement(Component, { data: safeMergedContext, params: safeParams }, null),
        );
        const appVersion = model?.appVersion || safeParams.app_version;
        if (process.env.RB_USERID && appVersion) {
          if (!versionConfig) {
            await getVersionConfig();
          }
          const mainJs = versionConfig[appVersion];
          page = page.replace(mainJsRegex, mainJs).replace(/\\x3C/g, '<').replace(/\\x3E/g, '>');
        }
        ctx.body = `<!DOCTYPE html>${page}`;
      } else {
        ctx.body = Component;
      }
    } catch (e) {
      ctx.status = 503;
      ctx.body = 'SSRError!';
      // eslint-disable-next-line no-param-reassign
      e.message = `Error Message: ${e.message} | SSRError: `;
      LogHelper.fatalError(e);
    }
  };
};


