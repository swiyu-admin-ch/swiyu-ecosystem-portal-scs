/**
 * Proxy config for redirecting relative /api calls to the backend running on port 8081
 *
 * @see https://github.com/chimurai/http-proxy-middleware#options
 */
module.exports = {
  "/api": {
    target: "http://localhost:8501",
    changeOrigin: true,
    secure: false,
    logLevel: "debug",
    pathRewrite: {
      "^/api": "/api",
    },
  },
};
