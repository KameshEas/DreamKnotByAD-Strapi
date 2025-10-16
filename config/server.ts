export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', process.env.PORT || 10000),
  app: {
    keys: env.array('APP_KEYS'),
  },
  url: env('RENDER_EXTERNAL_URL', 'https://dreamknottbyad-strapi.onrender.com'),
  proxy: true,
});
