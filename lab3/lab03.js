const http = require('http');
const url = require('url');
const fs = require("fs");
let appState = 'norm';
process.stdin.on('data', (data) => {
    let param = data.toString().trim();
    if (param === 'norm' || param === 'stop' || param === 'test' || param === 'idle') {
        process.stdout.write(appState + '->' + param + '\n');
        appState = param;
    } else if (param === 'exit')
        process.exit(0);
    else
        process.stdout.write('wrong state: ' + param);
})

function getFactorial(f) {
    return f <= 1 ? 1 : f * getFactorial(f - 1);
}

class Parser {
    constructor(string) {
        this.string = string;
    }

    parseToInt() {
        let parameter = url.parse(this.string, true).query.k;
        let clearParameter = parameter.trim();
        let regex = /^\d+$/;
        if (regex.test(clearParameter)) {
            return parseInt(clearParameter);
        }
        return NaN;

    }
}

const pushFactorial = (resp, number) => {
    if (Number.isInteger(number)) {
        resp.writeHead(200, {'Content-Type': 'application/json'});
        let kek = getFactorial(number);
        let el = JSON.stringify({k: number, fact: kek});
        resp.end(el);
    } else
        error(resp);
}
const error = (resp) => {
    resp.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
    resp.end('<h1> Error </h1>');
}

http.createServer((req, resp) => {
    let parser = new Parser(req.url);
    let number;
    switch (url.parse(req.url).pathname) {
        case '/fact':
            number = parser.parseToInt();
            pushFactorial(resp, number);
            break;
        case '/fact-tick':
            number = parser.parseToInt();
            process.nextTick(() => {
                pushFactorial(resp, number);
            });
            break;
        case '/fact-imm':
            number = parser.parseToInt();
            setImmediate(() => {
                pushFactorial(resp, number);
            });
            break;
        case '/imm':
            resp.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
            resp.end(fs.readFileSync('./03-04.html'));
            break;
        case '/tick':
            resp.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
            resp.end(fs.readFileSync('./03-04.html'));
            break;
        case '/':
            resp.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
            resp.end('<h1>' + appState + '</h1>');
            break;
        case '/recursive':
            resp.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
            resp.end(fs.readFileSync('./03-02.html'));
            break;
        default:
            error(resp);
            break;
    }

}).listen(5000, '127.0.0.1', () => {
    console.log('server is started\n')
});
