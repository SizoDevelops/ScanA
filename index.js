// server.js

const { createServer } = require('https')
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync(path.resolve(__dirname, 'E:/private-key.pem')),
  cert: fs.readFileSync(path.resolve(__dirname, 'E:/certificate.pem')),
};

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    const { pathname, query } = parsedUrl;

    handle(req, res, parsedUrl);
  }).listen(3002, (err) => {
    if (err) throw err;
    console.log('> Ready on https://localhost:3000');
  });
});
