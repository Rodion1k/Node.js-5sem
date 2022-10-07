const http = require('http');
const fs = require('fs');

http.createServer((req, resp) => {
    let htmlFile;
    switch (req.url) {
        case '/html':
            htmlFile = fs.readFileSync('./index.html')
            break;
        case '/png':
            htmlFile = fs.readFileSync('./welcome_background.svg')
            break;
        case '/api/name':
            resp.writeHead(200, {'Content-Type': 'text/plan; charset=utf-8'});
            resp.end('Вайсера Родион Леонидович');
            break;
        case '/xmlhttprequest':
            htmlFile = fs.readFileSync('./xmlhttprequest.html')
            break;
        case '/fetch':
            htmlFile = fs.readFileSync('./fetch.html')
            break;
        case '/jquery':
            htmlFile = fs.readFileSync('./jquery.html')
            break;
        default:
            resp.end('Error');
            break;
    }

    resp.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    resp.end(htmlFile);
}).listen(5000, '127.0.0.1', () => {
    console.log('Server is started')
})