import http from "http";
import url from "url";
import fs from "fs";
import mp from "multiparty";
import {sum, sub, mul, div} from "./modules/mathOperations.js";
import StaticResourceManager from "./modules/stat.js";
import xmlResponse from "./modules/xmlOperations.js";
import jsonResponse from "./modules/jsonOperations.js";

const stat = new StaticResourceManager('./static');

const createResponse = (code, headers, data) => {
    return {
        code: code,
        headers: headers,
        data: data
    }
}
const getStaticResource = (request, response) => {
    let responseHeaders = {};
    if (stat.isStaticResource(request.url.split('.').pop(), request.url))
        responseHeaders = stat.getMimeHeader(request.url.split('.').pop());
    else {
        stat.whiteHttp404(request, response);
        return;
    }
    stat.sendFile(request, response, responseHeaders);
}

const getMethOperationsResult = (x, y) => {
    let result = '';
    result += `x + y = ${sum(x, y)} <br>`;
    result += `x - y = ${sub(x, y)} <br>`;
    result += `x * y = ${mul(x, y)} <br>`;
    result += `x / y = ${div(x, y)} <br>`;
    return result;
}
const codes = [100, 101, 102, 103,
    200, 201, 202, 203, 204, 205, 206, 207, 208, 226,
    300, 301, 302, 303, 304, 305, 306, 307, 308,
    400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 419, 421, 422, 423, 424, 425, 426, 428, 429, 431, 449, 451, 499,
    500, 501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511, 520, 521, 522, 523, 524, 525, 526
];

const checkStatusCode = code => codes.includes(code);

