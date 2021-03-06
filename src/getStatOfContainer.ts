import * as http from "http";

const options = {
    socketPath: process.argv[2],
    path: process.argv[3],
    method: "GET",
};

const callback = (res: http.IncomingMessage) => {
    res.on("data", (data: Buffer) => {
        if (process.send) {
            process.send(data);
        }
    });
};

const clientRequest = http.request(options, callback);
clientRequest.end();
