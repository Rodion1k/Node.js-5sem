const http = require('http');
const fs = require('fs');
const DataBaseManager = require('./DataBaseManager');
const Statistic = require('./statistic');
const db = new DataBaseManager();
let stat = new Statistic();

const parser = (command) => {
    return command.substring(command.indexOf('(') + 1, command.indexOf(')'));
}
const checkCommand = (commandQuery) => {
    const commandRegex = /^sd\(\d*\)|^sc\(\d*\)|^ss\(\d*\)/;
    return commandRegex.test(commandQuery);
}
let sdTimer = null;
let scTimer = null;
let ssTimer = null;

const sdCommand = (param) => {
    clearTimeout(sdTimer);
    if (param === '') {
        process.stdout.write('rollback stop command\n');
        return;
    }
    sdTimer = setTimeout(() => {
        process.stdin.unref();
        server.close(() => {
            console.log('server is closed');
        });
    }, parseFloat(param) * 1000);
    sdTimer.unref();
}
const scCommand = (param) => {
    clearTimeout(scTimer);
    if (param === '') {
        process.stdout.write('rollback commit command\n');
        return;
    }
    scTimer = setInterval(() => {
        db.commit();
        stat.commitsCount++;
        process.stdout.write('commit\n');
    }, parseFloat(param) * 1000);
    scTimer.unref();
}

const ssCommand = (param) => {
    clearInterval(ssTimer);
    stat.startStatisticTime = Date.now();
    stat.endStatisticTime = null;
    stat.commitsCount = 0;
    stat.queriesCount = 0;
    if (param === '') {
        process.stdout.write('rollback ss command\n');
        return;
    }
    ssTimer = setTimeout(() => {
        stat.endStatisticTime = Date.now();
        process.stdout.write(stat.getTxtStatistic());
    }, parseFloat(param) * 1000);
    ssTimer.unref();
}


process.stdin.on('data', (data) => {
    cmdService(data);
})

const cmdService = (data) => {
    let command = data.toString().trim();
    if (!checkCommand(command)) {
        process.stdout.write('Wrong command\n');
        return;
    }
    const param = parser(command);
    switch (command.substring(0, 2)) {
        case 'sd':
            sdCommand(param);
            break;
        case 'sc':
            scCommand(param);
            break;
        case 'ss':
            ssCommand(param);
            break;
        default:
            console.log('Wrong command');
            break;
    }
}


db.on('GET', (request, response) => {
    console.log('GET');
    response.writeHead(200, {'Content-Type': 'application/json'});
    response.end(JSON.stringify(db.select()));
    stat.queriesCount++;
});
db.on('POST', (request, response) => {
    console.log('POST');
    request.on('data', data => {
        let body = JSON.parse(data);
        if (!db.insert(body)) {
            response.writeHead(400, {'Content-Type': 'application/json'});
            response.end(JSON.stringify({message: 'User with this id already exists'}));
            return;
        }
        response.writeHead(201, {'Content-Type': 'application/json'});
        response.end(JSON.stringify(db.select()));
        stat.queriesCount++;
    });
});

db.on('PUT', (request, response) => {
    console.log('PUT');
    request.on('data', data => {
        let body = JSON.parse(data);

        if (!db.update(body.id, body)) {
            response.writeHead(400, {'Content-Type': 'application/json'});
            response.end(JSON.stringify({message: 'User with this id does not exist'}));
            return;
        }
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.end(JSON.stringify(db.select()));
        stat.queriesCount++;
    });
});

db.on('DELETE', (request, response) => {
    console.log('DELETE');
    request.on('data', data => {
        let body = JSON.parse(data);
        if (!db.delete(body.id)) {
            response.writeHead(400, {'Content-Type': 'application/json'});
            response.end(JSON.stringify({message: 'User with this id does not exist'}));
            return;
        }
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.end(JSON.stringify(db.select()));
        stat.queriesCount++;
    });
});

const server = http.createServer((req, resp) => {
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
        case '/api/ss':
            resp.writeHead(200, {'Content-Type': 'application/json'});
            resp.end(stat.getJsonStatistic());
            break;
        default:
            resp.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
            resp.end('404');
            break;
    }

}).listen(5000, '127.0.0.1', () => {
    console.log('server is started:  http://localhost:5000\n')
});