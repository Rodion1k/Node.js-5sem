const http = require('http');
const fs = require('fs');
const sendEmail = require('./EmailSender');
const server = http.createServer((req, res) => {
    switch (req.url) {
        case '/':
            let file = fs.readFileSync('./index.html');
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(file);
            break;
        case '/sendMessage':
            let body = '';
            req.on('data', data => {
                body = JSON.parse(data);
            });
            req.on('end', () => {
                sendEmail("@mail.ru", "password", body.toEmail, body.message);
            });
            break;
    }

}).listen(3000, '' ,() => {
    console.log('Server is up on: http://localhost:3000');
});