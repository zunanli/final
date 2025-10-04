const React = require('react');
import { Button } from '@client/src/components/ui/button';

function Head({ title }) {
  return (
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>{title}</title>
    </head>
  );
}

function App({ title }) {
  return (
    <div id="container">
      <h1>{title}</h1>
      <p>This page is rendered on server.</p>
      <Button>Click Me (From Server)</Button>
      <div id="root" />
    </div>
  );
}

function Html({ data }) {
  const title = (data && data.title) || 'Hello SSR';
  return (
    <>
      <html lang="en">
        <Head title={title} />
        <body>
          <App title={title} />
          {/* 占位：CSR 入口占位，后续以 manifest/运行时替换为真实 client 产物 */}
          <script type="module" src="@clientsrc/pages/index/main.jsx" />
        </body>
      </html>
    </>
  );
}

module.exports = { default: Html };


