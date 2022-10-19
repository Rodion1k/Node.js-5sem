const http = require('http');
const fs = require('fs');
const DataBaseManager = require('./DataBaseManager');
const db = new DataBaseManager();

db.on('GET', (request, response) => {
    console.log('GET');
    response.writeHead(200, {'Content-Type': 'application/json'});
    response.end(JSON.stringify(db.select()));
});
db.on('POST', (request, response) => {
    console.log('POST');
    request.on('data', async data => {
        let body = JSON.parse(data);
        await db.insert(body);
        response.end(JSON.stringify(db.select()));
    });
});

db.on('PUT', (request, response) => {
    console.log('PUT');
    request.on('data', async data => {
        let body = JSON.parse(data);
        await db.update(body.id, body);
        response.end(JSON.stringify(db.select()));
    });
});

db.on('DELETE', (request, response) => {
    console.log('DELETE');
    request.on('data', async data => {
        let body = JSON.parse(data);
        await db.delete(body.id);
        response.end(JSON.stringify(db.select()));
    });
});

http.createServer((req, resp) => {
    switch (req.url) {
        case '/':
            let file = fs.readFileSync('./index.html');
            resp.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            resp.end(file);
            break;
        case '/api/db':
            console.log('event');
            db.emit(req.method, req, resp);
            break;
        default:
            resp.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
            resp.end('404');
            break;
    }

}).listen(5000, '127.0.0.1', () => {
    console.log('server is started\n')
});