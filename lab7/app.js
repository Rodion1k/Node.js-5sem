import http from "http";
import url from "url";
import fs from "fs";
import {parseString} from 'xml2js';
import {sum, sub, mul, div} from "./modules/mathOperations.js";
import StaticResourceManager from "./modules/stat.js";
import xmlbuilder from "xmlbuilder";

const stat = new StaticResourceManager('./static');

const server = http.createServer();
const getHandler = (request, response) => {
    const parsedUrl = url.parse(request.url, true);
    let file;
    if (parsedUrl.pathname === '/') {
        file = fs.readFileSync('./static/hello.html');
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end(file);
    }
    if (parsedUrl.pathname === '/connection') {
        if (parsedUrl.query?.set) {
            server.keepAliveTimeout = +parsedUrl.query.set;
            response.writeHead(200, {'Content-Type': 'text/html'});
            response.end(`KeepAliveTimeout set to ${server.keepAliveTimeout}`);
        } else {
            response.writeHead(200, {'Content-Type': 'text/html'});
            response.end(`KeepAliveTimeout is ${server.keepAliveTimeout}`);
        }
    } else if (parsedUrl.pathname === '/headers') {
        let result = '<h1> Request headers </h1>';
        for (const [key, value] of Object.entries(request.headers)) {
            result += `<p>${key}: ${value}</p>`;
        }
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end(result);
    } else if (parsedUrl.pathname === '/parameter') {
        if (parsedUrl.query?.x && parsedUrl.query?.y) {
            let x = +parsedUrl.query.x, y = +parsedUrl.query.y;
            if (isNaN(x) || isNaN(y)) {
                response.writeHead(400, {'Content-Type': 'text/html'});
                response.end('Bad request');
                return;
            }
            response.writeHead(200, {'Content-Type': 'text/html'});
            response.end(getMethOperationsResult(x, y));
        }
    } else if (RegExp('^/parameter/\\d+/\\d+$').test(parsedUrl.pathname)) {
        let x = +parsedUrl.pathname.split('/')[2], y = +parsedUrl.pathname.split('/')[3];
        if (isNaN(x) || isNaN(y)) {
            response.writeHead(400, {'Content-Type': 'text/html'});
            response.end(request.url);
            return;
        }
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end(getMethOperationsResult(x, y));
    } else if (parsedUrl.pathname === '/files') {
        fs.readdir("./static", (err, files) => {
            response.setHeader("X-static-files-count", files.length);
            response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
            response.end(`X-static-files-count: ${files.length}`);
        });
    } else if (RegExp('^/files/.*$').test(parsedUrl.pathname)) {
        getStaticResource(request, response);
    } else if (parsedUrl.pathname === '/close') {// TODO: close sockets etc
        const time = 10000;
        setTimeout(() => {
            server.close();
        }, time);
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end(`Server will be closed in ${time / 1000} seconds`);
    } else if (parsedUrl.pathname === '/socket') {
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end(`ServerAddress: ${request.socket.localAddress}<br>
        ServerPort: ${request.socket.localPort}<br>
        ClientAddress: ${request.socket.remoteAddress}<br>
        ClientPort: ${request.socket.remotePort}<br> `);
    } else if (parsedUrl.pathname === '/req-data') {
        let result = '';
        request.on('data', (data) => {
            result += `PART:\n${data}\n`;
        });
        request.on('end', () => {
            response.writeHead(200, {'Content-Type': 'text/html'});
            response.end(result);
        });
    } else if (parsedUrl.pathname === '/resp-status') {//TODO check statuscode
        if (parsedUrl.query?.code && parsedUrl.query?.message) {
            response.statusCode = +parsedUrl.query.code;
            response.statusMessage = parsedUrl.query.message;
            response.end(`code: ${parsedUrl.query.code}, message: ${parsedUrl.query.message}`);
        }
    } else if (parsedUrl.pathname === '/upload') {
        response.writeHead(200, {'Content-type': 'text/html'});
        response.end('<form method="post" action="/upload" enctype="multipart/form-data">' +
            '<input type="file" name="file"/>' + '<br>' +
            '<input type="submit" value="send file"/>' +
            '</form>');
    }

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

            break;
        }
        case '/json': {
            let json = '';
            response.writeHead(200, {'Content-Type': 'application/json'});
            request.on('data', (data) => {
                json += data;
            });
            request.on('end', () => {
                let data = JSON.parse(json);
                let responseJson = {
                    "comment": data.comment,
                    "x_plus_y": sum(data.x, data.y),
                    "concatenation": data.message + ": " + data.author.name + " " + data.author.surname,
                    "length_m": data.mass.length,
                }
                response.end(JSON.stringify(responseJson));
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
                let data = '';
                parseString(xml, {trim: true}, (err, result) => {
                    if (err) {
                        console.log(err);
                    } else {
                        let xSum = 0;
                        result.request.x.forEach((p) => {
                            xSum += parseInt(p.$.value);
                        });
                        let mSum = '';
                        result.request.m.forEach((p) => {
                            mSum += p.$.value;
                        });
                        let xmlObj = xmlbuilder.create('response').att('id', result.request.$.id)
                            .ele('sum').att('element', 'x').att('result', xSum).up()
                            .ele('concat').att('element', 'm').att('result', mSum)
                            .end({pretty: true});
                        let responseXml = xmlObj.toString();
                        response.end(responseXml);
                    }
                });

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
server.listen(3000, '', () => {
    console.log('Server is running: http://localhost:3000');
}).on('error', (err) => {
    console.log(err);
}).on('request', httpRequestHandler);

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