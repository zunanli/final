const path = require('path');
const fs = require('fs');
const React = require('react');
const { renderToString } = require('react-dom/server');
const xss = require('xss');

// 读取 manifest.json
const manifestPath = path.join(process.cwd(), 'build/client/.vite', 'manifest.json');
let manifest = {};
if (fs.existsSync(manifestPath)) {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
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
      const Component = require(finalViewPath)?.default;
      ctx.type = 'text/html';

      if (typeof Component !== 'string' && ctx.url !== '/favicon.ico') {
     
        let pageHtml = await renderToString(
          React.createElement(Component, { data: safeMergedContext, params: safeParams }, null),
        );

        // 从 manifest 中获取客户端入口文件的正确路径
        const entryName = 'src/pages/index/main.jsx';
        const clientEntry = manifest[entryName];

        if (clientEntry) {
          const scriptTag = `<script type="module" src="/${clientEntry.file}"></script>`;
          // 替换 HTML 中的占位符
          pageHtml = pageHtml.replace(
            '<script type="module" src="@clientsrc/pages/index/main.jsx"></script>',
            scriptTag
          );

          // 如果有 CSS 文件，也一并注入
          if (clientEntry.css) {
            clientEntry.css.forEach(cssFile => {
              const cssTag = `<link rel="stylesheet" href="/${cssFile}">`;
              pageHtml = pageHtml.replace('</head>', `${cssTag}</head>`);
            });
          }
        }

        ctx.body = `<!DOCTYPE html>${pageHtml}`;
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


