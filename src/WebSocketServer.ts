import * as WebSocket from "ws";
// import ConnectionLogService from './models/ConnectionLog';

export default class WebSocketServer {
  private wss: WebSocket.Server;
  // private server: any;
  constructor(port: number) {
    this.wss = new WebSocket.Server({ port: port || 4444 });
  }

  start() {
    this.wss.on("connection", (ws: WebSocket) => {
      // send immediatly a feedback to the incoming connection
      ws.send("user connected");

      ws.on("error", function (e) {
        console.log(e);
      });

      // connection is up, let's add a simple simple event
      ws.on("message", (message: string) => {
        console.log(`Received -> ${message}`);

        if (message.includes("ConnectionId")) {
          this.wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(message);
            }
          });
        }
      });
    });

    this.wss.on("error", function (e) {
      console.log(e);
    });
  }
}