const getHandler = (request, response) => {
    let resp;
    const parsedUrl = url.parse(request.url, true);
    let file;
    if (parsedUrl.pathname === '/') {
        file = fs.readFileSync('./static/hello.html');
        resp = createResponse(200, {'Content-Type': 'text/html'}, file);
    } else if (parsedUrl.pathname === '/connection') {
        if (parsedUrl.query?.set) {
            server.keepAliveTimeout = +parsedUrl.query.set;
            resp = createResponse(200, {'Content-Type': 'text/html'}, `Keep-Alive timeout set to ${parsedUrl.query.set}`);
        } else {
            resp = createResponse(200, {'Content-Type': 'text/html'}, `Keep-Alive timeout is ${server.keepAliveTimeout}`);
        }
    } else if (parsedUrl.pathname === '/headers') {
        let result = '<h1> Request headers </h1>';
        for (const [key, value] of Object.entries(request.headers)) {
            result += `<p>${key}: ${value}</p>`;
        }
        resp = createResponse(200, {'Content-Type': 'text/html'}, result);
    } else if (parsedUrl.pathname === '/parameter') {
        if (parsedUrl.query?.x && parsedUrl.query?.y) {
            let x = +parsedUrl.query.x, y = +parsedUrl.query.y;
            if (isNaN(x) || isNaN(y)) {
                resp = createResponse(400, {'Content-Type': 'text/html'}, 'Bad request');
                return;
            }
            resp = createResponse(200, {'Content-Type': 'text/html'}, getMethOperationsResult(x, y));
        }
    } else if (RegExp('^/parameter/\\w+/\\w+$').test(parsedUrl.pathname)) {
        let x = +parsedUrl.pathname.split('/')[2], y = +parsedUrl.pathname.split('/')[3];
        if (isNaN(x) || isNaN(y)) {
            resp = createResponse(400, {'Content-Type': 'text/html'}, request.url);
            return;
        }
        resp = createResponse(200, {'Content-Type': 'text/html'}, getMethOperationsResult(x, y));
    } else if (parsedUrl.pathname === '/files') {
        let dir = fs.readdirSync('./static')
        resp = createResponse(200, {
            'Content-Type': 'text/html',
            'X-static-files-count': dir.length
        }, `X-static-files-count: ${dir.length}`);
    } else if (RegExp('^/files/.*$').test(parsedUrl.pathname)) {
        getStaticResource(request, response);
        return;
    } else if (parsedUrl.pathname === '/close') {// TODO: close sockets etc
        const time = 3000;
        let timer = setTimeout(() => {
            server.close(() => {
                console.log('Server closed');
            });
        }, time);
        resp = createResponse(200, {'Content-Type': 'text/html'}, `Server will be closed in ${time / 1000} s`);
    } else if (parsedUrl.pathname === '/socket') {
        resp = createResponse(200, {'Content-Type': 'text/html'}, `ServerAddress: ${request.socket.localAddress}<br>
        ServerPort: ${request.socket.localPort}<br>
        ClientAddress: ${request.socket.remoteAddress}<br>
        ClientPort: ${request.socket.remotePort}<br> `);
    } else if (parsedUrl.pathname === '/req-data') {
        let result = '';
        request.on('data', (data) => {
            result += `PART:\n${data}\n`;
        });
        request.on('end', () => {
            resp = createResponse(200, {'Content-Type': 'text/html'}, result);
        });
    } else if (parsedUrl.pathname === '/resp-status') {
        if (checkStatusCode(+parsedUrl.query.code) && parsedUrl.query?.message) {
            resp = createResponse(+parsedUrl.query.code, {'Content-Type': 'text/html'}, `code: ${parsedUrl.query.code}, message: ${parsedUrl.query.message}`);
            response.statusMessage = parsedUrl.query.message;
        } else {
            resp = createResponse(400, {'Content-Type': 'text/html'}, 'Bad request');
        }
    } else if (parsedUrl.pathname === '/upload') {
        resp = createResponse(200, {'Content-Type': 'text/html'}, '<form method="post" action="/upload" enctype="multipart/form-data">' +
            '<input type="file" name="file"/>' + '<br>' +
            '<input type="submit" value="send file"/>' +
            '</form>');
    } else {
        return;
    }
    response.writeHead(resp.code, resp.headers);
    response.end(resp.data);
}
const postHandler = (request, response) => {
    const parsedUrl = url.parse(request.url, true);
    switch (parsedUrl.pathname) {
        case '/formparameter': {
            let body = '';
            response.writeHead(200, {'Content-Type': 'text/html'});
            request.on('data', (data) => {
                body += data;
            });
            request.on('end', () => {
                response.end(body);
            });
            break;
        }
        case '/upload': {
            let form = new mp.Form({uploadDir: './static'});
            form.on('file', (field, file) => {

            });
            form.on('error', (err)=>{response.end('Not uploaded!')});
            form.on('close', () => {
                response.writeHead(200, {'Content-type': 'text/plain'});
                response.end("Uploaded!");
            });
            form.parse(request);
            break;
        }
        case '/json': {
            let json = '';
            response.writeHead(200, {'Content-Type': 'application/json'});
            request.on('data', (data) => {
                json += data;
            });
            request.on('end', () => {
                response.end(jsonResponse(json));
            });
            break;
        }
        case '/xml': {
            let xml = '';
            response.writeHead(200, {'Content-Type': 'text/xml'});
            request.on('data', (data) => {
                xml += data;
            });
            request.on('end', () => {
                response.end(xmlResponse(xml));
            });
            break;
        }
        default:
            response.writeHead(404, {'Content-Type': 'text/html'});
            response.end('Not found');
            break;
    }
}

const httpRequestHandler = (request, response) => {
    switch (request.method) {
        case 'GET':
            getHandler(request, response);
            break;
        case 'POST':
            postHandler(request, response);
            break;
        default:
            response.statusCode = 405;
            response.end();
            break;
    }
}

const server = http.createServer();
server.listen(3000, '', () => {
    console.log('Server is running: http://localhost:3000');
}).on('error', (err) => {
    console.log(err);
}).on('request', httpRequestHandler);



