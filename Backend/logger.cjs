const http = require('http');
http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.url.startsWith('/log?data=')) {
    console.log('FRONTEND LOG:', decodeURIComponent(req.url.slice(10)));
  }
  res.end('OK');
}).listen(9999, () => console.log('Logger listening on 9999'));
