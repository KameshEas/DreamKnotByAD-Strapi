// src/middlewares/https-redirect.js
'use strict';

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    // If request protocol isn't HTTPS, set it
    if (ctx.request.header['x-forwarded-proto'] !== 'https') {
      ctx.request.header['x-forwarded-proto'] = 'https';
    }

    await next();
  };
};
