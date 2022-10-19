import fs from "fs";

class StaticResourceManager {
    constructor(staticFolder) {
        this.staticFolder = staticFolder;
    }

    meme = {
        'html': 'text/html',
        'css': 'text/css',
        'js': 'text/javascript',
        'jpg': 'image/jpg',
        'json': 'application/json',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'mp4': 'video/mp4',
        'xml': 'text/xml'
    }


    whiteHttp404(request, response) {
        response.writeHead(404, {'Content-Type': 'text/html'});
        response.end(`{"error": "Resource ${request.url} not found, HTTP status code: 404, method: ${request.method}"}`);
    }

    pipeFile(request, response, headers) {
        response.writeHead(200, headers);
        let readStream = fs.createReadStream(this.staticFolder + request.url.replace('/files', ''));
        readStream.on('open', () => {
            readStream.pipe(response);
        });

        readStream.on('error', (err) => {
            response.end(err);
        });

    }

    getMimeHeader(extension) {
        return `{Content-Type: ${this.meme[extension]}}`;
    }

    sendFile(request, response, headers) {
        fs.access(this.staticFolder + request.url.replace('/files', ''), fs.constants.R_OK, (err) => {
            if (err)
                this.whiteHttp404(request, response);
            else
                this.pipeFile(request, response, headers);

        });
    }

    isStaticResource(extension, reqFile) {
        let reg = new RegExp(`^.*\\.${extension}$`);
        return reg.test(reqFile);
    }

}

export default StaticResourceManager;