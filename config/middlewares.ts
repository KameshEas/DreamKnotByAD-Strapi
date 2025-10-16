const fs = require('fs');
const path = require('path');

// Try several likely locations for the middleware so this works locally and on deploy platforms like Render
const candidates = [
  path.resolve(__dirname, '..', 'dist', 'middlewares', 'https-redirect.js'),
  path.resolve(__dirname, '..', 'dist', 'src', 'middlewares', 'https-redirect.js'),
  path.resolve(__dirname, '..', 'src', 'middlewares', 'https-redirect.js'),
  path.resolve(__dirname, '..', 'middlewares', 'https-redirect.js'),
];

let middlewarePath = candidates.find((p) => fs.existsSync(p));
if (!middlewarePath) {
  // fallback to a relative resolve which Strapi will try to resolve from dist root
  middlewarePath = 'middlewares/https-redirect.js';
}

module.exports = [
  { resolve: middlewarePath },

  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'https://market-assets.strapi.io',
            'https://console.cloudinary.com',
            'https://res.cloudinary.com',
          ],
          'script-src': [
            "'self'",
            'https://media-library.cloudinary.com',
            'https://upload-widget.cloudinary.com',
            'https://console.cloudinary.com',
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'https://console.cloudinary.com',
            'https://res.cloudinary.com',
          ],
          'frame-src': [
            "'self'",
            'https://media-library.cloudinary.com',
            'https://upload-widget.cloudinary.com',
            'https://console.cloudinary.com',
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
