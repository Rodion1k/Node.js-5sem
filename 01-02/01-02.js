const http = require('http');

http.createServer((req,res)=>{
    res.writeHead(200,{'Content-Type':'text/html'});
    res.end('<h1>Hello world!</h1>\n');

}).listen(3000,"127.0.0.1",()=>{
    console.log("Server is started")
})