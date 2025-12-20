const crypto = require('crypto');

// Generate APP_KEYS (3 keys)
const appKeys = Array(3).fill(0).map(() => crypto.randomBytes(16).toString('hex'));
console.log('APP_KEYS="' + appKeys.join(',') + '"');

// Generate other secrets
console.log('API_TOKEN_SALT=' + crypto.randomBytes(32).toString('hex'));
console.log('ADMIN_JWT_SECRET=' + crypto.randomBytes(32).toString('hex'));
console.log('TRANSFER_TOKEN_SALT=' + crypto.randomBytes(32).toString('hex'));
console.log('JWT_SECRET=' + crypto.randomBytes(32).toString('hex'));
console.log('ENCRYPTION_KEY=' + crypto.randomBytes(32).toString('hex'));
