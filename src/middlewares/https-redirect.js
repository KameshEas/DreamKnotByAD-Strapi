const httpsRedirect = (config, { strapi }) => {
  return async (ctx, next) => {
    if (ctx.request.header['x-forwarded-proto'] !== 'https') {
      ctx.request.header['x-forwarded-proto'] = 'https';
    }
    await next();
  };
};

export default httpsRedirect;
