// Explicitly indicate serverless execution environment
if (!process.env.VERCEL) {
  process.env.VERCEL = '1';
}

const app = require('../server/index');

module.exports = app;
