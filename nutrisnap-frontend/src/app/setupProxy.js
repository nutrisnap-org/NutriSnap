const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/',
    createProxyMiddleware({
      target: 'http://localhost:5000', // Replace with your Express server's address
      changeOrigin: true,
    })
  );
};