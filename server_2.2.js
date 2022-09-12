const http = require('http');
      url=require('url'),
      fs = require('fs');


http.createServer((request, response) => {

let addr = request.url;
let q = url.parse(addr,true);
filePath = '';

console.log(addr);
console.log(q.host);
console.log(q.pathname);
console.log(q.search);

if (q.pathname.includes('documentation')) {
   filePath = (__dirname + '/documentation.html');
 } else {
   filePath = 'index.html';
 };


 fs.appendFile('log.txt', 'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n', (err) => {
   if (err) {
     console.log(err);
   } else {
     console.log('Added to log.');
   };
 });


response.writeHead(200, {'Content-Type': 'text/plain'});
fs.readFile(filePath, (err, data) => {
     if (err) {
       throw err;
     }

     response.writeHead(200, { 'Content-Type': 'text/html' });
     response.write(data);
     response.end();
   });

}).listen(8080);
console.log('My test server is running on Port 8080.');
