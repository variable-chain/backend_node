import Express from "express";
import * as http from "http";
import mongoose from "mongoose";

const app = new Express();
const server = http.Server(app);

//**************Web socket *****************/
const WebSocket = require('websocket');
const WebSocketServer = WebSocket.server;
const WebSocketClient = WebSocket.client;
const client = new WebSocketClient();
const wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false,
    maxReceivedFrameSize: 64 * 1024 * 1024,   // 64MiB
    maxReceivedMessageSize: 64 * 1024 * 1024, // 64MiB
    fragmentOutgoingMessages: false,
    keepalive: false,
    disableNagleAlgorithm: false
});

//***************************** WebSocket services *******************/
import websocketController from '../controller/webSocketController';
/********************************************************************/


class ExpressServer {
    constructor() {

    }

    configureDb(dbUrl) {
        return new Promise((resolve, reject) => {
            mongoose.connect(
                dbUrl,
                {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                },
                (err) => {
                    if (err) {
                        console.log(`Error in mongodb connection ${err.message}`);
                        return reject(err);
                    }
                    console.log("Mongodb connection established");
                    return resolve(this);
                }
            );
        });
    }

    listen(port) {
        server.listen(port, () => {
            console.log(`Secure app is listening @port ${port} 🌎`);
        });
        return app;
    }
}


export default ExpressServer;




wsServer.on('request', function (request) {
    if (!originIsAllowed(request.origin)) {
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }
    const connection = request.accept('', request.origin);
    connection.on('message', function (message) {
        var type = JSON.parse(message.utf8Data);
        if (type.requestType === "exchange_list") {
            getExchangeList();
        }
        if (type.requestType === "pair_details") {
            pairDetailsData(type.pairId);
        }

        if (type.requestType === "order_details") {
            activePostions(type.pairId);
        }


    });

    async function getExchangeList() {
        if (connection.connected) {
            const result = await websocketController.getExchangeList();
            if (result) {
                const data = JSON.stringify(result);
                connection.sendUTF(data);
            }
            setTimeout(() => {
                getExchangeList()
            }, 1000);
        }
    }

    async function pairDetailsData(pairId) {
        if (connection.connected) {
            const result = await websocketController.pairDetails(pairId);
            if (result) {
                const data = JSON.stringify(result);
                connection.sendUTF(data);
            }
            setTimeout(() => {
                pairDetailsData(pairId)
            }, 1000);
        }
    }

    async function activePostions(pairId) {
        if (connection.connected) {
            const result = await websocketController.activeOrders(pairId);
            if (result) {
                const data = JSON.stringify(result);
                connection.sendUTF(data);
            }
            setTimeout(() => {
                activePostions(pairId)
            }, 1000);
        }
    }



    //******************************************************************************************/
    connection.on('close', function (reasonCode, description) {
        console.log(new Date() + ' Peer ' + connection.remoteAddress + ' Client has disconnected.');
    });
    connection.on('connectFailed', function (error) {
        console.log('Connect Error: ' + error.toString());
    });
});

client.on('connect', function (connection) {
    console.log(new Date() + ' WebSocket Client Connected');
    connection.on('error', function (error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function () {
        console.log('echo-protocol Connection Closed');
    });

});

// client.connect('ws://localhost:3002/', '');


function originIsAllowed(origin) {
    return true;
}
