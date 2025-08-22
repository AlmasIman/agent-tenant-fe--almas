const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://aigent.kz',
      changeOrigin: true,
      secure: false,
      ws: false,
      logLevel: 'silent',
      pathRewrite: (path) => path,
      onProxyReq: (proxyReq, req) => {
        proxyReq.setHeader('Origin', 'https://aigent.kz');
        // Ensure HTTPS Referer so Django CSRF referer check passes
        proxyReq.setHeader('Referer', 'https://aigent.kz/');
      },
      onProxyRes: (proxyRes, req, res) => {
        const setCookie = proxyRes.headers['set-cookie'];
        if (Array.isArray(setCookie)) {
          proxyRes.headers['set-cookie'] = setCookie.map((cookie) => {
            // Drop Domain, Secure, HttpOnly and set SameSite=Lax so the browser accepts and readable on http://localhost
            return cookie
              .replace(/;\s*Domain=[^;]*/i, '')
              .replace(/;\s*Secure/i, '')
              .replace(/;\s*HttpOnly/i, '')
              .replace(/;\s*SameSite=[^;]*/i, '; SameSite=Lax');
          });
        }
      },
    }),
  );
};
