// src/middlewares/https-redirect.js
'use strict';

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    // If request protocol isn't HTTPS, set the forwarded proto header so Koa/Strapi treat the request as secure
    try {
      if (!ctx.request.header['x-forwarded-proto'] || ctx.request.header['x-forwarded-proto'] !== 'https') {
        ctx.request.header['x-forwarded-proto'] = 'https';
      }

      // Some frameworks rely on ctx.secure; override it when we detect the forwarded proto is https or when running behind Render
      const forwardedProto = (ctx.request.header['x-forwarded-proto'] || '').toLowerCase();
      if (forwardedProto === 'https' || process.env.RENDER === 'true' || process.env.RENDER === '1') {
        try {
          Object.defineProperty(ctx, 'secure', {
            configurable: true,
            enumerable: false,
            get() {
              return true;
            },
          });
        } catch (e) {
          // ignore - best effort
        }
      }
    } catch (e) {
      // ignore errors in middleware adjustments
    }

    await next();
  };
};
