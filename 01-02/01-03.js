const http = require('http');

let h = (r) => {
    let rc = '';
    for (let key in r.headers) rc += '<h3>' + key + ':' + r.headers[key] + '</h3>'
    return rc;
}

http.createServer((req, res) => {
    let b = '';
    req.on('data', str => {
        b += str;
        console.log('data', b);
    })
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    req.on('end', () => res.end(
        '<!DOCTYPE html> ' +
        '<html lang="en">' + '<head><title></title></head>' +
        '<body>' +
        '<h1>Структура запроса</h1>' +
        '<h2>' + 'метод: ' + req.method + '</h2>' +
        '<h2>' + 'url: ' + req.url + '</h2>' +
        '<h2>' + 'версия: ' + req.httpVersion + '</h2>' +
        '<h2>' + 'ЗАГОЛОВКИ: ' + '</h2>' +
        h(req) +
        '<h2>' + 'тело: ' + b + '</h2>' +
        '</body>' + '</html>'
    ))

}).listen(3001, "127.0.0.1", () => {
    console.log("Server is started")
})